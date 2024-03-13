#!/bin/sh

echo "Waiting for database..."

while ! nc -z db 5432; do
  echo "Waiting for database..."
  sleep 1
done

echo "Database started"

yarn migration:create

yarn start:dev