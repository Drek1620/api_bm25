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

## Deploy en Render

Este proyecto fija Python 3.11.9 en `runtime.txt` para evitar fallos de compilacion de dependencias nativas como `py-rust-stemmers`.

Configura tu Web Service en Render con:

- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Si ya tenias un servicio creado con otra version de Python, haz un redeploy despues de este cambio.
