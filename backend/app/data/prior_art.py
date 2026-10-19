"""
AYUNOVA Prior Art Dataset: Classical Ayurvedic Formulations & Treatises.
Documented prior art records referenced by TKDL (CSIR & Ministry of Ayush)
for novelty evaluation against Section 3(p) Traditional Knowledge exclusion.
"""

from typing import List, Dict, Any, Optional

PRIOR_ART_RECORDS: List[Dict[str, Any]] = [
    {
        "reference_code": "TKDL-AY-TRIPHALA-402",
        "formulation_name": "Triphala Churna",
        "classical_treatise": "Charaka Samhita, Chikitsasthana Ch. 1; Bhavaprakasha Nighantu",
        "ingredients": [
            "Haritaki (Terminalia chebula)",
            "Bibhitaki (Terminalia bellirica)",
            "Amalaki (Phyllanthus emblica)"
        ],
        "therapeutic_indications": [
            "Rasayana (Rejuvenator)",
            "Digestive Disorders (Deepana/Pachana)",
            "Ocular Health (Chakshushya)",
            "Metabolic Support (Prameha)"
        ],
        "tkdl_status": "Protected Prior Art (TKDL CSIR-Ayush)",
        "content_text": (
            "Classical Ayurvedic formulation consisting of dried fruits of Haritaki, "
            "Bibhitaki, and Amalaki in equal proportions (1:1:1). Documented in Charaka "
            "Samhita as a prime Rasayana formulation and bowel regulator. Direct product "
            "patents are barred under Indian Patents Act Section 3(p)."
        )
    },
    {
        "reference_code": "TKDL-AY-CHYAWANPRASH-101",
        "formulation_name": "Chyawanprash Avaleha",
        "classical_treatise": "Charaka Samhita, Chikitsasthana 1:1:62-74; Sharangadhara Samhita",
        "ingredients": [
            "Amalaki (Emblica officinalis)",
            "Dashamula",
            "Ashtavarga",
            "Pippali",
            "Ghrita",
            "Guda/Honey"
        ],
        "therapeutic_indications": [
            "Immunomodulator (Rasayana)",
            "Respiratory Strength (Kasa-Shvasa Hara)",
            "Longevity (Vayasthapana)"
        ],
        "tkdl_status": "Protected Prior Art (TKDL CSIR-Ayush)",
        "content_text": (
            "Herbal jam formulation containing processed fresh Amalaki pulp cooked with "
            "decoction of 48 herbal ingredients, clarified butter, and raw sugar. Renowned "
            "classical revitalizer. Synergistic botanical delivery barred under Section 3(e) "
            "unless extraction step produces novel synergistic efficacy."
        )
    },
    {
        "reference_code": "TKDL-AY-YOGARAJ-GUGGULU-204",
        "formulation_name": "Yogaraj Guggulu",
        "classical_treatise": "Bhaishajya Ratnavali, Amavata Chikitsa; Sharangadhara Samhita",
        "ingredients": [
            "Shuddha Guggulu (Commiphora mukul)",
            "Chitraka",
            "Pippalimula",
            "Triphala",
            "Gokshura"
        ],
        "therapeutic_indications": [
            "Vatavyadhi (Neuromuscular & Joint disorders)",
            "Amavata (Rheumatoid arthritis)",
            "Anti-inflammatory"
        ],
        "tkdl_status": "Protected Prior Art (TKDL CSIR-Ayush)",
        "content_text": (
            "Standard classical polyherbal Guggulu preparation indicated for inflammatory "
            "rheumatic ailments. High resin content requires purification (Shodhana). "
            "TKDL documented pre-grant opposition reference against wrongful foreign patent "
            "filings on Commiphora extracts."
        )
    },
    {
        "reference_code": "TKDL-AY-TRIKATU-089",
        "formulation_name": "Trikatu Churna",
        "classical_treatise": "Sushruta Samhita, Sutrasthana Ch. 38; Ashtanga Hridaya",
        "ingredients": [
            "Shunthi (Zingiber officinale)",
            "Maricha (Piper nigrum)",
            "Pippali (Piper longum)"
        ],
        "therapeutic_indications": [
            "Deepana-Pachana (Digestive Fire Enhancer)",
            "Bioavailability Enhancer (Yogavahi)",
            "Respiratory congestion (Kaphahara)"
        ],
        "tkdl_status": "Protected Prior Art (TKDL CSIR-Ayush)",
        "content_text": (
            "Pungent triad formulation with high piperine and gingerol bio-enhancer properties. "
            "Widely used to augment absorption in classical delivery systems. Prior art "
            "against generic bio-enhancer patent claims lacking novel synthetic functionalization."
        )
    },
    {
        "reference_code": "TKDL-AY-SITOPALADI-310",
        "formulation_name": "Sitopaladi Churna",
        "classical_treatise": "Sharangadhara Samhita, Madhyama Khanda Ch. 6",
        "ingredients": [
            "Sitopala (Rock sugar / Mishri)",
            "Vamshalochana (Bambusa bambos)",
            "Pippali (Piper longum)",
            "Ela (Elettaria cardamomum)",
            "Twak (Cinnamomum verum)"
        ],
        "therapeutic_indications": [
            "Kasa-Shwasa (Cough and Cold)",
            "Mandagni (Low Appetite)",
            "Suptata (Burning sensation in hands and feet)"
        ],
        "tkdl_status": "Protected Prior Art (TKDL CSIR-Ayush)",
        "content_text": (
            "Classical formulation for upper respiratory tract infections and cough. "
            "Graduated proportions (16:8:4:2:1) specified in Sharangadhara Samhita. "
            "Serves as TKDL benchmark preventing broad monopoly claims on polyherbal cough syrups."
        )
    }
]

def get_prior_art(ref_code: str) -> Optional[Dict[str, Any]]:
    """Retrieve prior art entry by TKDL reference code."""
    for art in PRIOR_ART_RECORDS:
        if art["reference_code"] == ref_code:
            return art
    return None

def list_prior_art() -> List[Dict[str, Any]]:
    """List all classical prior art formulation records."""
    return PRIOR_ART_RECORDS
