#!/usr/bin/env bash
# dev-mongo.sh – start/stop the MongoDB container for local development.
#
# Usage:
#   ./dev-mongo.sh          # start (default)
#   ./dev-mongo.sh start    # start
#   ./dev-mongo.sh stop     # stop (keeps data)
#   ./dev-mongo.sh reset    # stop AND wipe the volume (fresh DB)
#   ./dev-mongo.sh logs     # tail container logs
#
# MongoDB will be available at:
#   mongodb://localhost:27028/todos
#
# Matches the port mapping in docker-compose.yml (host 27028 → container 27017).

set -euo pipefail

ACTION="${1:-start}"

case "$ACTION" in
  start)
    echo "🍃 Starting MongoDB (todo-mongo)..."
    docker compose up -d mongo
    echo ""
    echo "✅ MongoDB is running"
    echo "   URI: mongodb://localhost:27028/todos"
    echo "   To stop:  ./dev-mongo.sh stop"
    echo "   To reset: ./dev-mongo.sh reset"
    ;;

  stop)
    echo "🛑 Stopping MongoDB..."
    docker compose stop mongo
    echo "✅ MongoDB stopped (data preserved)"
    ;;

  reset)
    echo "⚠️  Stopping MongoDB and wiping data volume..."
    docker compose stop mongo
    docker compose rm -f mongo
    docker volume rm "$(basename "$(pwd)")_mongo_data" 2>/dev/null || true
    echo "✅ Volume wiped. Run './dev-mongo.sh start' to start fresh."
    ;;

  logs)
    docker compose logs -f mongo
    ;;

  *)
    echo "Unknown action: $ACTION"
    echo "Usage: $0 {start|stop|reset|logs}"
    exit 1
    ;;
esac
