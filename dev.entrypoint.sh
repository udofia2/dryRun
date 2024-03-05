#!/bin/sh

echo "Waiting for database..."

while ! nc -z db 5435; do
  sleep 1
done

echo "Database started"

yarn migration:create

yarn start:dev