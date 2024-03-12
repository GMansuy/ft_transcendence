FROM grafana/grafana:latest-ubuntu

WORKDIR /app

COPY . /app

RUN grafana-cli plugins install marcusolsson-json-datasource

EXPOSE 3000
