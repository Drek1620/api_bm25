from fastapi import APIRouter

router = APIRouter()


@router.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/", tags=["root"])
def root() -> dict[str, str]:
    return {"message": "API BM25 running"}
