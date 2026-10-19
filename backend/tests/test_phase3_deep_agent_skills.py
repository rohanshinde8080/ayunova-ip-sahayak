"""
Phase 3 Test Suite: Legal Skills Library (`SkillsMiddleware`) & Playbooks
Validates:
1. Skills directory existence and completeness.
2. Skill YAML frontmatter specification compliance (Agent Skills spec).
3. FilesystemBackend skill discovery via deepagents _list_skills.
4. SkillsMiddleware formatted skills listing and progressive disclosure.
5. Section 3(p) defense playbook content & 5-step invalidation defense.
6. Section 3(e) synergy experimental protocol playbook & Chou-Talalay CI formulas.
7. NBA Form III filing playbook & ABS fee computation (0.1% - 0.5%).
8. Live prior art invalidation playbook & 4-tier biopiracy defense.
9. Orchestrator compilation with skills library and subagents.
10. End-to-end graph invocation with skills enabled.
11. Skills override and disabling via skills=[].
"""

import os
import sys
import re
import yaml
import pytest

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.agents import (
    DEFAULT_SKILLS_DIR,
    build_ayush_deep_agent,
)
from deepagents.backends import FilesystemBackend
from deepagents.middleware.skills import _list_skills, SkillsMiddleware, _validate_skill_name


EXPECTED_SKILLS = [
    "section-3p-defense",
    "synergy-experimental-protocol",
    "nba-form-iii-filing",
    "live-prior-art-invalidation",
]


def test_skills_directory_exists_and_contains_all_playbooks():
    """Verify DEFAULT_SKILLS_DIR exists and contains subdirectories with SKILL.md."""
    assert os.path.exists(DEFAULT_SKILLS_DIR), f"Skills directory not found: {DEFAULT_SKILLS_DIR}"
    
    for skill_name in EXPECTED_SKILLS:
        skill_dir = os.path.join(DEFAULT_SKILLS_DIR, skill_name)
        assert os.path.isdir(skill_dir), f"Missing skill folder: {skill_dir}"
        skill_file = os.path.join(skill_dir, "SKILL.md")
        assert os.path.isfile(skill_file), f"Missing SKILL.md in: {skill_dir}"
        assert os.path.getsize(skill_file) > 200, f"SKILL.md is too small in {skill_dir}"


def test_skills_frontmatter_specification_compliance():
    """Verify all SKILL.md files comply with the Agent Skills YAML frontmatter specification."""
    for skill_name in EXPECTED_SKILLS:
        skill_file = os.path.join(DEFAULT_SKILLS_DIR, skill_name, "SKILL.md")
        with open(skill_file, "r", encoding="utf-8") as f:
            content = f.read()

        match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", content, re.DOTALL)
        assert match is not None, f"No valid YAML frontmatter in {skill_file}"

        frontmatter_str = match.group(1)
        body = match.group(2)
        data = yaml.safe_load(frontmatter_str)

        assert isinstance(data, dict), f"Frontmatter in {skill_file} must be a dict"
        assert "name" in data, f"Missing 'name' in {skill_file}"
        assert "description" in data, f"Missing 'description' in {skill_file}"

        name = data["name"]
        description = data["description"]

        # Validate name per Agent Skills spec
        is_valid, err = _validate_skill_name(name, skill_name)
        assert is_valid, f"Skill name '{name}' invalid: {err}"
        assert name == skill_name, f"Skill name '{name}' must match folder '{skill_name}'"
        assert len(description) > 20, f"Description too short in {skill_file}"
        assert len(body.strip()) > 300, f"Body content too short in {skill_file}"


def test_skills_middleware_discovery():
    """Verify FilesystemBackend discovers all 4 skills via deepagents _list_skills."""
    fs = FilesystemBackend(root_dir=DEFAULT_SKILLS_DIR)
    discovered = _list_skills(fs, "/")
    
    assert len(discovered) == 4, f"Expected 4 skills, found: {len(discovered)}"
    discovered_names = [s["name"] for s in discovered]
    for expected in EXPECTED_SKILLS:
        assert expected in discovered_names, f"Skill {expected} was not discovered"


