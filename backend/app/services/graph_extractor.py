import re
import logging
from typing import Dict, Any, List, Set, Tuple, Optional

logger = logging.getLogger("ayunova.graph_extractor")

# --- Canonical Knowledge Lexicon for Ayush IP ---

BOTANICAL_HERBS: Dict[str, Dict[str, Any]] = {
    "Ashwagandha": {
        "canonical_name": "Ashwagandha",
        "botanical_name": "Withania somnifera",
        "family": "Solanaceae",
        "sanskrit_name": "अश्वगंधा",
        "aliases": ["ashwagandha", "withania somnifera", "withania", "indian ginseng", "अश्वगंधा", "asgandh"],
        "phytochemicals": ["Withanolides", "Withaferin A", "Withanone"],
        "treatises": ["Charaka Samhita", "Bhavaprakasha Nighantu"]
    },
    "Triphala": {
        "canonical_name": "Triphala",
        "botanical_name": "Polyherbal Blend",
        "family": "Combretaceae / Phyllanthaceae",
        "sanskrit_name": "त्रिफला",
        "aliases": ["triphala", "triphala churna", "त्रिफला"],
        "ingredients": ["Haritaki", "Bibhitaki", "Amalaki"],
        "treatises": ["Charaka Samhita", "Sushruta Samhita", "Bhavaprakasha Nighantu"]
    },
    "Haritaki": {
        "canonical_name": "Haritaki",
        "botanical_name": "Terminalia chebula",
        "family": "Combretaceae",
        "sanskrit_name": "हरीतकी",
        "aliases": ["haritaki", "terminalia chebula", "हरड़", "हरीतकी", "chebulic myrobalan"],
        "phytochemicals": ["Chebulic acid", "Chebulagic acid", "Corilagin"],
        "treatises": ["Charaka Samhita", "Bhavaprakasha Nighantu"]
    },
    "Bibhitaki": {
        "canonical_name": "Bibhitaki",
        "botanical_name": "Terminalia bellirica",
        "family": "Combretaceae",
        "sanskrit_name": "विभीतक",
        "aliases": ["bibhitaki", "terminalia bellirica", "विभीतक", "बहेड़ा", "belleric myrobalan"],
        "phytochemicals": ["Gallic acid", "Ellagic acid", "Bellericanin"],
        "treatises": ["Charaka Samhita", "Bhavaprakasha Nighantu"]
    },
    "Amalaki": {
        "canonical_name": "Amalaki",
        "botanical_name": "Phyllanthus emblica",
        "family": "Phyllanthaceae",
        "sanskrit_name": "आमलकी",
        "aliases": ["amalaki", "amla", "phyllanthus emblica", "emblica officinalis", "आंवला", "आमलकी", "indian gooseberry"],
        "phytochemicals": ["Ascorbic acid", "Emblicanin A", "Emblicanin B"],
        "treatises": ["Charaka Samhita", "Sushruta Samhita"]
    },
    "Curcumin": {
        "canonical_name": "Curcumin",
        "botanical_name": "Curcuma longa",
        "family": "Zingiberaceae",
        "sanskrit_name": "हरिद्रा",
        "aliases": ["curcumin", "turmeric", "curcuma longa", "haldi", "हल्दी", "haridra", "हरिद्रा"],
        "phytochemicals": ["Curcuminoids", "Demethoxycurcumin", "Bisdemethoxycurcumin", "Turmerones"],
        "treatises": ["Charaka Samhita", "Sushruta Samhita", "Bhavaprakasha Nighantu"]
    },
    "Neem": {
        "canonical_name": "Neem",
        "botanical_name": "Azadirachta indica",
        "family": "Meliaceae",
        "sanskrit_name": "निम्ब",
        "aliases": ["neem", "azadirachta indica", "नीम", "nimba", "निम्ब", "margosa"],
        "phytochemicals": ["Azadirachtin", "Nimbin", "Nimbidin"],
        "treatises": ["Charaka Samhita", "Sushruta Samhita"]
    },
    "Tulsi": {
        "canonical_name": "Tulsi",
        "botanical_name": "Ocimum sanctum",
        "family": "Lamiaceae",
        "sanskrit_name": "तुलसी",
        "aliases": ["tulsi", "ocimum sanctum", "ocimum tenuiflorum", "holy basil", "तुलसी"],
        "phytochemicals": ["Eugenol", "Ursolic acid", "Rosmarinic acid"],
        "treatises": ["Charaka Samhita", "Bhavaprakasha Nighantu"]
    },
    "Brahmi": {
        "canonical_name": "Brahmi",
        "botanical_name": "Bacopa monnieri",
        "family": "Plantaginaceae",
        "sanskrit_name": "ब्राह्मी",
        "aliases": ["brahmi", "bacopa monnieri", "bacopa", "ब्राह्मी", "water hyssop"],
        "phytochemicals": ["Bacoside A", "Bacoside B"],
        "treatises": ["Charaka Samhita", "Ashtanga Hridaya"]
    },
    "Guduchi": {
        "canonical_name": "Guduchi",
        "botanical_name": "Tinospora cordifolia",
        "family": "Menispermaceae",
        "sanskrit_name": "गुडूची",
        "aliases": ["guduchi", "tinospora cordifolia", "tinospora", "giloy", "गिलोय", "गुडूची", "amrita"],
        "phytochemicals": ["Tinosporide", "Cordifolioside A", "Berberine"],
        "treatises": ["Charaka Samhita", "Bhavaprakasha Nighantu"]
    },
    "Guggulu": {
        "canonical_name": "Guggulu",
        "botanical_name": "Commiphora mukul",
        "family": "Burseraceae",
        "sanskrit_name": "गुग्गुलु",
        "aliases": ["guggulu", "commiphora mukul", "commiphora wightii", "guggul", "गुग्गुलु", "indian bdellium"],
        "phytochemicals": ["Guggulsterone E", "Guggulsterone Z"],
        "treatises": ["Charaka Samhita", "Sushruta Samhita", "Bhaishajya Ratnavali"]
    },
    "Piperine": {
        "canonical_name": "Piperine",
        "botanical_name": "Piper nigrum / Piper longum",
        "family": "Piperaceae",
        "sanskrit_name": "मरिच / पिप्पली",
        "aliases": ["piperine", "piper nigrum", "piper longum", "black pepper", "kali mirch", "pippali", "मरिच", "पिप्पली", "bioenhancer"],
        "phytochemicals": ["Piperine", "Chavicine", "Piperlongumine"],
        "treatises": ["Charaka Samhita", "Sushruta Samhita"]
    },
    "Shilajit": {
        "canonical_name": "Shilajit",
        "botanical_name": "Asphaltum punjabianum",
        "family": "Mineral-Herbal Exudate",
        "sanskrit_name": "शिलाजीत",
        "aliases": ["shilajit", "asphaltum punjabianum", "shilajeet", "शिलाजीत", "mineral pitch"],
        "phytochemicals": ["Fulvic acid", "Humic acid", "Dibenzo-alpha-pyrones"],
        "treatises": ["Charaka Samhita", "Sushruta Samhita"]
    },
    "Shatavari": {
        "canonical_name": "Shatavari",
        "botanical_name": "Asparagus racemosus",
        "family": "Asparagaceae",
        "sanskrit_name": "शतावरी",
        "aliases": ["shatavari", "asparagus racemosus", "शतावरी"],
        "phytochemicals": ["Shatavarin I-IV", "Sarsasapogenin"],
        "treatises": ["Charaka Samhita", "Bhavaprakasha Nighantu"]
    }
}

