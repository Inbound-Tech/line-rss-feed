#!/bin/bash
if [ "$#" -lt 1 ]; then
  echo "should give env arg"
  exit 1
fi

env=$1

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT=$DIR/../

TAG=$(cat version)
CONTAINER_NAME=line-rss-feed

docker rm -f $CONTAINER_NAME

docker run -d --name ${CONTAINER_NAME} \
-p 8082:5000 \
-v $ROOT/envs/${env}.env:/app/.env \
${CONTAINER_NAME}:${TAG}