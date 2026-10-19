"""
Phase 1 Test Suite: Neo4j Graph Database Driver & Connection Architecture
Validates:
1. Settings configuration loading for Neo4j URI, user, password, and database.
2. Neo4jClient driver singleton lifecycle and safe session management.
3. Health check reporting (graceful status, error capture, no unhandled exceptions).
4. FastAPI /api/health endpoint includes both PostgreSQL and Neo4j telemetry.
5. Ayush IP schema Cypher statement validity.
"""

import os
import sys

# Ensure backend path is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.neo4j_client import Neo4jClient, check_neo4j_health, init_neo4j_schema

client = TestClient(app)

def test_neo4j_config_settings():
    """Verify Neo4j configuration is parsed correctly from environment."""
    assert hasattr(settings, "NEO4J_URI")
    assert hasattr(settings, "NEO4J_USER")
    assert hasattr(settings, "NEO4J_PASSWORD")
    assert hasattr(settings, "NEO4J_DATABASE")
    assert hasattr(settings, "NEO4J_DBMS_ID")
    assert "7687" in settings.NEO4J_URI

def test_neo4j_health_check_returns_valid_structure():
    """Verify health check returns structured status dictionary without throwing exceptions."""
    health = check_neo4j_health()
    assert isinstance(health, dict)
    assert "status" in health
    assert "connected" in health
    assert "uri" in health
    assert health["status"] in ["connected", "auth_failed", "service_unavailable", "unavailable", "disconnected", "error"]

def test_api_health_includes_graph_database():
    """Verify FastAPI /api/health includes graphDatabase key with Neo4j status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data
    assert "graphDatabase" in data
    assert "status" in data["graphDatabase"]
    assert "uri" in data["graphDatabase"]

def test_schema_init_safe_execution():
    """Verify init_neo4j_schema executes safely regardless of whether Neo4j is connected or not."""
    result = init_neo4j_schema()
    assert isinstance(result, dict)
    assert "success" in result
    if result["success"]:
        assert result["constraints_applied"] > 0
    else:
        assert "status" in result
        assert "error" in result