STATUTES_LEXICON: Dict[str, Dict[str, Any]] = {
    "The Patents Act, 1970": {
        "name": "The Patents Act, 1970",
        "jurisdiction": "India",
        "authority": "Indian Patent Office (IPO) / CGPDTM",
        "aliases": ["patents act, 1970", "patents act 1970", "the patents act", "indian patent act", "patents act"]
    },
    "Drugs and Cosmetics Act, 1940": {
        "name": "Drugs and Cosmetics Act, 1940",
        "jurisdiction": "India",
        "authority": "CDSCO / Ministry of Ayush",
        "aliases": ["drugs and cosmetics act", "drugs & cosmetics act", "dca 1940", "drugs and cosmetics act, 1940"]
    },
    "Biological Diversity Act, 2002": {
        "name": "Biological Diversity Act, 2002",
        "jurisdiction": "India",
        "authority": "National Biodiversity Authority (NBA)",
        "aliases": ["biological diversity act", "bda 2002", "bda 2023", "biodiversity act", "biological diversity act, 2002"]
    },
    "Trade Marks Act, 1999": {
        "name": "Trade Marks Act, 1999",
        "jurisdiction": "India",
        "authority": "Trade Marks Registry / CGPDTM",
        "aliases": ["trade marks act", "trademark act", "trade marks act, 1999"]
    },
    "United States Patent Act (35 U.S.C.)": {
        "name": "United States Patent Act (35 U.S.C.)",
        "jurisdiction": "USA",
        "authority": "United States Patent and Trademark Office (USPTO)",
        "aliases": ["35 u.s.c", "uspto", "united states patent act"]
    },
    "WIPO GRATK Treaty (2024)": {
        "name": "WIPO GRATK Treaty (2024)",
        "jurisdiction": "International",
        "authority": "World Intellectual Property Organization (WIPO)",
        "aliases": ["wipo gratk", "gratk treaty", "wipo treaty on genetic resources"]
    }
}

