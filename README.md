# API Python (FastAPI)

Base lista para levantar una API en Python con FastAPI.

## Estructura

- `app/main.py`: inicializa la aplicación.
- `app/api/routes.py`: rutas principales.
- `app/core/config.py`: configuración por variables de entorno.
- `tests/test_health.py`: prueba básica del endpoint de salud.

## Instalación

```bash
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
```

## Ejecutar en desarrollo

```bash
uvicorn app.main:app --reload
```

La API queda en:

- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`

## Ejecutar tests

```bash
pytest
```
