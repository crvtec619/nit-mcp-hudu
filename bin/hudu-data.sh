#!/usr/bin/env bash
# Launch the Hudu connector with the "data" tool profile. See hudu-local.sh for
# the nvm/PATH handling; this wrapper only pins the profile.
export HUDU_PROFILE=data
exec "$(dirname "$0")/hudu-local.sh"
