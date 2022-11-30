FROM python:3.9-slim

ENV PYTHONUNBUFFERED 1

EXPOSE 8000
WORKDIR /app

COPY poetry.lock pyproject.toml ./
RUN pip install poetry==1.1.12 && \
    CURL_CA_BUNDLE="" && \
    poetry config virtualenvs.create false
RUN poetry install --no-dev

COPY . ./

ENV env prod
ENV REDIS_URL redis://redis:6379/0

CMD gunicorn -k uvicorn.workers.UvicornWorker --workers 4 --bind=0.0.0.0:8000 main:app
