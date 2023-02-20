#!/usr/bin/env bash
# This script is meant to be run on Unix/Linux based systems
set -e

echo "*** Start Societal Client ***"

docker-compose down --remove-orphans
docker-compose up
