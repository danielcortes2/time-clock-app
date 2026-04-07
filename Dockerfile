FROM python:3.11.9

WORKDIR /app

RUN pip install --upgrade pip && \
    pip install poetry

COPY pyproject.toml poetry.lock ./
RUN poetry config virtualenvs.create false && \
    poetry install --no-root --only=main

COPY . .

EXPOSE 9090

CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "9090"]
