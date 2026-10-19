"""
Tri-Modal Tools Suite for AYUNOVA DeepAgents:
1. Vector Database: Hybrid dense + sparse search over Neon pgvector
2. Graph Database: Cypher query execution & multi-hop subgraph extraction on Neo4j Desktop
3. Web Search: Live internet search via Tavily Search API with offline fallbacks
4. Statutory Section Lookup: Direct access to Indian Acts, Rules, and Penalties
"""

import os
import json
import logging
import urllib.request
from typing import List, Dict, Any, Optional, cast

try:
    from langchain_core.tools import tool
except ImportError:
    def tool(*args, **kwargs):
        def decorator(fn):
            return fn
        if args and callable(args[0]):
            return args[0]
        return decorator

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.neo4j_client import Neo4jClient
from app.services.vector_service import VectorService
from app.services.graph_service import GraphService
from app.models.db_models import Regulation, AyushKnowledgeVector

logger = logging.getLogger("ayunova.agents.tools")

try:
    from neo4j import Query
except ImportError:
    Query = None  # type: ignore

# Attempt importing Tavily
try:
    from tavily import TavilyClient
    TAVILY_AVAILABLE = True
except ImportError:
    TAVILY_AVAILABLE = False
    logger.warning("tavily-python not installed. Live web search will operate in fallback mode.")


@tool
def search_vector_database(query: str, statute_limit: int = 4, prior_art_limit: int = 3) -> str:
    """
    Search the Neon PostgreSQL pgvector database for authoritative Indian legal statutes,
    Ayurvedic Pharmacopoeia monographs, TKDL classical prior art shlokas, and foreign patent claims.
    
    Args:
        query: Legal or scientific query (e.g., 'Section 3(p) Patents Act synergism triphala',
               'US Patent 11992510 probiotic claims', 'NBA Form III approval Section 19').
        statute_limit: Number of statutory sections to retrieve (default: 4).
        prior_art_limit: Number of patent/monograph prior art entries to retrieve (default: 3).
        
    Returns:
        Formatted textual summary of retrieved citations with match percentages, exact section
        citations, authority, and official excerpts.
    """
    try:
        results = VectorService.search_hybrid_corpus(
            query=query,
            statute_limit=statute_limit,
            prior_art_limit=prior_art_limit
        )
        if not results:
            return f"No vector citations found for query: '{query}'."

        formatted_lines = [f"=== Neon Vector Database Results for: '{query}' (Found {len(results)}) ==="]
        for idx, r in enumerate(results, 1):
            title = r.get("title", "Untitled Statute")
            section = r.get("section", "General Section")
            authority = r.get("authority", "Indian Authority")
            match_pct = r.get("matchPercentage", 0)
            summary = r.get("summary", "")
            excerpt = r.get("gazetteExcerpt", "")
            
            line = (
                f"\n[{idx}] {title} | {section}\n"
                f"    Authority: {authority} | Match: {match_pct}%\n"
                f"    Summary: {summary}\n"
            )
            if excerpt:
                line += f"    Statutory Excerpt: \"{excerpt[:300]}...\"\n"
            formatted_lines.append(line)
            
        return "\n".join(formatted_lines)
    except Exception as e:
        logger.error(f"Error in search_vector_database: {e}")
        return f"Error querying vector database: {str(e)}"


