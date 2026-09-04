#!/bin/sh
set -e

echo "[entrypoint] Ejecutando seed del admin..."
node src/scripts/seed.js || true

echo "[entrypoint] Arrancando API..."
exec node src/server.js