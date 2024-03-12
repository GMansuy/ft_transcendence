FROM python:3.8-slim

WORKDIR /app

COPY . /app

RUN apt update && apt upgrade -y && apt install jq curl -y

RUN pip install --no-cache-dir Flask

EXPOSE 5555

CMD ["python", "app.py"]
