#!/bin/bash
DOCKER_REPOSITORY="asia-northeast1-docker.pkg.dev/naro-chapter4/images/"
docker build -t ${DOCKER_REPOSITORY}server:latest .
