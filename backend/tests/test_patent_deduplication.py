"""
Test suite for Phase 2: Patent Verification, Family Grouping,
Deduplication Engine, and Section 4 Table Formatting.
"""

import pytest
from app.models.schemas import PatentRecord, SourceCitation
from app.services.patent_deduplication import (
    PatentDeduplicationEngine,
    VERIFIED_PATENT_REGISTRY
)


def test_normalize_publication_number():
    """Verify normalization of various publication number formats."""
    assert PatentDeduplicationEngine.normalize_publication_number("US 11,992,510") == "US11992510"
    assert PatentDeduplicationEngine.normalize_publication_number("US-11992510-B2") == "US11992510B2"
    assert PatentDeduplicationEngine.normalize_publication_number("WO/2023/141607 A2") == "WO2023141607A2"
    assert PatentDeduplicationEngine.normalize_publication_number("EP 0436257 B1") == "EP0436257B1"
    assert PatentDeduplicationEngine.normalize_publication_number("") == ""


def test_jurisdiction_detection():
    """Verify jurisdiction detection from standard prefixes."""
    assert PatentDeduplicationEngine.detect_jurisdiction("US11992510B2") == "USA"
    assert PatentDeduplicationEngine.detect_jurisdiction("WO2023141607A2") == "WIPO / International"
    assert PatentDeduplicationEngine.detect_jurisdiction("EP3955931A1") == "EPO / Europe"
    assert PatentDeduplicationEngine.detect_jurisdiction("IN202111012345") == "India"


def test_patent_deduplication_exact_duplicates():
    """Verify identical publication numbers are never counted twice (Section 8)."""
    p1 = PatentRecord(
        publicationNumber="US11992510B2",
        title="Probiotic Triphala"
    )
    p2 = PatentRecord(
        publicationNumber="US-11992510-B2",  # Different formatting, same publication
        title="Probiotic Triphala Duplicate"
    )
    p3 = PatentRecord(
        publicationNumber="US 11,992,510 B2",  # Another formatting variant
        title="Probiotic Triphala Variant"
    )

    result = PatentDeduplicationEngine.reconcile_and_deduplicate([p1, p2, p3])
    assert result["total_raw"] == 3
    assert result["unique_count"] == 1
    assert result["duplicate_count"] == 2
    assert len(result["records"]) == 1
    assert result["records"][0].publicationNumber == "US11992510B2"


def test_patent_family_detection_and_tagging():
    """Verify members of the same patent family are detected and tagged (Section 8)."""
    p_us = PatentRecord(
        publicationNumber="US11992510B2",
        title="Synergistic probiotic compositions comprising Triphala extract",
        patentFamily="FAM-TRI-PROVIVA-01"
    )
    p_wo = PatentRecord(
        publicationNumber="WO2020214811A1",
        title="Synergistic probiotic compositions comprising Triphala extract",
        patentFamily="FAM-TRI-PROVIVA-01"
    )
    p_ep = PatentRecord(
        publicationNumber="EP3955931A1",
        title="Synergistic probiotic compositions comprising Triphala extract",
        patentFamily="FAM-TRI-PROVIVA-01"
    )
    p_other = PatentRecord(
        publicationNumber="WO2023141607A2",
        title="Withania somnifera extracts",
        patentFamily="FAM-ASH-NATREON-02"
    )

    result = PatentDeduplicationEngine.reconcile_and_deduplicate([p_us, p_wo, p_ep, p_other])
    assert result["unique_count"] == 4
    assert result["genuinely_unique_inventions"] == 2  # 2 unique families: Proviva Triphala + Natreon Ashwagandha
    assert result["family_member_count"] == 2

    # Verify secondary family members are flagged with isFamilyMember=True
    records = result["records"]
    assert records[0].isFamilyMember is False  # Primary discovery
    assert records[1].isFamilyMember is True   # Same patent family
    assert records[2].isFamilyMember is True   # Same patent family
    assert records[3].isFamilyMember is False  # Independent invention family


def test_unverified_metadata_defaults():
    """Verify unverified fields strictly default to 'Not Verified' (Section 7)."""
    raw = PatentRecord(
        publicationNumber="IN202311099999",
        title="Novel polyherbal formulation"
    )
    result = PatentDeduplicationEngine.reconcile_and_deduplicate([raw])
    record = result["records"][0]
    assert record.applicationNumber == "Not Verified"
    assert record.applicant == "Not Verified"
    assert record.priorityDate == "Not Verified"
    assert record.grantDate == "Not Verified"
    assert record.legalStatus == "Current legal status not verified."


def test_legal_status_precision():
    """Verify legal status distinguishes granted vs application vs revoked (Section 9)."""
    us_granted = PatentRecord(**VERIFIED_PATENT_REGISTRY["US11992510B2"])
    wo_app = PatentRecord(**VERIFIED_PATENT_REGISTRY["WO2020214811A1"])
    neem_revoked = PatentRecord(**VERIFIED_PATENT_REGISTRY["EP0436257B1"])
    turmeric_revoked = PatentRecord(**VERIFIED_PATENT_REGISTRY["US5401504A"])

    assert "granted" in us_granted.legalStatus.lower()
    assert "application" in wo_app.legalStatus.lower()
    assert "revoked" in neem_revoked.legalStatus.lower()
    assert "revoked" in turmeric_revoked.legalStatus.lower()


def test_extract_patents_from_citations_with_herb():
    """Verify extraction of verified landmark patents matching target herb."""
    citations = [
        SourceCitation(
            id="cit-web-1",
            title="Proviva Pharma US Patent 11992510 for Triphala and Probiotics",
            authority="USPTO Database",
            section="US 11992510 B2",
            summary="Synergistic combination of Triphala with Bacillus coagulans.",
            url="https://patents.google.com/patent/US11992510B2/en"
        )
    ]

    patents = PatentDeduplicationEngine.extract_patents_from_text_or_citations(
        text="Analysis of probiotic Triphala formulations",
        citations=citations,
        target_herb="Triphala"
    )

    assert len(patents) >= 1
    pub_numbers = [p.publicationNumber for p in patents]
    assert "US11992510B2" in pub_numbers
    # Verify no duplicate publication numbers exist
    assert len(pub_numbers) == len(set(pub_numbers))


def test_format_patents_markdown_table():
    """Verify formatting of the Section 4 Markdown Table and Key Pattern."""
    patents = [
        PatentRecord(**VERIFIED_PATENT_REGISTRY["US11992510B2"]),
        PatentRecord(**VERIFIED_PATENT_REGISTRY["WO2023141607A2"])
    ]

    table_md, pattern_md = PatentDeduplicationEngine.format_patents_markdown_table(patents)
    assert "### Found Patents" in table_md
    assert "| Patent | Title | Applicant | Priority | Status | Jurisdiction |" in table_md
    assert "US11992510B2" in table_md
    assert "WO2023141607A2" in table_md
    assert "### Key Pattern" in pattern_md
    assert "Key trend:" in pattern_md
