#!/bin/bash

VERSION=`cat package.json | jq -r '.dependencies."@maaxyz/maa-node"'`
echo "Package Version $VERSION"

case $1 in
    windows)
        PLATFORM=win32
        SYSARCH=x64
        CROSSARCH=arm64
        ;;
    ubuntu)
        PLATFORM=linux
        SYSARCH=x64
        CROSSARCH=arm64
        ;;
    macos)
        PLATFORM=darwin
        SYSARCH=arm64
        CROSSARCH=x64
        ;;
esac

if [[ "$2" == "$CROSSARCH" ]]; then
    npm uninstall @maaxyz/maa-node
    npm i @maaxyz/maa-node@$VERSION --cpu $CROSSARCH --force
fi
