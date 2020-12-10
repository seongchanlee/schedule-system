#!/bin/sh
npm bin
echo "=============NPM VERSION============="
npm -v
echo "=============NPM VERSION============="
node -v
echo "=============RUNNING GIT CHECKOUT JOB============="
git checkout master
echo "=============PULLING MOST RECENT HEAD============="
git fetch
git reset --hard origin/master
echo "=============RUNNING BACKEND LIBRARY IMPORT JOB============="
rm -rf node_modules
NODE_ENV=production npm install
echo "=============RUNNING FRONTEND LIBRARY IMPORT JOB============="
cd ./client
rm -rf node_modules
npm install
echo "=============RUNNING FRONTEND BUILD JOB============="
NODE_ENV=production npm run build
echo "=============DATABASE MIGRATION============="
cd ../
NODE_ENV=production node node_modules/db-migrate/bin/db-migrate up --verbose
