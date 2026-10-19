"""
Herb and Botanical Query Understanding Service.
Handles query normalization, scientific/botanical name detection,
synonym expansion, and search variant generation for research paper intelligence.
"""

import logging
import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.db_models import HerbSynonym, AyurvedaKnowledge

logger = logging.getLogger("ayunova.herb_service")

# Comprehensive botanical registry with verified scientific taxonomy,
# vernacular names, search terms, and active phytochemical markers.
HERB_REGISTRY: Dict[str, Dict[str, Any]] = {
    "ashwagandha": {
        "id": "ashwagandha",
        "common_name": "Ashwagandha",
        "scientific_name": "Withania somnifera",
        "family": "Solanaceae",
        "sanskrit_name": "Ashwagandha (अश्वगंधा)",
        "vernacular_names": ["Indian Ginseng", "Winter Cherry", "Asgandh", "Hayahvaya"],
        "synonyms": [
            "Withania somnifera",
            "Physalis somnifera",
            "Indian Ginseng",
            "Winter Cherry",
            "Asgandh",
            "Withania somnifera Dunal"
        ],
        "search_variations": [
            "Withania somnifera",
            "Ashwagandha",
            "Withania somnifera root extract",
            "Withaferin A",
            "Withanolides"
        ],
        "active_markers": ["Withaferin A", "Withanolide A", "Withanolide B", "Withanone", "Sominone"],
        "therapeutic_areas": ["Neuroprotection", "Adaptogen & Stress Reduction", "Immunomodulation", "Anti-inflammatory", "Sleep & Anxiety", "Endurance"],
        "overview": "Withania somnifera, famously known as Ashwagandha or Indian Ginseng, is a premier Rasayana herb in Ayurveda celebrated for its profound adaptogenic, neuroprotective, and immunomodulatory properties."
    },
    "tulsi": {
        "id": "tulsi",
        "common_name": "Tulsi",
        "scientific_name": "Ocimum tenuiflorum",
        "family": "Lamiaceae",
        "sanskrit_name": "Tulasi (तुलसी)",
        "vernacular_names": ["Holy Basil", "Sacred Basil", "Surasa", "Vishnupriya"],
        "synonyms": [
            "Ocimum tenuiflorum",
            "Ocimum sanctum",
            "Holy Basil",
            "Sacred Basil",
            "Ocimum gratissimum",
            "Tulasi"
        ],
        "search_variations": [
            "Ocimum tenuiflorum",
            "Ocimum sanctum",
            "Holy Basil",
            "Tulsi extract",
            "Eugenol Ocimum"
        ],
        "active_markers": ["Eugenol", "Rosmarinic Acid", "Ursolic Acid", "Caryophyllene", "Apigenin"],
        "therapeutic_areas": ["Respiratory Health", "Antiviral & Antimicrobial", "Adaptogen", "Metabolic Syndrome", "Cardioprotection"],
        "overview": "Ocimum tenuiflorum (syn. Ocimum sanctum), Holy Basil, is revered as 'The Queen of Herbs' in Ayurveda for its exceptional adaptogenic, antimicrobial, and respiratory therapeutic actions."
    },
    "neem": {
        "id": "neem",
        "common_name": "Neem",
        "scientific_name": "Azadirachta indica",
        "family": "Meliaceae",
        "sanskrit_name": "Nimba (निम्ब)",
        "vernacular_names": ["Indian Lilac", "Margosa", "Arishta", "Vembu"],
        "synonyms": [
            "Azadirachta indica",
            "Melia azadirachta",
            "Indian Lilac",
            "Margosa",
            "Nimba"
        ],
        "search_variations": [
            "Azadirachta indica",
            "Neem extract",
            "Azadirachtin",
            "Nimbin",
            "Melia azadirachta"
        ],
        "active_markers": ["Azadirachtin", "Nimbin", "Nimbidin", "Gedunin", "Salannin"],
        "therapeutic_areas": ["Antimicrobial & Antibacterial", "Dermatology & Wound Healing", "Anti-diabetic", "Hepatoprotection", "Pest & Parasite Resistance"],
        "overview": "Azadirachta indica (Neem) is documented as 'Sarva Roga Nivarini' (the panacea for all diseases) with potent broad-spectrum antibacterial, antifungal, anti-inflammatory, and wound-healing mechanisms."
    },
    "turmeric": {
        "id": "turmeric",
        "common_name": "Turmeric",
        "scientific_name": "Curcuma longa",
        "family": "Zingiberaceae",
        "sanskrit_name": "Haridra (हरिद्रा)",
        "vernacular_names": ["Haldi", "Indian Saffron", "Curcumin", "Nisha", "Gauri"],
        "synonyms": [
            "Curcuma longa",
            "Curcuma domestica",
            "Turmeric",
            "Haldi",
            "Curcumin",
            "Haridra"
        ],
        "search_variations": [
            "Curcuma longa",
            "Curcumin",
            "Curcuminoids",
            "Turmeric rhizome extract",
            "Haridra"
        ],
        "active_markers": ["Curcumin", "Demethoxycurcumin", "Bisdemethoxycurcumin", "Turmerones", "Zingiberene"],
        "therapeutic_areas": ["Anti-inflammatory", "Antioxidant", "Joint Health & Arthritis", "Cancer Chemoprevention", "Gastrointestinal Health", "Metabolic Regulation"],
        "overview": "Curcuma longa (Turmeric/Haridra) is one of the most extensively studied medicinal plants in modern science, renowned for its golden curcuminoids that regulate NF-kB, COX-2, and inflammatory cascades."
    },
    "brahmi": {
        "id": "brahmi",
        "common_name": "Brahmi",
        "scientific_name": "Bacopa monnieri",
        "family": "Plantaginaceae",
        "sanskrit_name": "Brahmi (ब्राह्मी)",
        "vernacular_names": ["Water Hyssop", "Herpestis monniera", "Jalaneemb", "Indian Pennywort"],
        "synonyms": [
            "Bacopa monnieri",
            "Herpestis monniera",
            "Water Hyssop",
            "Brahmi",
            "Bacopa monniera"
        ],
        "search_variations": [
            "Bacopa monnieri",
            "Brahmi",
            "Bacosides",
            "Bacopa extract",
            "Water Hyssop"
        ],
        "active_markers": ["Bacoside A", "Bacoside B", "Bacopasaponins", "Betulinic Acid", "Luteolin"],
        "therapeutic_areas": ["Cognitive Enhancement", "Memory & Learning", "Neuroprotection", "Anxiolytic", "Alzheimer's & Dementia Research"],
        "overview": "Bacopa monnieri (Brahmi) is the supreme Medhya Rasayana (mind rejuvenator) in Ayurveda, clinically validated to enhance synaptic transmission, memory consolidation, and neuroplasticity."
    },
    "shatavari": {
        "id": "shatavari",
        "common_name": "Shatavari",
        "scientific_name": "Asparagus racemosus",
        "family": "Asparagaceae",
        "sanskrit_name": "Shatavari (शतावरी)",
        "vernacular_names": ["Satavar", "Shatamuli", "Abhiru", "Wild Asparagus"],
        "synonyms": [
            "Asparagus racemosus",
            "Shatavari",
            "Satavar",
            "Asparagus racemosus Willd."
        ],
        "search_variations": [
            "Asparagus racemosus",
            "Shatavari",
            "Shatavarins",
            "Asparagus racemosus root",
            "Shatamuli"
        ],
        "active_markers": ["Shatavarin I-IV", "Sarsasapogenin", "Diosgenin", "Racemoside", "Isoflavones"],
        "therapeutic_areas": ["Female Reproductive Health", "Hormonal Balance", "Galactagogue", "Immunomodulation", "Gastric Ulcer Protection"],
        "overview": "Asparagus racemosus (Shatavari) translates to 'she who possesses a hundred husbands', renowned for promoting endocrine balance, reproductive vitality, mucosal gut health, and systemic immunity."
    },
    "giloy": {
        "id": "giloy",
        "common_name": "Giloy",
        "scientific_name": "Tinospora cordifolia",
        "family": "Menispermaceae",
        "sanskrit_name": "Guduchi (गुडूची)",
        "vernacular_names": ["Guduchi", "Amrita", "Heart-leaved Moonseed", "Chakralakshana"],
        "synonyms": [
            "Tinospora cordifolia",
            "Guduchi",
            "Giloy",
            "Heart-leaved Moonseed",
            "Amrita",
            "Tinospora sinensis"
        ],
        "search_variations": [
            "Tinospora cordifolia",
            "Guduchi",
            "Giloy extract",
            "Tinosporoside",
            "Tinospora cordifolia Miers"
        ],
        "active_markers": ["Tinosporoside", "Cordifolioside", "Berberine", "Tinocordiside", "Palmatine"],
        "therapeutic_areas": ["Immune Modulation", "Antipyretic (Fever Relief)", "Liver Protection (Hepatoprotective)", "Anti-diabetic", "Antioxidant"],
        "overview": "Tinospora cordifolia (Giloy/Guduchi), termed 'Amrita' (immortality nectar), is a vital climbing shrub that enhances macrophage activation, purges hepatic toxins, and stabilizes glycemic levels."
    },
    "guggulu": {
        "id": "guggulu",
        "common_name": "Guggulu",
        "scientific_name": "Commiphora mukul",
        "family": "Burseraceae",
        "sanskrit_name": "Guggulu (गुग्गुलु)",
        "vernacular_names": ["Guggul", "Indian Bdellium", "Commiphora wightii", "Devadhupa"],
        "synonyms": [
            "Commiphora mukul",
            "Commiphora wightii",
            "Balsamodendron mukul",
            "Guggul",
            "Guggulu"
        ],
        "search_variations": [
            "Commiphora mukul",
            "Commiphora wightii",
            "Guggulsterone",
            "Guggulu resin",
            "Indian Bdellium"
        ],
        "active_markers": ["E-Guggulsterone", "Z-Guggulsterone", "Guggulsterols", "Myrcene", "Mukulembo"],
        "therapeutic_areas": ["Hypolipidemic & Cholesterol Reduction", "Cardiovascular Protection", "Osteoarthritis & Anti-arthritic", "Thyroid Modulation", "Obesity"],
        "overview": "Commiphora mukul (Guggulu) oleo-gum-resin contains bioactive guggulsterones that act as potent FXR receptor antagonists, clearing lipid plaques and relieving inflammatory joint degeneration."
    },
    "amla": {
        "id": "amla",
        "common_name": "Amla",
        "scientific_name": "Phyllanthus emblica",
        "family": "Phyllanthaceae",
        "sanskrit_name": "Amalaki (आमलकी)",
        "vernacular_names": ["Indian Gooseberry", "Emblica officinalis", "Dhatri", "Amritaphala"],
        "synonyms": [
            "Phyllanthus emblica",
            "Emblica officinalis",
            "Indian Gooseberry",
            "Amalaki",
            "Amla"
        ],
        "search_variations": [
            "Phyllanthus emblica",
            "Emblica officinalis",
            "Amla extract",
            "Emblicanin",
            "Indian Gooseberry"
        ],
        "active_markers": ["Emblicanin A", "Emblicanin B", "Ascorbic Acid (Vitamin C)", "Ellagic Acid", "Gallic Acid"],
        "therapeutic_areas": ["Potent Antioxidant", "Cellular Rejuvenation", "Cardioprotection", "Hepatoprotection", "Hair & Skin Health", "Anti-aging"],
        "overview": "Phyllanthus emblica (Emblica officinalis/Amalaki) is nature's richest source of bio-stable polyphenolic antioxidants and Vitamin C, forming the cornerstone of Chyawanprash and Triphala formulations."
    },
    "mulethi": {
        "id": "mulethi",
        "common_name": "Mulethi",
        "scientific_name": "Glycyrrhiza glabra",
        "family": "Fabaceae",
        "sanskrit_name": "Yashtimadhu (यष्टिमधु)",
        "vernacular_names": ["Licorice", "Liquorice", "Madhuka", "Jethimadh"],
        "synonyms": [
            "Glycyrrhiza glabra",
            "Licorice",
            "Liquorice",
            "Yashtimadhu",
            "Mulethi",
            "Sweetwood"
        ],
        "search_variations": [
            "Glycyrrhiza glabra",
            "Glycyrrhizin",
            "Licorice root extract",
            "Liquorice",
            "Yashtimadhu"
        ],
        "active_markers": ["Glycyrrhizin", "Glycyrrhetinic Acid", "Glabridin", "Isoliquiritigenin", "Liquiritin"],
        "therapeutic_areas": ["Respiratory & Throat Soothing", "Anti-ulcer & Gastroprotection", "Hepatoprotection", "Anti-inflammatory", "Skin Brightening"],
        "overview": "Glycyrrhiza glabra (Mulethi/Yashtimadhu) root is packed with saponin glycyrrhizin, acting as a soothing demulcent, anti-inflammatory agent, and gastric mucosal protectant."
    },
    "arjuna": {
        "id": "arjuna",
        "common_name": "Arjuna",
        "scientific_name": "Terminalia arjuna",
        "family": "Combretaceae",
        "sanskrit_name": "Arjuna (अर्जुन)",
        "vernacular_names": ["Arjun", "Kakubha", "Dhavala", "Partha"],
        "synonyms": [
            "Terminalia arjuna",
            "Arjuna",
            "Terminalia arjuna Roxb.",
            "Kakubha"
        ],
        "search_variations": [
            "Terminalia arjuna",
            "Arjuna bark extract",
            "Arjunic acid",
            "Arjunetin",
            "Terminalia arjuna heart"
        ],
        "active_markers": ["Arjunic Acid", "Arjunetin", "Arjungenin", "Terminic Acid", "Coenzyme Q10 analogues"],
        "therapeutic_areas": ["Cardiotonic & Heart Failure", "Coronary Artery Health", "Antihypertensive", "Antianginal", "Endothelial Function"],
        "overview": "Terminalia arjuna bark is the preeminent Ayurvedic cardioprotective botanic, strengthening myocardial tone, decreasing oxidative vascular damage, and supporting healthy coronary blood flow."
    },
    "haritaki": {
        "id": "haritaki",
        "common_name": "Haritaki",
        "scientific_name": "Terminalia chebula",
        "family": "Combretaceae",
        "sanskrit_name": "Haritaki (हरीतकी)",
        "vernacular_names": ["Chebulic Myrobalan", "Harad", "Abhaya", "Pathya"],
        "synonyms": [
            "Terminalia chebula",
            "Chebulic Myrobalan",
            "Haritaki",
            "Harad",
            "Abhaya"
        ],
        "search_variations": [
            "Terminalia chebula",
            "Chebulic Myrobalan",
            "Haritaki extract",
            "Chebulinic acid",
            "Terminalia chebula fruit"
        ],
        "active_markers": ["Chebulinic Acid", "Chebulagic Acid", "Corilagin", "Ellagic Acid", "Gallic Acid"],
        "therapeutic_areas": ["Digestive Motility & Gut Health", "Laxative & Detoxification", "Metabolic Regulation", "Antimicrobial", "Longevity"],
        "overview": "Terminalia chebula (Haritaki) is acclaimed as the 'King of Medicines' in Tibetan medicine and Ayurveda, renowned for clearing gastrointestinal toxins while toning intestinal tissues."
    },
    "bibhitaki": {
        "id": "bibhitaki",
        "common_name": "Bibhitaki",
        "scientific_name": "Terminalia bellirica",
        "family": "Combretaceae",
        "sanskrit_name": "Bibhitaki (बिभीतकी)",
        "vernacular_names": ["Belleric Myrobalan", "Baheda", "Vibhitaka", "Kalidruma"],
        "synonyms": [
            "Terminalia bellirica",
            "Terminalia bellerica",
            "Belleric Myrobalan",
            "Bibhitaki",
            "Baheda"
        ],
        "search_variations": [
            "Terminalia bellirica",
            "Terminalia bellerica",
            "Belleric Myrobalan",
            "Bibhitaki extract",
            "Baheda"
        ],
        "active_markers": ["Belleric Acid", "Chebulagic Acid", "Gallic Acid", "Ellagic Acid", "Beta-Sitosterol"],
        "therapeutic_areas": ["Respiratory Mucus Clearance", "Bronchodilation", "Hepatoprotection", "Ocular Health", "Triphala Component"],
        "overview": "Terminalia bellirica (Bibhitaki/Baheda) is particularly specific for pacifying Kapha dosha, clearing excess respiratory mucus, and reducing systemic fat deposits."
    },
    "shallaki": {
        "id": "shallaki",
        "common_name": "Shallaki",
        "scientific_name": "Boswellia serrata",
        "family": "Burseraceae",
        "sanskrit_name": "Shallaki (शल्लकी)",
        "vernacular_names": ["Indian Frankincense", "Kunduru", "Salai Guggul", "Olibanum"],
        "synonyms": [
            "Boswellia serrata",
            "Indian Frankincense",
            "Shallaki",
            "Boswellia serrata Roxb.",
            "Salai"
        ],
        "search_variations": [
            "Boswellia serrata",
            "Boswellic acids",
            "AKBA Boswellia",
            "Indian Frankincense",
            "Shallaki resin"
        ],
        "active_markers": ["Acetyl-11-keto-beta-boswellic acid (AKBA)", "11-keto-beta-boswellic acid", "Beta-boswellic acid"],
        "therapeutic_areas": ["Osteoarthritis & Joint Mobility", "Inhibition of 5-LOX Enzyme", "Inflammatory Bowel Disease (IBD)", "Asthma"],
        "overview": "Boswellia serrata (Shallaki) gum resin is the world's most proven natural 5-Lipoxygenase (5-LOX) inhibitor, delivering powerful non-NSAID relief for joint pain and cartilage preservation."
    },
    "kalmegh": {
        "id": "kalmegh",
        "common_name": "Kalmegh",
        "scientific_name": "Andrographis paniculata",
        "family": "Acanthaceae",
        "sanskrit_name": "Bhunimba (भूनिम्ब)",
        "vernacular_names": ["King of Bitters", "Green Chiretta", "Mahatita", "Alui"],
        "synonyms": [
            "Andrographis paniculata",
            "Kalmegh",
            "King of Bitters",
            "Green Chiretta",
            "Bhunimba"
        ],
        "search_variations": [
            "Andrographis paniculata",
            "Andrographolide",
            "Kalmegh extract",
            "King of Bitters"
        ],
        "active_markers": ["Andrographolide", "Neoandrographolide", "14-Deoxyandrographolide", "Andrograpanin"],
        "therapeutic_areas": ["Upper Respiratory Infections", "Antiviral & Antipyretic", "Hepatoprotection", "Immune Stimulation", "Anti-inflammatory"],
        "overview": "Andrographis paniculata (Kalmegh), the 'King of Bitters', possesses clinical efficacy against acute upper respiratory tract infections, influenza symptoms, and hepatic inflammation."
    }
}


