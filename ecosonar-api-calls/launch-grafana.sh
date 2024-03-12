#!/bin/bash

gnome-terminal --tab --title="ecosonar-data" -- python3 deploy-ecosonar-data.py
sleep 2
curl 'http://localhost:5555/api/data'

sudo systemctl start grafana-server
sleep 1

org=${curl -X POST -H "Content-Type: application/json" -d '{"name":"my_org"}' http://admin:admin@localhost:4444/api/orgs}

echo "org= $org"

orgId=${org | jq '.orgId'}

echo "orgId= $orgId"
