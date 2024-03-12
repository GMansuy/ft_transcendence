FROM debian:latest

RUN apt-get update && apt-get upgrade -y && apt-get install -y curl jq 

WORKDIR /app

COPY . /app

EXPOSE 4444

CMD ["bash", "grafana-conf.sh"]
