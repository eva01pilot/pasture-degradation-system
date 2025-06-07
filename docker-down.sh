docker compose -f docker-compose.yml -f docker-compose.keycloak.yml -f docker-compose.postgres.yml -f docker-compose.minio.yml  --env-file .env.dev down
