#!/bin/sh
# Railway start: bind on all interfaces (Docker sets HOSTNAME to the container id, which Next's
# standalone server would otherwise listen on) and use Railway's PORT when it injects one.
export HOSTNAME=0.0.0.0
export PORT="${PORT:-3000}"
echo "partile: listening on ${HOSTNAME}:${PORT}"
exec node apps/web/server.js
