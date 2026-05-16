import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db_with_retry
from app.exceptions import DuplicateResourceError, ResourceNotFoundError

from app.routers.users import router as users_router
from app.routers.series import router as series_router
from app.routers.seasons import router as seasons_router
from app.routers.episodes import router as episodes_router
from app.routers.watched import router as watched_router

logger = logging.getLogger(__name__)

# Inicializar database ao carregar o módulo
try:
    init_db_with_retry()
except Exception as e:
    logger.error(f"Failed to initialize database: {str(e)}")
    # Em Lambda, isso pode falhar na inicialização mas tentar novamente em cada request


def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="API para gestão de séries, temporadas, episódios e histórico de visualização.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(ResourceNotFoundError)
    async def not_found_handler(request: Request, exc: ResourceNotFoundError):
        return JSONResponse(
            status_code=404,
            content={"detail": f"{exc.resource} with id {exc.resource_id} not found"},
        )

    @app.exception_handler(DuplicateResourceError)
    async def duplicate_handler(request: Request, exc: DuplicateResourceError):
        return JSONResponse(
            status_code=400,
            content={"detail": exc.message},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={"detail": exc.errors()},
        )

    @app.exception_handler(Exception)
    async def global_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    @app.get("/health", tags=["health"], summary="Health check")
    def health_check():
        return {"status": "healthy"}

    app.include_router(users_router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
    app.include_router(series_router, prefix=f"{settings.API_V1_STR}/series", tags=["series"])
    app.include_router(seasons_router, prefix=f"{settings.API_V1_STR}", tags=["seasons"])
    app.include_router(episodes_router, prefix=f"{settings.API_V1_STR}", tags=["episodes"])
    app.include_router(watched_router, prefix=f"{settings.API_V1_STR}", tags=["watched"])

    return app


app = create_application()