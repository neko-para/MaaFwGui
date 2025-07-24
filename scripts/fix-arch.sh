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
    echo "Uninstall @maaxyz/maa-node-$PLATFORM-$SYSARCH"
    npm uninstall @maaxyz/maa-node-$PLATFORM-$SYSARCH --force
    echo "Install @maaxyz/maa-node-$PLATFORM-$CROSSARCH"
    npm i @maaxyz/maa-node-$PLATFORM-$CROSSARCH@$VERSION
fi
