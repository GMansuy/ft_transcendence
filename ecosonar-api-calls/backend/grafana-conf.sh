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


# Generate Dashboard
curl -X POST --insecure -H "Authorization: Bearer $(cat token.json | jq -r '.key')" -H "Content-Type: application/json" -d '{
  "dashboard": {
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": {
          "type": "grafana",
          "uid": "-- Grafana --"
        },
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 0,
  "id": null,
  "links": [],
  "liveNow": false,
  "panels": [
    {
      "datasource": {
        "type": "marcusolsson-json-datasource",
        "uid": "'$(cat datasource.json | jq -r '.uid')'"
      },
      "fieldConfig": {
        "defaults": {
          "displayName": "EcoIndex",
          "mappings": [],
          "max": 100,
          "min": 1,
          "thresholds": {
            "mode": "percentage",
            "steps": [
              {
                "color": "red",
                "value": null
              },
              {
                "color": "orange",
                "value": 70
              },
              {
                "color": "green",
                "value": 85
              }
            ]
          },
          "unitScale": true
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 6,
        "y": 0
      },
      "id": 2,
      "options": {
        "minVizHeight": 75,
        "minVizWidth": 75,
        "orientation": "auto",
        "reduceOptions": {
          "calcs": [
            "lastNotNull"
          ],
          "fields": "",
          "values": false
        },
        "showThresholdLabels": false,
        "showThresholdMarkers": false,
        "sizing": "auto"
      },
      "pluginVersion": "10.3.3",
      "targets": [
        {
          "cacheDurationSeconds": 300,
          "datasource": {
            "type": "marcusolsson-json-datasource",
            "uid": "'$(cat datasource.json | jq -r '.uid')'"
          },
          "fields": [
            {
              "jsonPath": "$.deployments.greenit[*].ecoIndex"
            }
          ],
          "method": "GET",
          "queryParams": "",
          "refId": "A",
          "urlPath": ""
        }
      ],
      "transparent": true,
      "type": "gauge"
    },
    {
      "datasource": {
        "type": "marcusolsson-json-datasource",
        "uid": "'$(cat datasource.json | jq -r '.uid')'"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "continuous-GrYlRd"
          },
          "mappings": [],
          "max": 2000,
          "min": 50,
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          },
          "unitScale": true
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 8
      },
      "id": 1,
      "options": {
        "displayMode": "gradient",
        "maxVizHeight": 300,
        "minVizHeight": 16,
        "minVizWidth": 8,
        "namePlacement": "auto",
        "orientation": "horizontal",
        "reduceOptions": {
          "calcs": [
            "lastNotNull"
          ],
          "fields": "",
          "values": false
        },
        "showUnfilled": true,
        "sizing": "auto",
        "valueMode": "color"
      },
      "pluginVersion": "10.3.3",
      "targets": [
        {
          "cacheDurationSeconds": 300,
          "datasource": {
            "type": "marcusolsson-json-datasource",
            "uid": "'$(cat datasource.json | jq -r '.uid')'"
          },
          "fields": [
            {
              "jsonPath": "$.deployments.greenit[*].domSize",
              "type": "number"
            },
            {
              "jsonPath": "$.deployments.greenit[*].nbRequest",
              "language": "jsonpath",
              "name": "",
              "type": "number"
            },
            {
              "jsonPath": "$.deployments.greenit[*].responsesSize",
              "language": "jsonpath",
              "name": "",
              "type": "number"
            }
          ],
          "method": "GET",
          "queryParams": "",
          "refId": "A",
          "urlPath": ""
        }
      ],
      "title": "Green IT Analysis",
      "type": "bargauge"
    },
    {
      "datasource": {
        "type": "marcusolsson-json-datasource",
        "uid": "'$(cat datasource.json | jq -r '.uid')'"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "continuous-GrYlRd"
          },
          "mappings": [],
          "max": 100,
          "min": 1,
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          },
          "unitScale": true
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 12,
        "y": 8
      },
      "id": 3,
      "options": {
        "displayMode": "basic",
        "maxVizHeight": 300,
        "minVizHeight": 16,
        "minVizWidth": 8,
        "namePlacement": "auto",
        "orientation": "horizontal",
        "reduceOptions": {
          "calcs": [
            "lastNotNull"
          ],
          "fields": "",
          "values": false
        },
        "showUnfilled": true,
        "sizing": "auto",
        "valueMode": "color"
      },
      "pluginVersion": "10.3.3",
      "targets": [
        {
          "cacheDurationSeconds": 300,
          "datasource": {
            "type": "marcusolsson-json-datasource",
            "uid": "'$(cat datasource.json | jq -r '.uid')'"
          },
          "fields": [
            {
              "jsonPath": "$.deployments.lighthouse[*].accessibilityScore"
            },
            {
              "jsonPath": "$.deployments.lighthouse[*].cumulativeLayoutShift",
              "language": "jsonpath",
              "name": ""
            },
            {
              "jsonPath": "$.deployments.lighthouse[*].interactive",
              "language": "jsonpath",
              "name": ""
            },
            {
              "jsonPath": "$.deployments.lighthouse[*].performanceScore",
              "language": "jsonpath",
              "name": ""
            },
            {
              "jsonPath": "$.deployments.lighthouse[*].totalBlockingTime",
              "language": "jsonpath",
              "name": ""
            }
          ],
          "method": "GET",
          "queryParams": "",
          "refId": "A",
          "urlPath": ""
        }
      ],
      "title": "Lighthouse Analysis",
      "type": "bargauge"
    }
  ],
  "refresh": "",
  "schemaVersion": 39,
  "tags": [],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-6h",
    "to": "now"
  },
  "timepicker": {},
  "timezone": "",
  "title": "test-ecosonoar-new",
  "uid": null,
  "version": 2,
  "weekStart": ""
},
  "overwrite": false
}' http://grafana:3000/api/dashboards/db > dashboard.json
echo
cat dashboard.json | jq
echo
echo "Done !"