class HerbService:
    """Provides taxonomic resolution, synonym expansion, and query normalization."""

    @staticmethod
    def normalize_query(query: str) -> str:
        """Strips leading/trailing whitespace, punctuation, and converts to lowercase."""
        if not query:
            return ""
        q = query.strip().lower()
        # Remove common search prefix words like 'research on', 'papers about', 'study on'
        q = re.sub(r'^(research\s+(on|about|for)|papers\s+(on|about|for)|studies\s+(on|about|for)|clinical\s+trials\s+on)\s+', '', q)
        # Remove special characters except hyphens and spaces
        q = re.sub(r'[^\w\s\-]', ' ', q)
        return " ".join(q.split())

    @classmethod
    def resolve_herb(cls, query: str, db: Optional[Session] = None) -> Dict[str, Any]:
        """
        Resolves a user query (e.g. 'ashwagandha', 'tulsi', 'withania somnifera', 'turmeric')
        into a rich botanical profile with verified scientific name, family, synonyms,
        and targeted search variations for multi-source scholarly retrieval.
        """
        norm_q = cls.normalize_query(query)
        if not norm_q:
            return cls._empty_profile("Unknown")

        # 1. Direct registry lookup
        for key, herb_data in HERB_REGISTRY.items():
            if key in norm_q or norm_q in key:
                return herb_data

            # Check common name and scientific name
            if herb_data["common_name"].lower() in norm_q or herb_data["scientific_name"].lower() in norm_q:
                return herb_data

            # Check vernacular names and synonyms
            for syn in herb_data.get("synonyms", []):
                if syn.lower() in norm_q or norm_q in syn.lower():
                    return herb_data

            for vern in herb_data.get("vernacular_names", []):
                if vern.lower() in norm_q or norm_q in vern.lower():
                    return herb_data

        # 2. Check PostgreSQL ayurveda_knowledge table via database
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            pattern = f"%{norm_q}%"
            record = (
                db.query(AyurvedaKnowledge)
                .filter(
                    AyurvedaKnowledge.is_active == True,
                    (
                        AyurvedaKnowledge.common_name.ilike(pattern) |
                        AyurvedaKnowledge.botanical_name.ilike(pattern) |
                        AyurvedaKnowledge.sanskrit_name.ilike(pattern) |
                        AyurvedaKnowledge.id.ilike(pattern)
                    )
                )
                .first()
            )
            if record:
                # Build profile dynamically
                c_name = record.common_name or norm_q.capitalize()
                b_name = record.botanical_name or norm_q.capitalize()
                return {
                    "id": record.id or norm_q.replace(" ", "-"),
                    "common_name": c_name,
                    "scientific_name": b_name,
                    "family": (record.doc_metadata or {}).get("taxonomy", {}).get("family", "Plantae"),
                    "sanskrit_name": record.sanskrit_name or c_name,
                    "vernacular_names": [c_name],
                    "synonyms": [b_name, c_name],
                    "search_variations": [b_name, c_name, f"{b_name} extract"],
                    "active_markers": [m.strip() for m in (record.active_markers or "").split(",") if m.strip()],
                    "therapeutic_areas": [ind.strip() for ind in (record.indications or "").split(",") if ind.strip()],
                    "overview": record.patentable_avenues or f"Medicinal plant {c_name} ({b_name}) documented in classical Ayurvedic texts."
                }
        except Exception as e:
            logger.warning(f"Database botanical lookup fallback error for '{query}': {e}")
        finally:
            if close_session:
                db.close()

        # 3. Dynamic Fallback for any other medicinal plant or species query
        # If user entered a scientific name like "Moringa oleifera" or common name "Moringa"
        title_case = norm_q.title()
        return {
            "id": norm_q.replace(" ", "-"),
            "common_name": title_case,
            "scientific_name": title_case,
            "family": "Plantae",
            "sanskrit_name": title_case,
            "vernacular_names": [title_case],
            "synonyms": [title_case],
            "search_variations": [norm_q, f"{norm_q} extract", f"{norm_q} medicinal"],
            "active_markers": ["Phytochemical constituents"],
            "therapeutic_areas": ["Pharmacological evaluation", "Traditional medicine"],
            "overview": f"Scholarly research profile for medicinal plant '{title_case}'."
        }

    @classmethod
    def get_supported_herbs(cls) -> List[Dict[str, Any]]:
        """Returns list of popular/supported medicinal plants for UI quick-pills."""
        return [
            {
                "id": data["id"],
                "common_name": data["common_name"],
                "scientific_name": data["scientific_name"],
                "sanskrit_name": data["sanskrit_name"],
                "active_marker": data["active_markers"][0] if data["active_markers"] else ""
            }
            for data in HERB_REGISTRY.values()
        ]

    @classmethod
    def seed_synonyms_if_empty(cls, db: Session):
        """Populates herb_synonyms table with verified taxonomy if empty."""
        try:
            count = db.query(HerbSynonym).count()
            if count == 0:
                logger.info("Seeding herb_synonyms table with verified botanical synonyms...")
                for herb_id, data in HERB_REGISTRY.items():
                    # Botanical name
                    db.add(HerbSynonym(
                        herb_id=herb_id,
                        name=data["scientific_name"],
                        type="botanical",
                        source="Botanical Survey of India / IPNI"
                    ))
                    # Sanskrit
                    if data.get("sanskrit_name"):
                        clean_sk = data["sanskrit_name"].split("(")[0].strip()
                        db.add(HerbSynonym(
                            herb_id=herb_id,
                            name=clean_sk,
                            type="sanskrit",
                            source="Ayurvedic Pharmacopoeia of India (API)"
                        ))
                    # Vernacular
                    for v in data.get("vernacular_names", []):
                        db.add(HerbSynonym(
                            herb_id=herb_id,
                            name=v,
                            type="common",
                            source="WHO Monographs / TKDL"
                        ))
                db.commit()
                logger.info("Successfully seeded herb_synonyms table!")
        except Exception as e:
            logger.error(f"Error seeding herb synonyms: {e}")
            db.rollback()

    @staticmethod
    def _empty_profile(name: str) -> Dict[str, Any]:
        return {
            "id": "unknown",
            "common_name": name,
            "scientific_name": name,
            "family": "Plantae",
            "sanskrit_name": name,
            "vernacular_names": [],
            "synonyms": [name],
            "search_variations": [name],
            "active_markers": [],
            "therapeutic_areas": [],
            "overview": "No botanical profile available."
        }
