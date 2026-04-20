from fastapi import APIRouter
from pydantic import BaseModel
from fastembed import SparseTextEmbedding

router = APIRouter()


# Singleton model kept in memory for faster repeated requests.
model = SparseTextEmbedding(model_name="Qdrant/bm25")


class BusquedaRequest(BaseModel):
    busqueda_libre: str


@router.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/", tags=["root"])
def root() -> dict[str, str]:
    return {"message": "API BM25 running"}


@router.post("/api/generar-bm25", tags=["bm25"])
def generar_bm25(req: BusquedaRequest) -> dict[str, list[float] | list[int]]:
    if not req.busqueda_libre:
        return {"indices": [], "values": []}

    resultado = list(model.embed([req.busqueda_libre]))[0]

    return {
        "indices": resultado.indices,
        "values": resultado.values,
    }
