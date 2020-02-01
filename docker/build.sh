#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT=$DIR/../

TAG=$(git rev-parse --short HEAD)
TODAY=$(date +"%Y-%m-%d")
IMG_TAG=${TODAY}_${TAG}

docker build -t line-rss-feed:$IMG_TAG -f Dockerfile $ROOT

echo $IMG_TAG > version