@tool
def execute_graph_cypher(cypher_query: str) -> str:
    """
    Execute a read-only Cypher query against the Neo4j Graph Database to traverse
    multi-hop relationships between Herbs, Formulations, Treatises, Patents, Statutes, and Sections.
    
    Examples:
    - 'MATCH (h:Herb)-[:CONTAINS_HERB]-(f:Formulation) RETURN h.name, f.name LIMIT 10'
    - 'MATCH (p:Patent)-[:CONFLICTS_WITH]->(h:Herb) RETURN p.number, p.title, h.name'
    - 'MATCH (h:Herb)-[:CITED_IN]->(t:Treatise) WHERE h.name =~ "(?i)Triphala.*" RETURN h.name, t.name, t.period'
    
    Args:
        cypher_query: Cypher MATCH/RETURN statement to execute.
        
    Returns:
        Structured table or list of graph database records.
    """
    # Safety guard: ensure read-only execution
    forbidden = ["DELETE", "REMOVE", "SET", "CREATE", "MERGE", "DROP", "DETACH"]
    upper_query = cypher_query.upper()
    if any(f in upper_query for f in forbidden):
        return "Error: Only read-only queries (MATCH ... RETURN) are permitted."
        
    driver = Neo4jClient.get_driver()
    if not driver:
        return "Neo4j Graph Database is currently disconnected or unavailable."
        
    try:
        with driver.session(database=settings.NEO4J_DATABASE) as session:
            query_obj = Query(cypher_query) if Query is not None else cypher_query
            result = session.run(cast(Any, query_obj))
            records = [dict(record) for record in result]
            if not records:
                return f"Cypher query executed successfully: 0 records matched."
            
            formatted = [f"=== Neo4j Graph Database Query Results ({len(records)} records) ==="]
            for idx, rec in enumerate(records[:20], 1):
                formatted.append(f"{idx}. {rec}")
            if len(records) > 20:
                formatted.append(f"... and {len(records) - 20} more records.")
            return "\n".join(formatted)
    except Exception as e:
        logger.error(f"Error in execute_graph_cypher: {e}")
        return f"=== Neo4j Graph Database Query Results (Notice) ===\n0 records matched. Graph connection/query notice: {str(e)}"


@tool
def extract_graph_subgraph(entities: List[str], max_hops: int = 2) -> str:
    """
    Extract a multi-hop knowledge subgraph around target entities (herbs, patents, formulations)
    for rendering in the frontend knowledge graph visualizer and analyzing semantic connections.
    
    Args:
        entities: List of entity names (e.g. ['Triphala', 'Ashwagandha', '11992510']).
        max_hops: Graph traversal distance (1 or 2 hops, default: 2).
        
    Returns:
        JSON string with nodes, edges, and semantic relationship triples.
    """
    try:
        subgraph = GraphService.get_subgraph_for_entities(entity_names=entities, max_hops=max_hops, limit=40)
        if not subgraph.get("nodes"):
            subgraph = GraphService._synthesize_fallback_subgraph(entities, {})
        nodes_count = len(subgraph.get("nodes", []))
        edges_count = len(subgraph.get("edges", []))
        triples = subgraph.get("triples", [])
        
        summary = (
            f"=== Extracted Subgraph for {entities} ===\n"
            f"Total Nodes: {nodes_count} | Total Edges: {edges_count}\n"
            f"Semantic Triples:\n"
        )
        for t in triples[:15]:
            summary += f"- {t}\n"
        if len(triples) > 15:
            summary += f"... and {len(triples) - 15} more connections."
            
        return summary
    except Exception as e:
        logger.error(f"Error in extract_graph_subgraph: {e}")
        return f"Error extracting subgraph: {str(e)}"


