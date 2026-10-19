"""
AYUNOVA Long-Term Memory & Research Portfolio Module.
Completely database-driven: manages persistent multi-turn research context, active patent formulations,
prior art discoveries, and filing roadmaps stored in Neon PostgreSQL (agent_research_memory).
Eliminates local file dependencies.
"""

import os
import logging
from typing import Optional, Dict, Any, cast
from datetime import datetime, timezone
from app.core.database import SessionLocal
from app.models.db_models import AgentResearchMemory

logger = logging.getLogger("ayunova.agents.memory")

AGENTS_ROOT = os.path.abspath(os.path.dirname(__file__))
DEFAULT_PORTFOLIO_FILENAME = "AYUNOVA_PORTFOLIO.md"
DEFAULT_PORTFOLIO_FILE = f"/{DEFAULT_PORTFOLIO_FILENAME}"
PORTFOLIO_FILE_PATH = os.path.join(AGENTS_ROOT, DEFAULT_PORTFOLIO_FILENAME)
DEFAULT_SESSION_ID = "default"

INITIAL_PORTFOLIO_CONTENT = """# AYUNOVA Intellectual Property Portfolio & Research Scratchpad

## 1. Active Botanical Formulations
- Formulation: Triphala + Bacillus coagulans Synergistic Matrix
  - Active Herbs: Amalaki (Emblica officinalis), Haritaki (Terminalia chebula), Bibhitaki (Terminalia bellerica)
  - Probiotic / Additive: Bacillus coagulans MTCC 5856
  - Statutory Hurdles: Section 3(p) Traditional Knowledge Bar & Section 3(e) Synergism Requirement

## 2. Identified Conflicting Prior Art
- US Patent 11992510 (Granted May 28, 2024): Claims composition of Triphala extract with Bacillus coagulans for gut health.
- Classical Ayurvedic Treatises: Charaka Samhita (Chikitsa Sthana, Chapter 1), Sushruta Samhita (Sutra Sthana, Chapter 38).
- Ayurvedic Pharmacopoeia of India (API): Triphala Churna canonical ratio 1:1:1.

## 3. Mandatory Regulatory & Biodiversity Clearances
- Biological Diversity Act 2023: Form III Approval mandatory from National Biodiversity Authority (NBA) prior to patent grant.
- Access & Benefit Sharing (ABS): Statutory levy of 0.1% to 0.5% of annual gross ex-factory sales.
- Penalties for Non-Compliance: Section 55 penalties & patent revocation grounds under Section 64(1)(q).

## 4. Multi-Turn Filing Roadmap
- [ ] Step 1: Conduct checkerboard synergy assay to prove Combination Index CI < 0.9.
- [ ] Step 2: File Form III application with National Biodiversity Authority.
- [ ] Step 3: Draft dual trademark applications in Class 5 (medicinal) and Class 3 (cosmetic).
"""


def get_portfolio_memory_path() -> str:
    """Returns the persistent portfolio memory path."""
    return PORTFOLIO_FILE_PATH


def _sync_to_file(content: str) -> None:
    """Synchronizes database content to the DeepAgents filesystem backend buffer."""
    try:
        with open(PORTFOLIO_FILE_PATH, "w", encoding="utf-8") as f:
            f.write(content)
    except Exception as e:
        logger.warning(f"Could not sync portfolio memory to file buffer: {e}")


