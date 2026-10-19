import logging
from typing import Optional, Dict, Any, List
from contextlib import contextmanager
from app.core.config import settings

logger = logging.getLogger("ayunova.neo4j")

# Lazy import neo4j to avoid failure if package isn't installed
try:
    from neo4j import GraphDatabase, Driver, Session
    from neo4j.exceptions import ServiceUnavailable, AuthError, Neo4jError
    NEO4J_INSTALLED = True
except ImportError:
    NEO4J_INSTALLED = False
    logger.warning("neo4j python package not installed. Graph features will run in fallback mode.")


class Neo4jClient:
    """
    Singleton driver manager for local Neo4j Desktop database.
    Provides thread-safe connection pooling, health checks, transaction execution,
    and automatic schema/constraint provisioning.
    """
    _instance: Optional["Neo4jClient"] = None
    _driver: Optional["Driver"] = None

    def __new__(cls) -> "Neo4jClient":
        if cls._instance is None:
            cls._instance = super(Neo4jClient, cls).__new__(cls)
            cls._instance._driver = None
        return cls._instance

    @classmethod
    def get_driver(cls) -> Optional["Driver"]:
        """Returns or creates the singleton Neo4j Driver instance."""
        if not NEO4J_INSTALLED:
            return None

        client = cls()
        if client._driver is None:
            try:
                uri = settings.NEO4J_URI
                user = settings.NEO4J_USER
                password = settings.NEO4J_PASSWORD
                
                auth = (user, password) if user and password else None
                client._driver = GraphDatabase.driver(
                    uri,
                    auth=auth,
                    max_connection_pool_size=20,
                    connection_acquisition_timeout=5.0,
                    max_connection_lifetime=1800,
                    keep_alive=True
                )
                logger.info(f"Initialized Neo4j driver for '{uri}' (User: '{user}')")
            except Exception as e:
                logger.warning(f"Could not initialize Neo4j driver: {e}")
                client._driver = None
        return client._driver

    @classmethod
    def close(cls):
        """Closes all connections in the pool."""
        client = cls()
        if client._driver is not None:
            try:
                client._driver.close()
                logger.info("Closed Neo4j driver connection pool.")
            except Exception as e:
                logger.warning(f"Error closing Neo4j driver: {e}")
            finally:
                client._driver = None

    @classmethod
    def check_health(cls) -> Dict[str, Any]:
        """
        Verify connectivity to local Neo4j database, version, and DBMS status.
        Never throws unhandled exceptions; returns a clean diagnostic status dictionary.
        """
        if not NEO4J_INSTALLED:
            return {
                "status": "unavailable",
                "uri": settings.NEO4J_URI,
                "error": "neo4j python package is not installed",
                "connected": False
            }

        driver = cls.get_driver()
        if driver is None:
            return {
                "status": "disconnected",
                "uri": settings.NEO4J_URI,
                "dbms_id": settings.NEO4J_DBMS_ID,
                "error": "Driver failed to initialize",
                "connected": False
            }

        try:
            with driver.session(database=settings.NEO4J_DATABASE) as session:
                result = session.run("CALL dbms.components() YIELD name, versions, edition WHERE name = 'Neo4j Kernel' RETURN name, versions[0] AS version, edition LIMIT 1")
                record = result.single()
                if record:
                    return {
                        "status": "connected",
                        "connected": True,
                        "uri": settings.NEO4J_URI,
                        "database": settings.NEO4J_DATABASE,
                        "dbms_id": settings.NEO4J_DBMS_ID,
                        "server_name": record["name"],
                        "server_version": record["version"],
                        "edition": record["edition"],
                        "error": None
                    }
                else:
                    # Fallback ping
                    ping = session.run("RETURN 1 AS ping").single()
                    return {
                        "status": "connected",
                        "connected": True,
                        "uri": settings.NEO4J_URI,
                        "database": settings.NEO4J_DATABASE,
                        "dbms_id": settings.NEO4J_DBMS_ID,
                        "server_version": "5.x+",
                        "error": None
                    }
        except AuthError as ae:
            logger.warning(f"Neo4j authentication failed on {settings.NEO4J_URI}: {ae}")
            return {
                "status": "auth_failed",
                "connected": False,
                "uri": settings.NEO4J_URI,
                "user": settings.NEO4J_USER,
                "dbms_id": settings.NEO4J_DBMS_ID,
                "error": f"Authentication failed for user '{settings.NEO4J_USER}'. Please verify NEO4J_PASSWORD in backend/.env: {str(ae)}"
            }
        except ServiceUnavailable as su:
            logger.warning(f"Neo4j service unavailable at {settings.NEO4J_URI}: {su}")
            return {
                "status": "service_unavailable",
                "connected": False,
                "uri": settings.NEO4J_URI,
                "dbms_id": settings.NEO4J_DBMS_ID,
                "error": f"Cannot connect to Neo4j on {settings.NEO4J_URI}. Ensure DBMS '{settings.NEO4J_DBMS_ID}' is STARTED in Neo4j Desktop: {str(su)}"
            }
        except Exception as e:
            logger.warning(f"Neo4j health check encounter: {e}")
            return {
                "status": "error",
                "connected": False,
                "uri": settings.NEO4J_URI,
                "dbms_id": settings.NEO4J_DBMS_ID,
                "error": str(e)
            }

    @classmethod
    @contextmanager
    def get_session(cls, database: Optional[str] = None):
        """Context manager for acquiring a Neo4j session."""
        driver = cls.get_driver()
        if driver is None:
            raise RuntimeError("Neo4j driver is not available.")
        
        target_db = database or settings.NEO4J_DATABASE
        session = driver.session(database=target_db)
        try:
            yield session
        finally:
            session.close()

    @classmethod
    def execute_read(cls, cypher: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Executes a read-only Cypher transaction and returns a list of dictionaries."""
        with cls.get_session() as session:
            result = session.run(cypher, parameters or {})
            return [record.data() for record in result]

    @classmethod
    def execute_write(cls, cypher: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Executes a write Cypher transaction and returns records as dictionaries."""
        with cls.get_session() as session:
            result = session.run(cypher, parameters or {})
            return [record.data() for record in result]

    @classmethod
    def init_schema(cls) -> Dict[str, Any]:
        """
        Creates schema constraints and indexes for the Ayush IP Knowledge Graph.
        Ensures idempotent initialization for Herbs, Statutes, Sections, Treatises,
        Patents, Formulations, Regulatory Bodies, and Chunks.
        """
        health = cls.check_health()
        if not health.get("connected", False):
            logger.warning(f"Skipping Neo4j schema initialization: {health.get('status')} - {health.get('error')}")
            return {
                "success": False,
                "status": health.get("status"),
                "error": health.get("error"),
                "constraints_applied": 0
            }

        constraints = [
            # 1. Botanical Herb Entity Constraint
            "CREATE CONSTRAINT herb_name_unique IF NOT EXISTS FOR (h:Herb) REQUIRE h.name IS UNIQUE",
            
            # 2. Statutory Legal Acts & Governing Laws
            "CREATE CONSTRAINT statute_name_unique IF NOT EXISTS FOR (s:Statute) REQUIRE s.name IS UNIQUE",
            
            # 3. Statutory Sections & Rules (e.g. 'Section 3(p)', 'Rule 158B')
            "CREATE CONSTRAINT section_code_unique IF NOT EXISTS FOR (sec:Section) REQUIRE sec.code IS UNIQUE",
            
            # 4. Classical Ayurvedic Treatises (Charaka, Sushruta, AFI)
            "CREATE CONSTRAINT treatise_name_unique IF NOT EXISTS FOR (t:Treatise) REQUIRE t.name IS UNIQUE",
            
            # 5. Formulations & Recipes (e.g. 'Triphala Churna', 'Chyawanprash')
            "CREATE CONSTRAINT formulation_name_unique IF NOT EXISTS FOR (f:Formulation) REQUIRE f.name IS UNIQUE",
            
            # 6. Patent Records (e.g. 'US 11992510')
            "CREATE CONSTRAINT patent_number_unique IF NOT EXISTS FOR (p:Patent) REQUIRE p.number IS UNIQUE",
            
            # 7. Regulatory Authorities (e.g. 'National Biodiversity Authority', 'IPO')
            "CREATE CONSTRAINT authority_name_unique IF NOT EXISTS FOR (a:RegulatoryBody) REQUIRE a.name IS UNIQUE",
            
            # 8. Document & Chunk Traceability
            "CREATE CONSTRAINT doc_id_unique IF NOT EXISTS FOR (d:Document) REQUIRE d.id IS UNIQUE",
            "CREATE CONSTRAINT chunk_id_unique IF NOT EXISTS FOR (c:Chunk) REQUIRE c.id IS UNIQUE"
        ]

        indexes = [
            # Herb Lookup Index
            "CREATE INDEX herb_name_idx IF NOT EXISTS FOR (h:Herb) ON (h.name)",
            # Section Code Lookup Index
            "CREATE INDEX section_code_idx IF NOT EXISTS FOR (sec:Section) ON (sec.code)",
            # Chunk Document Relationship Index
            "CREATE INDEX chunk_doc_id_idx IF NOT EXISTS FOR (c:Chunk) ON (c.document_id)"
        ]

        applied_constraints = 0
        applied_indexes = 0
        errors = []

        with cls.get_session() as session:
            for stmt in constraints:
                try:
                    session.run(stmt)
                    applied_constraints += 1
                except Exception as e:
                    logger.warning(f"Constraint creation note: {e}")
                    errors.append({"statement": stmt, "error": str(e)})

            for stmt in indexes:
                try:
                    session.run(stmt)
                    applied_indexes += 1
                except Exception as e:
                    logger.warning(f"Index creation note: {e}")
                    errors.append({"statement": stmt, "error": str(e)})

        logger.info(f"Neo4j Ayush IP Schema initialized: {applied_constraints} constraints, {applied_indexes} indexes.")
        return {
            "success": True,
            "constraints_applied": applied_constraints,
            "indexes_applied": applied_indexes,
            "errors": errors
        }


# Convenience module-level functions
def get_neo4j_driver() -> Optional["Driver"]:
    return Neo4jClient.get_driver()

def check_neo4j_health() -> Dict[str, Any]:
    return Neo4jClient.check_health()

def init_neo4j_schema() -> Dict[str, Any]:
    return Neo4jClient.init_schema()
