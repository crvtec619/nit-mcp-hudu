import type { HuduPagedResponse } from "./types";

// Cloudflare WAF in front of docs.networkzit.com blocks requests with the default
// undici/Workers User-Agent. An identified bot UA passes; without this the API
// returns 403 with a Cloudflare HTML interstitial instead of JSON.
const USER_AGENT = "nit-mcp-hudu/1.0 (+https://github.com/Networkz-IT/nit-mcp-hudu)";

/**
 * Strip query string and numeric IDs from an endpoint so log cardinality
 * stays bounded (e.g. "companies/64/assets?page=2" -> "companies/:id/assets").
 */
function normalizeEndpoint(endpoint: string): string {
  return endpoint.split("?")[0].replace(/\/\d+/g, "/:id");
}

function logHuduCall(
  method: string,
  endpoint: string,
  status: number,
  durationMs: number
): void {
  console.log(
    JSON.stringify({
      type: "hudu_api",
      method,
      endpoint: normalizeEndpoint(endpoint),
      status,
      durationMs,
    })
  );
}

/**
 * Parse JSON safely, throwing a contextual error on failure.
 */
function safeJsonParse<T>(text: string, endpoint: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    console.error(`[hudu] Non-JSON response for ${endpoint} (${text.length} bytes)`);
    throw new Error(
      `Hudu returned a non-JSON response for ${endpoint}. The server may be under maintenance.`
    );
  }
}

/**
 * Make a GET request to the Hudu API.
 * Hudu uses a static x-api-key header (no OAuth token flow).
 */
export async function huduFetch<T>(
  env: Env,
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  if (!env.HUDU_API_KEY) {
    throw new Error(
      "HUDU_API_KEY is not set. Push it as an encrypted secret in Cloudflare Dashboard."
    );
  }

  const url = new URL(`${env.HUDU_BASE_URL}/${endpoint}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const start = Date.now();
  const response = await fetch(url.toString(), {
    headers: {
      "x-api-key": env.HUDU_API_KEY,
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
    },
  });

  const text = await response.text();
  logHuduCall("GET", endpoint, response.status, Date.now() - start);

  if (response.status === 429) {
    throw new Error(
      "Hudu rate limit exceeded (300 req/min). Try again in a moment."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Hudu API request failed (${response.status}) for ${endpoint}. Check the resource ID and try again.`
    );
  }

  return safeJsonParse<T>(text, endpoint);
}

/**
 * Make a POST/PUT/DELETE request to the Hudu API.
 */
export async function huduMutate<T>(
  env: Env,
  method: "POST" | "PUT" | "DELETE",
  endpoint: string,
  body?: Record<string, unknown>
): Promise<T> {
  if (!env.HUDU_API_KEY) {
    throw new Error(
      "HUDU_API_KEY is not set. Push it as an encrypted secret in Cloudflare Dashboard."
    );
  }

  const url = new URL(`${env.HUDU_BASE_URL}/${endpoint}`);

  const start = Date.now();
  const response = await fetch(url.toString(), {
    method,
    headers: {
      "x-api-key": env.HUDU_API_KEY,
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  logHuduCall(method, endpoint, response.status, Date.now() - start);

  if (response.status === 429) {
    throw new Error(
      "Hudu rate limit exceeded (300 req/min). Try again in a moment."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Hudu API request failed (${response.status}) for ${method} ${endpoint}. Check the resource ID and try again.`
    );
  }

  if (!text || text.trim() === "") {
    return null as T;
  }

  return safeJsonParse<T>(text, endpoint);
}

/**
 * Fetch a paginated list from Hudu.
 *
 * Hudu paginates at 25 results per page via ?page=X (1-indexed).
 * There is no total count in the response, so we determine "has more"
 * by checking if a full page (25 items) was returned.
 */
export async function huduFetchPaged<T>(
  env: Env,
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  page: number = 1
): Promise<HuduPagedResponse<T>> {
  const raw = await huduFetch<unknown>(env, endpoint, {
    ...params,
    page,
  });

  let records: T[] = [];

  if (Array.isArray(raw)) {
    records = raw as T[];
  } else if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    // Derive the expected key from the endpoint (e.g. "companies/123/assets" -> "assets")
    const segments = endpoint.replace(/\/\d+/g, "").split("/");
    const expectedKey = segments[segments.length - 1];

    if (expectedKey && Array.isArray(obj[expectedKey])) {
      records = obj[expectedKey] as T[];
    } else {
      // Fallback: find the first array value
      for (const [, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          records = value as T[];
          break;
        }
      }
    }
  }

  const hasMore = records.length === 25;

  return {
    records,
    page,
    hasMore,
  };
}

/**
 * Auto-paginate: fetch all pages up to a maximum number of records.
 * Useful for QBR automation where you need complete inventories.
 * Default cap: 500 records (20 pages).
 */
export async function huduFetchAll<T>(
  env: Env,
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  maxRecords: number = 500
): Promise<T[]> {
  const allRecords: T[] = [];
  let page = 1;
  const maxPages = Math.ceil(maxRecords / 25);

  while (page <= maxPages) {
    const result = await huduFetchPaged<T>(env, endpoint, params, page);
    allRecords.push(...result.records);

    if (!result.hasMore || allRecords.length >= maxRecords) {
      break;
    }

    page++;
  }

  return allRecords.slice(0, maxRecords);
}