def init_portfolio_memory(force: bool = False, session_id: str = DEFAULT_SESSION_ID) -> str:
    """
    Initializes or retrieves the research portfolio memory record in PostgreSQL.
    Returns the markdown text content.
    """
    db = SessionLocal()
    try:
        record = db.query(AgentResearchMemory).filter(AgentResearchMemory.session_id == session_id).first()
        if not record or force:
            if not record:
                record = AgentResearchMemory(
                    session_id=session_id,
                    title="AYUNOVA Intellectual Property Portfolio & Research Scratchpad",
                    content=INITIAL_PORTFOLIO_CONTENT,
                    active_formulations=[
                        {
                            "name": "Triphala + Bacillus coagulans Synergistic Matrix",
                            "herbs": ["Amalaki", "Haritaki", "Bibhitaki"],
                            "probiotic": "Bacillus coagulans MTCC 5856"
                        }
                    ],
                    conflicting_prior_art=[
                        {"patent": "US 11992510 B2", "status": "Granted"}
                    ],
                    compliance_clearances=[
                        {"authority": "NBA Chennai", "type": "Form III"}
                    ],
                    filing_roadmap=[
                        {"step": 1, "task": "Conduct checkerboard synergy assay CI < 0.9", "done": False},
                        {"step": 2, "task": "File Form III with NBA", "done": False},
                        {"step": 3, "task": "Draft Class 5 and Class 3 trademark applications", "done": False}
                    ]
                )
                db.add(record)
            else:
                record.content = INITIAL_PORTFOLIO_CONTENT
                record.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(record)
            logger.info(f"Initialized AYUNOVA portfolio memory in PostgreSQL (session: {session_id})")
        
        content_val = cast(str, record.content) if record and record.content else INITIAL_PORTFOLIO_CONTENT
        _sync_to_file(content_val)
        return content_val
    except Exception as e:
        logger.error(f"Error initializing portfolio memory in database: {e}")
        _sync_to_file(INITIAL_PORTFOLIO_CONTENT)
        return INITIAL_PORTFOLIO_CONTENT
    finally:
        db.close()


def read_portfolio_memory(session_id: str = DEFAULT_SESSION_ID) -> str:
    """Reads and returns the current content of the portfolio from PostgreSQL."""
    db = SessionLocal()
    try:
        record = db.query(AgentResearchMemory).filter(AgentResearchMemory.session_id == session_id).first()
        if record and record.content:
            content_val = cast(str, record.content)
            _sync_to_file(content_val)
            return content_val
        return init_portfolio_memory(force=False, session_id=session_id)
    except Exception as e:
        logger.error(f"Error reading portfolio memory from database: {e}")
        return INITIAL_PORTFOLIO_CONTENT
    finally:
        db.close()


def update_portfolio_memory(content: str, session_id: str = DEFAULT_SESSION_ID) -> bool:
    """Overwrites the portfolio scratchpad in PostgreSQL with updated content."""
    db = SessionLocal()
    try:
        record = db.query(AgentResearchMemory).filter(AgentResearchMemory.session_id == session_id).first()
        if record:
            record.content = content
            record.updated_at = datetime.now(timezone.utc)
        else:
            record = AgentResearchMemory(
                session_id=session_id,
                title="AYUNOVA Intellectual Property Portfolio & Research Scratchpad",
                content=content
            )
            db.add(record)
        db.commit()
        _sync_to_file(content)
        logger.info(f"Successfully updated AYUNOVA portfolio memory in PostgreSQL (session: {session_id}).")
        return True
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update portfolio memory in database: {e}")
        return False
    finally:
        db.close()


def append_portfolio_entry(section_header: str, entry: str, session_id: str = DEFAULT_SESSION_ID) -> str:
    """
    Appends a new bullet or note under a specific section in the portfolio in PostgreSQL.
    Returns the updated full content.
    """
    current_content = read_portfolio_memory(session_id=session_id)
    if section_header in current_content:
        parts = current_content.split(section_header)
        updated_content = f"{parts[0]}{section_header}\n- {entry}{parts[1]}"
    else:
        updated_content = f"{current_content}\n\n## {section_header}\n- {entry}\n"

    update_portfolio_memory(updated_content, session_id=session_id)
    return updated_content


def reset_portfolio_memory(session_id: str = DEFAULT_SESSION_ID) -> str:
    """Resets the portfolio scratchpad in PostgreSQL to the pristine default state."""
    return init_portfolio_memory(force=True, session_id=session_id)
