#!/bin/bash

# Insert Urls
echo 'Setting Urls...\n'
curl -X POST \
  http://localhost:3000/api/insert/ \
  -H 'Content-Type: application/json' \
  -d '{ "projectName" : "eco-sonar-test", "urlName": ["https://www.wikipedia.org/", "https://en.wikipedia.org/wiki/Main_Page"] }'

sleep 2

echo 'Retreiving Urls...\n'
curl  'http://localhost:3000/api/all?projectName=eco-sonar-test' > output/urls ; cat output/urls ; echo '\n'

sleep 2

# Start EcoSonar analysis
echo 'Starting analysis...\n'
curl -X POST \
  http://localhost:3000/api/greenit/insert \
  -H 'Content-Type: application/json' \
  -d '{ "projectName" : "eco-sonar-test"}'

sleep 15 

# Get output as json
echo 'Building output...\n'
curl 'http://localhost:3000/api/greenit/project?projectName=eco-sonar-test' > output/analysis

echo 'Done !\n'
