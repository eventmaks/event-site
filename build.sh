#!/bin/sh
set -eu
cd "$(dirname "$0")"
mkdir -p dist
cp index.html privacy.html consent.html style.css mobile-rebuild.css script.js favicon.png og-cover.jpg robots.txt sitemap.xml dist/
cp -R assets dist/
printf 'Static site ready in dist/\n'