def search_web_tavily_structured(query: str, max_results: int = 5) -> Dict[str, Any]:
    """
    Executes a structured search against Tavily Search API using a resilient dual-tier mechanism:
    1. Primary: Official TavilyClient SDK.
    2. Resilient Fallback: Built-in urllib HTTPS client.
    
    Returns:
        Dict with keys:
        - "answer": Direct summary from Tavily if available
        - "results": List of Dicts with keys [title, url, content, score]
        - "status": "success" | "empty" | "error" | "unconfigured"
        - "error": Optional error message
    """
    api_key = settings.TAVILY_API_KEY or os.getenv("TAVILY_API_KEY", "")
    if not api_key:
        return {
            "answer": "",
            "results": [],
            "status": "unconfigured",
            "error": "TAVILY_API_KEY is not configured in backend/.env."
        }

    domains = [
        "ipindia.gov.in",
        "uspto.gov",
        "patents.google.com",
        "nbaindia.org",
        "ayush.gov.in",
        "ctri.nic.in",
        "clinicaltrials.gov",
        "wipo.int",
        "indiankanoon.org",
        "pubmed.ncbi.nlm.nih.gov"
    ]
    include_domains = domains if any(k in query.lower() for k in ["patent", "claim", "act", "section", "court", "trial", "nba", "11992510", "ayush", "triphala", "curcumin"]) else None

    # Tier 1: Try official TavilyClient SDK
    if TAVILY_AVAILABLE:
        try:
            client = TavilyClient(api_key=api_key)
            kwargs: Dict[str, Any] = {
                "query": query,
                "max_results": max_results,
                "search_depth": "advanced",
                "include_answer": True
            }
            if include_domains:
                kwargs["include_domains"] = include_domains

            resp = client.search(**kwargs)
            raw_results = resp.get("results", [])
            return {
                "answer": resp.get("answer") or "",
                "results": [
                    {
                        "title": r.get("title", "Untitled Live Result"),
                        "url": r.get("url", ""),
                        "content": r.get("content", ""),
                        "score": r.get("score", 0.0)
                    }
                    for r in raw_results
                ],
                "status": "success" if raw_results else "empty",
                "error": None
            }
        except Exception as e:
            logger.warning(f"TavilyClient SDK invocation error: {e}. Falling back to direct HTTPS REST client.")

    # Tier 2: Resilient direct HTTPS REST fallback
    try:
        payload: Dict[str, Any] = {
            "api_key": api_key,
            "query": query,
            "max_results": max_results,
            "search_depth": "advanced",
            "include_answer": True
        }
        if include_domains:
            payload["include_domains"] = include_domains

        req = urllib.request.Request(
            "https://api.tavily.com/search",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "User-Agent": "AYUNOVA-IP-Assistant/1.0"
            }
        )
        with urllib.request.urlopen(req, timeout=12) as response:
            data = json.loads(response.read().decode("utf-8"))
            raw_results = data.get("results", [])
            return {
                "answer": data.get("answer") or "",
                "results": [
                    {
                        "title": r.get("title", "Untitled Live Result"),
                        "url": r.get("url", ""),
                        "content": r.get("content", ""),
                        "score": r.get("score", 0.0)
                    }
                    for r in raw_results
                ],
                "status": "success" if raw_results else "empty",
                "error": None
            }
    except Exception as e:
        logger.error(f"Direct HTTPS Tavily REST error: {e}")
        return {
            "answer": "",
            "results": [],
            "status": "error",
            "error": str(e)
        }


@tool
def search_web_tavily(query: str, max_results: int = 5) -> str:
    """
    Search the live web using Tavily Search API for real-time intellectual property notices,
    recent CGPDTM / Indian Patent Office gazettes, USPTO patent claims, National Biodiversity
    Authority (NBA) office memorandums, court judgments, or published clinical trials.
    
    Args:
        query: Specific search terms (e.g. 'US Patent 11992510 Triphala Bacillus coagulans claims',
               'Biological Diversity Amendment Act 2023 AYUSH exemption guidelines',
               'Divya Pharmacy vs Union of India benefit sharing judgment').
        max_results: Maximum web results to return (default: 5).
        
    Returns:
        Formatted live web search snippets with URLs and content excerpts.
    """
    structured = search_web_tavily_structured(query=query, max_results=max_results)
    
    if structured["status"] == "unconfigured":
        return (
            f"=== Tavily Web Search (Notice) ===\n"
            f"TAVILY_API_KEY is not configured in backend/.env.\n"
            f"Live web search for '{query}' is deferred to the local Neon vector and Neo4j graph databases.\n"
            f"To enable live web search, add your key to backend/.env: TAVILY_API_KEY=tvly-..."
        )
        
    if structured["status"] == "error":
        return (
            f"=== Tavily Web Search (Notice) ===\n"
            f"Live web search encountered an upstream service issue: {structured['error']}.\n"
            f"Using local Neon vector and Neo4j graph databases."
        )
        
    results = structured.get("results", [])
    if not results:
        return f"Tavily live web search returned 0 results for query: '{query}'."
        
    formatted = [f"=== Tavily Live Web Search Results for: '{query}' (Found {len(results)}) ==="]
    if structured.get("answer"):
        formatted.append(f"Direct Web Summary: {structured['answer']}\n")
        
    for idx, item in enumerate(results, 1):
        title = item.get("title", "Untitled Web Result")
        url = item.get("url", "")
        content = item.get("content", "")
        formatted.append(f"[{idx}] {title}\n    URL: {url}\n    Snippet: {content[:350]}...\n")
        
    return "\n".join(formatted)


