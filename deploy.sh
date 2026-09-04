#!/bin/bash
# deploy.sh — Despliegue de CatálogoBulk en producción (frontend + API + Mongo + Redis)
#
# Uso:
#   ./deploy.sh            # construye y levanta todo
#   ./deploy.sh reiniciar   # recrea los contenedores sin usar cache
#   ./deploy.sh detener     # apaga todo
#   ./deploy.sh estado      # estado de los contenedores

set -e

case "${1:-arrancar}" in
  arrancar)
    docker compose -f docker-compose.prod.yml up -d --build
    ;;
  reiniciar)
    docker compose -f docker-compose.prod.yml up -d --build --force-recreate
    ;;
  detener)
    docker compose -f docker-compose.prod.yml down
    ;;
  estado)
    docker compose -f docker-compose.prod.yml ps
    ;;
  *)
    echo "Uso: $0 [arrancar|reiniciar|detener|estado]"
    exit 1
    ;;
esac

echo
echo "✅  Frontend:       http://localhost/  (o la IP del servidor)"
echo "📘  Swagger API:    http://localhost/api/docs/"
echo "👤  Admin seed:     admin@sena.edu.co / 123456"
echo
echo "Nota: si el admin no existe, registralo en /login o via API:"
echo "  POST /api/auth/register { email: admin@sena.edu.co, password: 123456, rol: admin }"