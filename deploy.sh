#!/bin/sh

set -eu

printf '\033[0;36mBuilding Captain\047s Logs for deployment...\033[0m\n'
HUGO_ENVIRONMENT=production hugo --cleanDestinationDir --minify
printf '\033[0;32mBuild complete: public/ is ready.\033[0m\n'