SECTIONS_LEXICON: Dict[str, Dict[str, Any]] = {
    "Section 3(p)": {
        "code": "Section 3(p)",
        "title": "Traditional Knowledge Patent Exclusion Bar",
        "statute": "The Patents Act, 1970",
        "legal_effect": "Bars patent claims on inventions that are traditional knowledge or aggregations thereof",
        "aliases": ["section 3(p)", "sec 3(p)", "section 3p", "sec 3p", "traditional knowledge bar"]
    },
    "Section 3(e)": {
        "code": "Section 3(e)",
        "title": "Mere Admixture vs Synergism Requirement",
        "statute": "The Patents Act, 1970",
        "legal_effect": "Bars mere mixtures unless verifiable synergistic therapeutic efficacy is demonstrated",
        "aliases": ["section 3(e)", "sec 3(e)", "section 3e", "sec 3e", "mere admixture", "synergism"]
    },
    "Section 2(1)(j)": {
        "code": "Section 2(1)(j)",
        "title": "Novelty and Inventive Step Criteria",
        "statute": "The Patents Act, 1970",
        "legal_effect": "Requires an inventive step and industrial applicability",
        "aliases": ["section 2(1)(j)", "sec 2(1)(j)", "inventive step", "novelty"]
    },
    "Section 3 BDA (Form III)": {
        "code": "Section 3 BDA (Form III)",
        "title": "Mandatory National Biodiversity Authority Approval for IPR",
        "statute": "Biological Diversity Act, 2002",
        "legal_effect": "Mandates prior approval (Form III) from NBA before filing patents on Indian biological resources",
        "aliases": ["section 3 bda", "section 6 bda", "form iii", "form 3 bda", "nba approval", "abs compliance"]
    },
    "Rule 158B": {
        "code": "Rule 158B",
        "title": "Ayush Manufacturing Licensing Guidelines",
        "statute": "Drugs and Cosmetics Act, 1940",
        "legal_effect": "Prescribes safety and proof of effectiveness guidelines for Classical vs Proprietary medicines",
        "aliases": ["rule 158b", "rule 158-b", "rule 158", "form 25d", "schedule t"]
    }
}

TREATISES_LEXICON: Dict[str, Dict[str, Any]] = {
    "Charaka Samhita": {
        "name": "Charaka Samhita",
        "author": "Acharya Charaka / Agnivesha",
        "tradition": "Classical Ayurveda (Brihat Trayi)",
        "aliases": ["charaka samhita", "caraka samhita", "charaka", "चरक संहिता"]
    },
    "Sushruta Samhita": {
        "name": "Sushruta Samhita",
        "author": "Acharya Sushruta",
        "tradition": "Classical Ayurveda (Surgical & Systemic)",
        "aliases": ["sushruta samhita", "susruta samhita", "sushruta", "सुश्रुत संहिता"]
    },
    "Ashtanga Hridaya": {
        "name": "Ashtanga Hridaya",
        "author": "Acharya Vagbhata",
        "tradition": "Classical Ayurveda (Brihat Trayi)",
        "aliases": ["ashtanga hridaya", "astanga hrdaya", "vagbhata", "अष्टांग हृदय"]
    },
    "Bhavaprakasha Nighantu": {
        "name": "Bhavaprakasha Nighantu",
        "author": "Bhavamishra",
        "tradition": "Ayurvedic Materia Medica (Nighantu)",
        "aliases": ["bhavaprakasha nighantu", "bhavaprakasha", "भावप्रकाश निघंटु"]
    },
    "Bhaishajya Ratnavali": {
        "name": "Bhaishajya Ratnavali",
        "author": "Govinda Dasa",
        "tradition": "Classical Formulations & Therapeutics",
        "aliases": ["bhaishajya ratnavali", "bhaisajya ratnavali", "भैषज्य रत्नावली"]
    },
    "Ayurvedic Formulary of India (AFI)": {
        "name": "Ayurvedic Formulary of India (AFI)",
        "author": "Pharmacopoeia Commission for Indian Medicine & Homoeopathy (PCIM&H)",
        "tradition": "Statutory First Schedule Pharmacopoeia",
        "aliases": ["ayurvedic formulary of india", "afi", "pharmacopoeia"]
    },
    "TKDL Database": {
        "name": "TKDL Database",
        "author": "CSIR & Ministry of Ayush",
        "tradition": "Traditional Knowledge Digital Library Prior Art Standard",
        "aliases": ["traditional knowledge digital library", "tkdl", "tkdl prior art"]
    }
}

