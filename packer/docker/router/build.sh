#!/bin/bash
# https://docs.vyos.io/en/sagitta/contributing/build-vyos.html#build-vyos
# https://github.com/abejjj/vyos_tutorial/blob/main/build/build_docker_image.sh
CURRENT_DIR=$(pwd)
DOCKER_REPOSITORY="asia-northeast1-docker.pkg.dev/naro-chapter4/images"
mkdir -p build
cd build

# ISOのビルド
# この方式だとnightly buildしかできない
# https://forum.vyos.io/t/lts-release-package-repositories-permanently-closed-for-public-access/14637


git clone -b current --single-branch https://github.com/vyos/vyos-build

cd vyos-build

docker run --rm -it --privileged -v $(pwd):/vyos -w /vyos vyos/vyos-build:current bash -c "sudo make clean && sudo ./build-vyos-image generic --architecture amd64"

# ISOファイルのみを移動
sudo mv ./build/*.iso ../

# mount
cd ..
ISO_FILE=$(ls vyos-*-rolling-*.iso)
VYOS_IMAGE_TAG="${DOCKER_REPOSITORY}${ISO_FILE//-amd64*.iso}"

mkdir iso

sudo mount -o loop ${ISO_FILE} ./iso 2> /dev/null

mkdir unsquashfs

sudo unsquashfs -f -d unsquashfs/ iso/live/filesystem.squashfs

sudo tar -C ./unsquashfs -c . | docker import - ${VYOS_IMAGE_TAG}

docker images  --format "{{json . }}" | jq --arg VYOS_IMAGE_TAG ${VYOS_IMAGE_TAG} -cr 'select(.Repository == $VYOS_IMAGE_TAG) | .Repository'

sudo umount ./iso
