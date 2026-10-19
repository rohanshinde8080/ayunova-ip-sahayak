"""
AYUNOVA Knowledge Base: Official Legal Statutes, Rules & International Treaties.
Authoritative data sources covering Patents Act 1970, Drugs & Cosmetics Act 1940,
Biological Diversity Act 2002, TKDL Corpus, and WIPO GRATK Treaty 2024.
"""

from typing import Dict, List, Optional
from app.models.schemas import SourceCitation

OFFICIAL_SOURCES: Dict[str, SourceCitation] = {
    "sec-3p-patents": SourceCitation(
        id="sec-3p-patents",
        title="Patents Act, 1970 - Section 3(p)",
        authority="Indian Patent Office (IPO) / CGPDTM",
        section="Section 3(p) - Traditional Knowledge Bar",
        page="Page 12, IPO Guidelines for Examination of Ayush Inventions (2023)",
        jurisdiction="India",
        verified=True,
        summary=(
            "Statutory exclusion barring patents for an invention which in effect is "
            "traditional knowledge or which is an aggregation or duplication of known "
            "properties of traditionally known component or components."
        ),
        gazetteExcerpt=(
            "Section 3: What are not inventions: (p) an invention which in effect is "
            "traditional knowledge or which is an aggregation or duplication of known "
            "properties of traditionally known component or components."
        ),
        officialAct="The Patents Act, 1970 (Act No. 39 of 1970) as amended by Patents (Amendment) Act 2005"
    ),
    "sec-3e-patents": SourceCitation(
        id="sec-3e-patents",
        title="Patents Act, 1970 - Section 3(e) & Synergism",
        authority="Indian Patent Office (IPO)",
        section="Section 3(e) - Mere Admixture",
        page="Page 18, Guidelines for Processing Patent Applications for Herbs",
        jurisdiction="India",
        verified=True,
        summary=(
            "A substance obtained by a mere admixture resulting only in the aggregation "
            "of the properties of the components thereof or a process for producing such "
            "substance is non-patentable unless synergistic effect is scientifically demonstrated."
        ),
        gazetteExcerpt=(
            "Section 3(e): a substance obtained by a mere admixture resulting only in "
            "the aggregation of the properties of the components thereof or a process "
            "for producing such substance."
        ),
        officialAct="The Patents Act, 1970"
    ),
    "tkdl-database": SourceCitation(
        id="tkdl-database",
        title="Traditional Knowledge Digital Library (TKDL) Prior Art",
        authority="CSIR & Ministry of Ayush, Government of India",
        section="TKDL Corpus Indexing & Pre-Grant Opposition Protocols",
        page="TKDL Reference ID: AY-TK-TRIPHALA-402",
        jurisdiction="India",
        verified=True,
        summary=(
            "TKDL documents prior art formulation from authoritative classical treatises "
            "including Charaka Samhita, Sushruta Samhita, and Ashtanga Hridaya, preventing "
            "wrongful patent grants globally."
        ),
        gazetteExcerpt=(
            "Documented in Charaka Samhita Sutrasthana Ch. 4; Bhavaprakasha Nighantu "
            "Haritakyadi Varga. Formulation of Haritaki, Bibhitaki, and Amalaki in equal proportions."
        ),
        officialAct="CSIR-Ayush TKDL Access Agreement"
    ),
    "bda-2002-sec3": SourceCitation(
        id="bda-2002-sec3",
        title="Biological Diversity Act, 2002 (as amended 2023)",
        authority="National Biodiversity Authority (NBA), Chennai",
        section="Section 3, 4 & Section 6 (Form III Prior Approval for IPR)",
        page="NBA Gazette Notification No. S.O. 1911(E)",
        jurisdiction="India",
        verified=True,
        summary=(
            "Mandatory prior approval (Form III) from National Biodiversity Authority before "
            "obtaining any intellectual property right in or outside India for any invention "
            "based on any research or information on a biological resource obtained from India."
        ),
        gazetteExcerpt=(
            "Section 6(1): No person shall apply for any intellectual property right, by "
            "whatever name called, in or outside India for any invention based on any biological "
            "resource obtained from India without previous approval of NBA."
        ),
        officialAct="Biological Diversity Act, 2002 & Biodiversity (Amendment) Act, 2023"
    ),
    "dca-rule-158b": SourceCitation(
        id="dca-rule-158b",
        title="Drugs and Cosmetics Rules, 1945 - Rule 158B & Form 25D",
        authority="Central Drugs Standard Control Organization (CDSCO) / Ministry of Ayush",
        section="Rule 158B - Guidelines for Issue of License for Ayurvedic/Siddha/Unani Drugs",
        page="Schedule A, Form 25D Licensing Framework",
        jurisdiction="India",
        verified=True,
        summary=(
            "Regulatory mandate specifying safety, stability, proof of effectiveness, "
            "and publication data required for Ayurvedic Patent & Proprietary (P&P) and Classical medicines."
        ),
        gazetteExcerpt=(
            "Rule 158B: Requirement of submission of evidence on safety and efficacy "
            "for licensing of Ayurvedic, Siddha and Unani drugs under Form 25D."
        ),
        officialAct="Drugs and Cosmetics Act, 1940 and Rules 1945"
    ),
    "wipo-gratk-2024": SourceCitation(
        id="wipo-gratk-2024",
        title="WIPO Treaty on Intellectual Property, Genetic Resources and Associated Traditional Knowledge (2024)",
        authority="World Intellectual Property Organization (WIPO), Geneva",
        section="Article 3 - Mandatory Disclosure of Origin",
        page="WIPO Diplomatic Conference Final Act (May 24, 2024)",
        jurisdiction="International",
        verified=True,
        summary=(
            "Landmark treaty establishing mandatory patent disclosure requirements for "
            "inventions based on genetic resources and associated traditional knowledge."
        ),
        gazetteExcerpt=(
            "Article 3: Where the claimed invention in a patent application is based on "
            "genetic resources, applicants shall disclose the country of origin of the genetic resources."
        ),
        officialAct="WIPO GRATK Treaty (Geneva, 2024)"
    )
}

def get_official_source(source_id: str) -> Optional[SourceCitation]:
    """Retrieve an official source citation by ID."""
    return OFFICIAL_SOURCES.get(source_id)

def list_official_sources() -> List[SourceCitation]:
    """List all available official source citations."""
    return list(OFFICIAL_SOURCES.values())
