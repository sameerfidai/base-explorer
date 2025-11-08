from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Base Network Configuration
    base_rpc_url: str = "https://mainnet.base.org"
    base_testnet_rpc_url: str = "https://sepolia.base.org"
    
    # API Keys
    basescan_api_key: str = ""
    
    # External APIs
    coingecko_api_url: str = "https://api.coingecko.com/api/v3"
    
    # Server Configuration
    port: int = 8000
    host: str = "0.0.0.0"
    
    # CORS Configuration
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance"""
    return Settings()
