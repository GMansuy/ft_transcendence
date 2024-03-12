#!/bin/bash

sleep 8

# Generate service key
echo
echo "Creating org..."
curl -s -X POST -H "Content-Type: application/json" -d '{"name":"apiorg"}' http://admin:admin@grafana:3000/api/orgs > org.json
sleep 2
cat org.json | jq

echo
echo "Updating admin org..."
curl -s -X POST http://admin:admin@grafana:3000/api/user/using/$(cat org.json | jq '.orgId')
sleep 2

echo
echo "Creating service account..."
curl -s -X POST -H "Content-Type: application/json" -d '{"name":"test", "role": "Admin"}' http://admin:admin@grafana:3000/api/serviceaccounts > service_account.json
sleep 2
cat service_account.json | jq

echo
echo "Generating service account token..."
curl -s -X POST -H "Content-Type: application/json" -d '{"name":"test-token"}' http://admin:admin@grafana:3000/api/serviceaccounts/$(cat service_account.json | jq '.id')/tokens > token.json
sleep 2
cat token.json | jq

# Connect DataSource to flask-api
echo
echo "Connecting to flask-api..."
curl -s -X POST --insecure -H "Authorization: Bearer $(cat token.json | jq -r '.key')" -H "Content-Type: application/json" -d '{
 "name":"flask_api",      
  "type":"marcusolsson-json-datasource",
  "url":"http://flask-api:5555/api/data",
  "access":"proxy",
  "basicAuth":false
}' http://grafana:3000/api/datasources > datasource.json
sleep 4
cat datasource.json | jq

echo
echo "Creating dahsboard..."
# Generate Dashboard
curl -s -X POST --insecure -H "Authorization: Bearer $(cat token.json | jq -r '.key')" \
-H "Content-Type: application/json" -d "$(cat ./dashboard-model.json | sed 's/__TOKEN__/'$(cat datasource.json | jq -r ".uid")'/g')" http://grafana:3000/api/dashboards/db > dashboard.json
echo
cat dashboard.json | jq
echo
echo "Done !"
