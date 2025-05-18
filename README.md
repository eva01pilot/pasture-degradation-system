# Монорепозиторий с фронтендом, Node.js API, Python API и Caddy-прокси

Этот проект представляет собой полностековый монорепозиторий, включающий:

- ⚡ **Фронтенд**: Vue + Vite (с поддержкой HMR)
- 🚀 **Node.js API**: Fastify + TypeScript (с `tsx` и HMR)
- 🐍 **Python API**: FastAPI (с `uvicorn --reload`)
- 🌐 **Caddy**: Обратный прокси-сервер

---

## 📦 Структура проекта
.
├── docker-compose.yml
├── Caddyfile
├── frontend/ # Vue + Vite
├── node-api/ # Fastify + TypeScript
└── python-api/ # FastAPI

---

## 🚀 Как запустить проект

> Убедитесь, что у вас установлены [Docker](https://www.docker.com/products/docker-desktop/) и [Docker Compose](https://docs.docker.com/compose/install/).

1. Клонируйте репозиторий:

```bash
git clone https://github.com/eva01pilot/pasture-degradation-system
cd pasture-degradation-system
```
2. Запустите все сервисы
```bash
docker-compose up --build
```
3. После запуска сервисы будут работать по адресам

| Компонент   | URL                        |
|-------------|----------------------------|
| Фронтенд    | [http://localhost](http://localhost)         |
| Node API    | [http://localhost/api](http://localhost/api) |
| Python API  | [http://localhost/pyapi](http://localhost/pyapi) |
