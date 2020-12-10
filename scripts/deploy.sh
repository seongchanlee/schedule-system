#!/bin/sh
echo "=============STOPPING PREVIOUS SERVER PROCESS============="
pm2 stop server
pm2 delete server
echo "=============STARTING A NEW SERVER PROCESS============="
NODE_ENV=production pm2 start server.js --name "server"