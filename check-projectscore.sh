#!/bin/bash

res=false

while [[ "$res" != true ]]; do
    # Run your command here
    curl 'http://localhost:3000/api/ecosonar/scores?projectName=eco-sonar-test' | cat > output/scores.json
    res=$(cat output/scores.json | jq '.ecoIndex != null')
    echo $res
    sleep 5
done