FORMULATIONS_LEXICON: Dict[str, Dict[str, Any]] = {
    "Triphala Churna": {
        "name": "Triphala Churna",
        "treatise": "Charaka Samhita",
        "herbs": ["Haritaki", "Bibhitaki", "Amalaki"],
        "tkdl_code": "TKDL-AY-TRIPHALA-402",
        "aliases": ["triphala churna", "triphala formulation", "triphala powder", "triphala blend"]
    },
    "Chyawanprash Avaleha": {
        "name": "Chyawanprash Avaleha",
        "treatise": "Charaka Samhita",
        "herbs": ["Amalaki", "Piperine"],
        "tkdl_code": "TKDL-AY-CHYAWANPRASH-101",
        "aliases": ["chyawanprash", "chyavanaprasha", "chyawanprash avaleha"]
    },
    "Yogaraj Guggulu": {
        "name": "Yogaraj Guggulu",
        "treatise": "Bhaishajya Ratnavali",
        "herbs": ["Guggulu", "Triphala", "Piperine"],
        "tkdl_code": "TKDL-AY-YOGARAJ-GUGGULU-204",
        "aliases": ["yogaraj guggulu", "yogaraja guggulu"]
    }
}


class GraphExtractorService:
    """
    Extracts semantic entities (Herbs, Statutes, Sections, Treatises, Patents, Formulations)
    and relational graph triples from document content and chunks.
    Operates in zero-latency pattern-matching mode with optional Gemini LLM deep enrichment.
    """

    @staticmethod
    def _matches_alias(alias: str, text: str) -> bool:
        pattern = r'(?<!\w)' + re.escape(alias) + r'(?!\w)'
        return bool(re.search(pattern, text))

    @classmethod
    def extract_entities(cls, text: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Scans text for canonical Ayush and legal entities using robust regex and alias maps.
        Returns grouped dictionary of matched entities with their canonical metadata.
        """
        if not text:
            return {
                "herbs": [],
                "statutes": [],
                "sections": [],
                "treatises": [],
                "formulations": [],
                "patents": []
            }

        lower = text.lower()

        # 1. Botanical Herbs
        matched_herbs: List[Dict[str, Any]] = []
        for herb_name, data in BOTANICAL_HERBS.items():
            for alias in data["aliases"]:
                if cls._matches_alias(alias, lower):
                    matched_herbs.append(data)
                    break

        # 2. Statutes
        matched_statutes: List[Dict[str, Any]] = []
        for statute_name, data in STATUTES_LEXICON.items():
            for alias in data["aliases"]:
                if cls._matches_alias(alias, lower):
                    matched_statutes.append(data)
                    break

        # 3. Sections & Rules
        matched_sections: List[Dict[str, Any]] = []
        for sec_name, data in SECTIONS_LEXICON.items():
            for alias in data["aliases"]:
                if cls._matches_alias(alias, lower):
                    matched_sections.append(data)
                    break

        # 4. Classical Treatises
        matched_treatises: List[Dict[str, Any]] = []
        for treatise_name, data in TREATISES_LEXICON.items():
            for alias in data["aliases"]:
                if cls._matches_alias(alias, lower):
                    matched_treatises.append(data)
                    break

        # 5. Formulations
        matched_formulations: List[Dict[str, Any]] = []
        for form_name, data in FORMULATIONS_LEXICON.items():
            for alias in data["aliases"]:
                if cls._matches_alias(alias, lower):
                    matched_formulations.append(data)
                    break

        # 6. Patent Numbers (e.g. US 11992510, US Patent 11992510, WO 2024/..., IN 2023...)
        matched_patents: List[Dict[str, Any]] = []
        patent_matches = re.finditer(r'\b(US|WO|EP|IN)(?:\s+patent(?:\s+(?:no\.?|grant))?)?\s*0*([1-9]\d{5,10})\b', text, re.IGNORECASE)
        seen_patents: Set[str] = set()
        for m in patent_matches:
            pat_num = f"{m.group(1).upper()} {m.group(2)}"
            if pat_num not in seen_patents:
                seen_patents.add(pat_num)
                matched_patents.append({
                    "number": pat_num,
                    "country": m.group(1).upper()
                })

        return {
            "herbs": matched_herbs,
            "statutes": matched_statutes,
            "sections": matched_sections,
            "treatises": matched_treatises,
            "formulations": matched_formulations,
            "patents": matched_patents
        }

    @classmethod
    def extract_relations(
        cls,
        doc_id: str,
        chunk_id: str,
        text: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Derives semantic relationships (edges) based on extracted entities within the chunk/document.
        Returns a list of edge specifications:
        {"source_label": str, "source_id": str, "rel_type": str, "target_label": str, "target_id": str, "props": dict}
        """
        entities = cls.extract_entities(text)
        relations: List[Dict[str, Any]] = []

        # 1. Chunk -> MENTIONS -> Entity edges
        for herb in entities["herbs"]:
            relations.append({
                "source_label": "Chunk",
                "source_id": chunk_id,
                "rel_type": "MENTIONS_HERB",
                "target_label": "Herb",
                "target_id": herb["canonical_name"],
                "props": {"botanical_name": herb["botanical_name"]}
            })
            
            # Botanical Herb -> DOCUMENTED_IN -> Treatise
            for tr_name in herb.get("treatises", []):
                relations.append({
                    "source_label": "Herb",
                    "source_id": herb["canonical_name"],
                    "rel_type": "DOCUMENTED_IN",
                    "target_label": "Treatise",
                    "target_id": tr_name,
                    "props": {"source": "Classical Ayurveda Lexicon"}
                })

            # Botanical Herb -> TRIGGERS_COMPLIANCE -> Section 3 BDA (Form III)
            relations.append({
                "source_label": "Herb",
                "source_id": herb["canonical_name"],
                "rel_type": "TRIGGERS_COMPLIANCE",
                "target_label": "Section",
                "target_id": "Section 3 BDA (Form III)",
                "props": {"requirement": "Mandatory NBA Form III approval for commercialization / patenting of Indian bio-resources"}
            })

        for statute in entities["statutes"]:
            relations.append({
                "source_label": "Chunk",
                "source_id": chunk_id,
                "rel_type": "MENTIONS_STATUTE",
                "target_label": "Statute",
                "target_id": statute["name"],
                "props": {"authority": statute["authority"], "jurisdiction": statute["jurisdiction"]}
            })

        for sec in entities["sections"]:
            relations.append({
                "source_label": "Chunk",
                "source_id": chunk_id,
                "rel_type": "MENTIONS_SECTION",
                "target_label": "Section",
                "target_id": sec["code"],
                "props": {"legal_effect": sec["legal_effect"]}
            })
            # Section -> PART_OF -> Statute
            relations.append({
                "source_label": "Section",
                "source_id": sec["code"],
                "rel_type": "PART_OF",
                "target_label": "Statute",
                "target_id": sec["statute"],
                "props": {}
            })

        for treatise in entities["treatises"]:
            relations.append({
                "source_label": "Chunk",
                "source_id": chunk_id,
                "rel_type": "MENTIONS_TREATISE",
                "target_label": "Treatise",
                "target_id": treatise["name"],
                "props": {"tradition": treatise["tradition"]}
            })

        for form in entities["formulations"]:
            # Formulation -> DOCUMENTED_IN -> Treatise
            relations.append({
                "source_label": "Formulation",
                "source_id": form["name"],
                "rel_type": "DOCUMENTED_IN",
                "target_label": "Treatise",
                "target_id": form["treatise"],
                "props": {"tkdl_reference": form.get("tkdl_code", "")}
            })
            # Formulation -> CONTAINS_HERB -> Herb
            for h in form.get("herbs", []):
                relations.append({
                    "source_label": "Formulation",
                    "source_id": form["name"],
                    "rel_type": "CONTAINS_HERB",
                    "target_label": "Herb",
                    "target_id": h,
                    "props": {}
                })
            # Formulation -> BARRED_BY -> Section 3(p)
            relations.append({
                "source_label": "Formulation",
                "source_id": form["name"],
                "rel_type": "BARRED_BY",
                "target_label": "Section",
                "target_id": "Section 3(p)",
                "props": {"reason": "Documented Traditional Knowledge recipe barred from direct patent grant"}
            })

        for patent in entities["patents"]:
            relations.append({
                "source_label": "Chunk",
                "source_id": chunk_id,
                "rel_type": "MENTIONS_PATENT",
                "target_label": "Patent",
                "target_id": patent["number"],
                "props": {"country": patent["country"]}
            })
            # If patent mentions formulation, create CLAIMS edge
            for form in entities["formulations"]:
                relations.append({
                    "source_label": "Patent",
                    "source_id": patent["number"],
                    "rel_type": "CLAIMS_OR_CITES",
                    "target_label": "Formulation",
                    "target_id": form["name"],
                    "props": {"context": "Patent specification / prior art disclosure"}
                })

        return relations