@tool
def lookup_statutory_section(act_name: str, section: str) -> str:
    """
    Direct statutory lookup of authoritative Indian IP Acts and Rules:
    - The Patents Act, 1970 (e.g. 'Section 3(p)', 'Section 3(e)', 'Section 3(d)')
    - Biological Diversity Act, 2002/2023 (e.g. 'Section 19', 'Section 3', 'Section 7')
    - Drugs and Cosmetics Act, 1940 (e.g. 'Section 33EEB', 'Section 3(a)')
    - Trade Marks Act, 1999 (e.g. 'Class 5', 'Class 3', 'Section 9')
    - TKDL Prior Art Protocols
    
    Args:
        act_name: Name or acronym of the Act ('Patents', 'Biodiversity', 'Drugs', 'Trademarks', 'TKDL').
        section: Section number or key ('3(p)', '3(e)', '19', '33EEB', 'Class 5').
        
    Returns:
        Authoritative legal text, jurisdiction, examination guidelines, and statutory penalties.
    """
    act_lower = act_name.lower()
    sec_lower = section.lower()
    
    # Common legal statutory aliases
    if any(b in act_lower for b in ["bio", "nba", "diversity"]):
        if any(s in sec_lower for s in ["19", "6", "3", "form iii", "approval"]):
            sec_lower = "section"  # Match BDA entry
    if any(p in act_lower for p in ["patent", "ipo"]):
        if "3p" in sec_lower.replace(" ", "").replace("(", "").replace(")", ""):
            sec_lower = "3(p)"
        elif "3e" in sec_lower.replace(" ", "").replace("(", "").replace(")", ""):
            sec_lower = "3(e)"
            
    db = SessionLocal()
    matched = []
    try:
        query_set = db.query(Regulation).filter(Regulation.is_active == True).all()
        for reg in query_set:
            if (sec_lower in reg.section.lower() or sec_lower in reg.title.lower() or sec_lower in reg.id) and \
               (act_lower in reg.title.lower() or act_lower in reg.official_act.lower() or act_lower in reg.act_name.lower()):
                matched.append(reg)
                
        if not matched:
            for reg in query_set:
                if sec_lower in reg.section.lower() or sec_lower in reg.title.lower() or sec_lower in reg.id:
                    matched.append(reg)
                    
        if not matched:
            for reg in query_set:
                if act_lower in reg.title.lower() or act_lower in reg.official_act.lower() or act_lower in reg.act_name.lower():
                    matched.append(reg)
    except Exception as e:
        logger.error(f"Error in lookup_statutory_section from database: {e}")
    finally:
        db.close()

    if not matched:
        return f"Statutory section '{section}' under '{act_name}' not found in PostgreSQL knowledge base. Suggest using search_vector_database tool."
        
    output = []
    for s in matched[:3]:
        entry = (
            f"=== Authoritative Statute: {s.title} ===\n"
            f"Section: {s.section}\n"
            f"Official Act: {s.official_act}\n"
            f"Authority: {s.authority} ({s.jurisdiction})\n"
            f"Reference Page: {s.page_reference or ''}\n"
            f"Statutory Text:\n\"{s.gazette_excerpt or ''}\"\n"
            f"Legal Summary:\n{s.legal_summary}\n"
        )
        output.append(entry)
        
    return "\n\n".join(output)


# All available tools exported for orchestrators and subagents
ALL_AYUSH_TOOLS = [
    search_vector_database,
    execute_graph_cypher,
    extract_graph_subgraph,
    search_web_tavily,
    lookup_statutory_section,
]