def test_skills_system_prompt_formatting():
    """Verify SkillsMiddleware._format_skills_list renders progressive disclosure guidance."""
    fs = FilesystemBackend(root_dir=DEFAULT_SKILLS_DIR)
    discovered = _list_skills(fs, "/")
    sm = SkillsMiddleware(backend=fs, sources=["/"])
    formatted = sm._format_skills_list(discovered)

    for skill_name in EXPECTED_SKILLS:
        assert f"**{skill_name}**" in formatted
        assert f"Read `/{skill_name}/SKILL.md` for full instructions" in formatted


def test_section_3p_defense_playbook_content():
    """Verify section-3p-defense playbook contains required statutory guidance."""
    path = os.path.join(DEFAULT_SKILLS_DIR, "section-3p-defense", "SKILL.md")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "Section 3(p)" in content
    assert "Traditional Knowledge" in content
    assert "Supercritical" in content or "extraction" in content
    assert "AUC" in content or "bioavailability" in content.lower()
    assert "phytosomes" in content or "liposomes" in content
    assert "First Examination Report" in content or "FER" in content


def test_synergy_experimental_protocol_playbook_content():
    """Verify synergy-experimental-protocol playbook contains Chou-Talalay formulas & thresholds."""
    path = os.path.join(DEFAULT_SKILLS_DIR, "synergy-experimental-protocol", "SKILL.md")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "Section 3(e)" in content
    assert "mere admixture" in content.lower()
    assert "Chou-Talalay" in content
    assert "Combination Index" in content or "CI" in content
    assert "Isobologram" in content or "isobole" in content.lower()
    assert "ANOVA" in content or "Affidavit" in content


def test_nba_form_iii_filing_playbook_content():
    """Verify nba-form-iii-filing playbook contains Section 6/19 mandates and ABS fees."""
    path = os.path.join(DEFAULT_SKILLS_DIR, "nba-form-iii-filing", "SKILL.md")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "Section 6" in content
    assert "Section 19" in content
    assert "Form III" in content
    assert "Benefit Sharing" in content or "ABS" in content
    assert "0.1%" in content and "0.5%" in content
    assert "Section 55" in content


def test_live_prior_art_invalidation_playbook_content():
    """Verify live-prior-art-invalidation playbook contains 4-tier biopiracy defense."""
    path = os.path.join(DEFAULT_SKILLS_DIR, "live-prior-art-invalidation", "SKILL.md")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "biopiracy" in content.lower()
    assert "11992510" in content or "Triphala" in content
    assert "Cypher" in content or "Neo4j" in content
    assert "Charaka Samhita" in content
    assert "Tavily" in content or "USPTO" in content
    assert "Section 25(1)" in content or "Pre-Grant" in content


def test_deep_agent_orchestrator_compiles_with_skills_library():
    """Verify build_ayush_deep_agent compiles with skills library enabled by default."""
    agent = build_ayush_deep_agent()
    assert agent is not None
    assert hasattr(agent, "invoke")
    assert hasattr(agent, "stream")


def test_deep_agent_skills_invocation_end_to_end():
    """Verify end-to-end execution of deep agent with skills and subagents attached."""
    agent = build_ayush_deep_agent()
    response = agent.invoke({
        "messages": [
            {
                "role": "user",
                "content": (
                    "How do I prove synergistic Combination Index CI < 1.0 under Section 3(e) "
                    "for a classical Triphala formulation to avoid mere admixture objections?"
                )
            }
        ]
    })
    assert isinstance(response, dict)
    assert "messages" in response
    assert len(response["messages"]) >= 2
    last_message = response["messages"][-1]
    content = str(last_message.content)
    assert len(content) > 50
    assert ("3(e)" in content or "synergism" in content.lower() or "Patents Act" in content)


def test_deep_agent_skills_override_and_disable():
    """Verify skills can be explicitly disabled via skills=[] without errors."""
    agent_no_skills = build_ayush_deep_agent(skills=[])
    assert agent_no_skills is not None
    assert hasattr(agent_no_skills, "invoke")
