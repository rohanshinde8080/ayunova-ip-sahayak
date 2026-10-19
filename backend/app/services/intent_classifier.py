"""
IP-SAKTI Intent Classification Engine.
Classifies user queries into the 17 canonical intents defined in the
IP-SAKTI Deep Agent — User-First Response & Grounded Research Prompt.

Also resolves:
- Complexity Level: SIMPLE (10-20 lines), MODERATE (30-60 lines), COMPLEX (comprehensive dossier)
- Response Archetype: PATENTABILITY_ASSESSMENT, PATENT_SEARCH_TABLE, COMPARISON_TABLE, CONCEPT_EXPLANATION, STANDARD_USER_FIRST
- Execution Routing: Minimal research vs DeepAgent multi-agent workflow
- Dynamic Tool Recommendations (Indian Patent Public Search, WIPO PATENTSCOPE, Google Patents, TKDL)
- Capped Follow-Up Suggestions (Strictly at most 2 options)
"""

import re
import logging
from typing import Dict, Any, List, Optional
from app.models.schemas import QueryIntent, QueryComplexity, ResponseArchetype

logger = logging.getLogger("ayunova.intent_classifier")


CANONICAL_INTENTS: List[QueryIntent] = [
    'Patent Search',
    'Patent Details',
    'Prior Art Search',
    'Patent Comparison',
    'Patentability Assessment',
    'Novelty Assessment',
    'Inventive Step Assessment',
    'Traditional Knowledge / TKDL',
    'Section 3(p) Assessment',
    'Section 3(e) Assessment',
    'Regulatory Guidance',
    'Ayurveda / Formulation Guidance',
    'Botanical Classification / Taxonomy',
    'International IP Comparison',
    'Patent Drafting Guidance',
    'Research / Literature Search',
    'General Explanation',
    'Follow-up question on previous answer',
    'DOCUMENT_DISCLOSURE'
]


class IntentClassifier:
    """
    High-precision intent classifier and archetype resolver for IP-SAKTI Sahayak.
    Adheres strictly to the 17-intent ontology and minimal necessary research principle.
    """

    @classmethod
    def classify_intent(
        cls,
        query: str,
        history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Classifies query into one of the canonical intents and extracts structural metadata.
        """
        cleaned_q = query.strip()
        lower_q = cleaned_q.lower()
        words = re.findall(r'\b\w+\b', lower_q)

        # 0. Document Disclosure / Admin-Uploaded Document Detection (Highest Priority)
        doc_disclosure_patterns = [
            'this document', 'this pdf', 'uploaded document', 'uploaded pdf',
            'this paper', 'the paper', 'according to the document', 'does the document disclose',
            'does the pdf disclose', 'mentioned in this document', 'stated in this document',
            'reported in this paper', 'described in the document', 'evidence in this paper',
            'findings of this document', 'according to this paper', 'mentioned in this paper',
            'in this document', 'disclosed in this document', 'disclosed in the uploaded',
            'does this document', 'does the document', 'what does this document',
            'what are the findings of this', 'summarize this uploaded document', 'summarize this document',
            'what evidence does this paper', 'is withania somnifera mentioned in this document'
        ]
        is_doc_disclosure = any(p in lower_q for p in doc_disclosure_patterns) or (
            any(k in lower_q for k in ['document', 'pdf', 'paper']) and
            any(w in lower_q for w in ['disclose', 'discloses', 'disclosed', 'disclosure', 'mention', 'mentions', 'mentioned', 'report', 'reports', 'reported', 'discuss', 'discusses', 'evidence', 'findings', 'say about', 'compounds mentioned'])
        )
        if is_doc_disclosure:
            return cls._build_intent_result(
                intent='DOCUMENT_DISCLOSURE',
                complexity='MODERATE',
                archetype='STANDARD_USER_FIRST',
                needs_deep_agent=False,
                query=query
            )

        # 1. Follow-up detection (when history is provided and query is contextual)
        if history and len(history) > 0:
            follow_up_triggers = [
                'why', 'what about', 'how about', 'tell me more', 'elaborate',
                'explain reason', 'can you clarify', 'step 1', 'step 2', 'and then',
                'what next', 'second point', 'first point', 'does this mean', 'more details'
            ]
            if len(words) <= 7 and any(lower_q.startswith(tr) or tr in lower_q for tr in follow_up_triggers):
                return cls._build_intent_result(
                    intent='Follow-up question on previous answer',
                    complexity='SIMPLE',
                    archetype='STANDARD_USER_FIRST',
                    needs_deep_agent=False,
                    query=query
                )

        # 2. Patent Comparison
        if (
            any(k in lower_q for k in ['compare', 'comparison', 'versus', ' vs ', ' vs.', 'difference between', 'distinguish'])
            and any(k in lower_q for k in ['patent', 'claim', 'uspto', 'wipo', 'prior art', 'formulation', 'extract', '11992510'])
        ):
            return cls._build_intent_result(
                intent='Patent Comparison',
                complexity='COMPLEX',
                archetype='COMPARISON_TABLE',
                needs_deep_agent=True,
                query=query
            )

        # 3. Patent Details (Specific Publication/Patent lookup)
        patent_id_match = re.search(r'\b(us\s*\d{6,8}|wo\s*\d{4}[/-]?\d{4,7}|ep\s*\d{6,8}|in\s*\d{6,12}|cn\s*\d{8,12})\b', lower_q)
        if (
            patent_id_match or
            ('claim' in lower_q and any(k in lower_q for k in ['us patent', 'wo patent', 'indian patent', 'patent number', 'details of']))
        ):
            return cls._build_intent_result(
                intent='Patent Details',
                complexity='COMPLEX',
                archetype='STANDARD_USER_FIRST',
                needs_deep_agent=True,
                query=query
            )

        # 4. Patent Search (Finding patents on a topic/herb)
        if (
            any(lower_q.startswith(k) for k in ['find patent', 'search patent', 'list patent', 'get patent', 'show patent', 'patents on', 'patents for'])
            or any(k in lower_q for k in ['find patents', 'search patents', 'list patents', 'patents covering', 'existing patents on'])
        ):
            return cls._build_intent_result(
                intent='Patent Search',
                complexity='COMPLEX',
                archetype='PATENT_SEARCH_TABLE',
                needs_deep_agent=True,
                query=query
            )

        # 5. Prior Art Search
        if any(k in lower_q for k in ['prior art', 'prior-art', 'state of the art', 'defensive search', 'prior disclosure']):
            is_concept = bool(re.search(r'^(what\s+is|explain|define|tell\s+me\s+about)\s+(prior\s+art)', lower_q))
            return cls._build_intent_result(
                intent='General Explanation' if is_concept else 'Prior Art Search',
                complexity='SIMPLE' if is_concept else 'COMPLEX',
                archetype='CONCEPT_EXPLANATION' if is_concept else 'PATENT_SEARCH_TABLE',
                needs_deep_agent=not is_concept,
                query=query
            )

        # 6. Section 3(p) Assessment
        if any(k in lower_q for k in ['section 3(p)', 'section 3p', 'sec 3(p)', 'sec 3p', '3(p) bar', '3p bar']):
            is_simple_what_is = bool(re.search(r'^(what\s+is|explain|define|tell\s+me\s+about)\s+(section\s+3\(?p\)?|sec\s+3\(?p\)?)', lower_q))
            complexity = 'SIMPLE' if is_simple_what_is else 'COMPLEX'
            archetype = 'CONCEPT_EXPLANATION' if is_simple_what_is else 'PATENTABILITY_ASSESSMENT'
            return cls._build_intent_result(
                intent='Section 3(p) Assessment',
                complexity=complexity,
                archetype=archetype,
                needs_deep_agent=not is_simple_what_is,
                query=query
            )

        # 7. Section 3(e) Assessment
        if any(k in lower_q for k in ['section 3(e)', 'section 3e', 'sec 3(e)', 'sec 3e', 'synergy standard', 'mere admixture', 'chou-talalay', 'combination index']):
            is_simple_what_is = bool(re.search(r'^(what\s+is|explain|define|tell\s+me\s+about)\s+(section\s+3\(?e\)?|sec\s+3\(?e\)?)', lower_q))
            complexity = 'SIMPLE' if is_simple_what_is else 'COMPLEX'
            archetype = 'CONCEPT_EXPLANATION' if is_simple_what_is else 'PATENTABILITY_ASSESSMENT'
            return cls._build_intent_result(
                intent='Section 3(e) Assessment',
                complexity=complexity,
                archetype=archetype,
                needs_deep_agent=not is_simple_what_is,
                query=query
            )

        # 8. Traditional Knowledge / TKDL
        if any(k in lower_q for k in ['tkdl', 'traditional knowledge', 'charaka', 'sushruta', 'classical treatise', 'ancient recipe', 'samhita']):
            is_def = bool(re.search(r'^(what\s+is|explain|define)\s+(tkdl|traditional\s+knowledge)', lower_q))
            return cls._build_intent_result(
                intent='Traditional Knowledge / TKDL',
                complexity='SIMPLE' if is_def else 'COMPLEX',
                archetype='CONCEPT_EXPLANATION' if is_def else 'STANDARD_USER_FIRST',
                needs_deep_agent=not is_def,
                query=query
            )

        # 9. Novelty Assessment
        if any(k in lower_q for k in ['novelty', 'is it novel', 'novel extraction', 'novel process', 'novelty assessment']):
            return cls._build_intent_result(
                intent='Novelty Assessment',
                complexity='COMPLEX',
                archetype='PATENTABILITY_ASSESSMENT',
                needs_deep_agent=True,
                query=query
            )

        # 10. Inventive Step Assessment
        if any(k in lower_q for k in ['inventive step', 'non-obvious', 'obviousness', 'inventive feature']):
            return cls._build_intent_result(
                intent='Inventive Step Assessment',
                complexity='COMPLEX',
                archetype='PATENTABILITY_ASSESSMENT',
                needs_deep_agent=True,
                query=query
            )

        # 11. Patentability Assessment (e.g., "Can I patent my Ashwagandha formulation?")
        if (
            any(k in lower_q for k in ['can i patent', 'is it patentable', 'patentability', 'eligible for patent', 'how to patent', 'can we patent', 'patent my'])
            or ('patent' in lower_q and any(k in lower_q for k in ['formulation', 'extract', 'composition', 'synergy', 'herbal', 'oil', 'syrup', 'ashwagandha', 'triphala', 'curcumin']))
        ):
            return cls._build_intent_result(
                intent='Patentability Assessment',
                complexity='COMPLEX',
                archetype='PATENTABILITY_ASSESSMENT',
                needs_deep_agent=True,
                query=query
            )

        # 12. International IP Comparison
        if (
            any(k in lower_q for k in ['pct', 'wipo', 'uspto', 'madrid protocol', 'gratk', 'abroad', 'foreign patent', 'international patent', 'export patent'])
            and any(k in lower_q for k in ['compare', 'difference', 'filing', 'india vs', 'us vs', 'requirement', 'law'])
        ):
            return cls._build_intent_result(
                intent='International IP Comparison',
                complexity='COMPLEX',
                archetype='COMPARISON_TABLE',
                needs_deep_agent=True,
                query=query
            )

        # 13. Regulatory Guidance (DCA, Rule 158B, Form 25D, BDA Form III, Schedule T, Export/Compliance)
        if any(k in lower_q for k in ['rule 158b', '158b', 'form 25d', '25d', 'schedule t', 'manufacturing license', 'ayush license', 'nba approval', 'form iii', 'biodiversity act', 'bda', 'abs fee', 'benefit sharing', 'regulatory', 'regulations', 'guideline', 'guidelines']):
            is_simple_what_is = bool(re.search(r'^(what\s+is|define)\s+', lower_q))
            complexity = 'SIMPLE' if is_simple_what_is else 'COMPLEX'
            return cls._build_intent_result(
                intent='Regulatory Guidance',
                complexity=complexity,
                archetype='STANDARD_USER_FIRST',
                needs_deep_agent=True if complexity == 'COMPLEX' else False,
                query=query
            )

        # 14. Patent Drafting Guidance
        if (
            any(k in lower_q for k in ['draft', 'drafting', 'claim drafting', 'specification', 'how to claim', 'claims format'])
            or bool(re.search(r'\bform\s*[12]\b', lower_q))
        ):
            return cls._build_intent_result(
                intent='Patent Drafting Guidance',
                complexity='COMPLEX',
                archetype='STANDARD_USER_FIRST',
                needs_deep_agent=True,
                query=query
            )

        # 15. Research / Literature Search (Clinical trials, PubMed, efficacy studies)
        if any(k in lower_q for k in ['clinical trial', 'clinical trials', 'pubmed', 'literature search', 'efficacy study', 'in-vivo', 'in-vitro', 'journal article', 'studies on']):
            return cls._build_intent_result(
                intent='Research / Literature Search',
                complexity='COMPLEX',
                archetype='STANDARD_USER_FIRST',
                needs_deep_agent=True,
                query=query
            )

        # 16. Botanical Classification / Taxonomy
        # Triggers: "botanical classification", "taxonomic classification", "taxonomy", "scientific classification",
        # "family of", "genus of", "species of", "order of", "kingdom of", "botanical name of", "plant classification", "botanical identity"
        is_taxonomy_query = (
            any(k in lower_q for k in [
                'botanical classification', 'taxonomic classification', 'taxonomic hierarchy',
                'scientific classification', 'plant classification', 'taxonomy of', 'botanical identity',
                'taxonomic rank', 'family of', 'genus of', 'species of', 'order of', 'kingdom of',
                'botanical name of', 'scientific name of', 'plant taxonomy', 'botanical family'
            ])
            or ('taxonomy' in lower_q and not any(k in lower_q for k in ['patent', 'infringement', 'claim']))
            or (('classification of' in lower_q or 'classify' in lower_q) and any(h in lower_q for h in ['withania', 'ashwagandha', 'curcuma', 'turmeric', 'neem', 'tulsi', 'brahmi', 'triphala', 'plant', 'herb', 'species']))
        )
        if is_taxonomy_query and not any(k in lower_q for k in ['patent', 'patentability', 'claim', 'infringement', 'license', 'licensing', 'bda', 'nba']):
            return cls._build_intent_result(
                intent='Botanical Classification / Taxonomy',
                complexity='SIMPLE',
                archetype='STANDARD_USER_FIRST',
                needs_deep_agent=False,
                query=query
            )

        # 17. Ayurveda / Formulation Guidance
        if (
            any(k in lower_q for k in ['botanical', 'active marker', 'phytochemical', 'rasayana', 'bhavaprakasha', 'shloka', 'standardization', 'ayurvedic formula'])
            or any(k in lower_q for k in ['triphala', 'ashwagandha', 'curcumin', 'neem', 'tulsi', 'brahmi', 'shatavari', 'giloy', 'guggulu'])
            and not any(k in lower_q for k in ['patent', 'trademark', 'license', 'claim'])
        ):
            is_deep_formulation = any(k in lower_q for k in ['synergy', 'combination', 'extract', 'marker', 'standardization', 'ratio', 'dosage', 'formulation', 'ayurvedic formula'])
            complexity = 'COMPLEX' if is_deep_formulation else ('SIMPLE' if len(words) <= 6 else 'MODERATE')
            return cls._build_intent_result(
                intent='Ayurveda / Formulation Guidance',
                complexity=complexity,
                archetype='STANDARD_USER_FIRST',
                needs_deep_agent=is_deep_formulation,
                query=query
            )

        # 18. General Explanation (Concept questions like "What is prior art?", "What is IP-SAKTI?", etc.)
        if lower_q.startswith(('what is', 'what are', 'explain', 'tell me about', 'who is', 'meaning of', 'define')):
            is_ip_legal = any(k in lower_q for k in ['patent', 'statute', 'section', 'tkdl', 'bda', 'nba', 'infringement', 'claim'])
            return cls._build_intent_result(
                intent='General Explanation',
                complexity='MODERATE' if is_ip_legal else 'SIMPLE',
                archetype='CONCEPT_EXPLANATION',
                needs_deep_agent=False,
                query=query
            )

        # Fallback default: If contains IP/patent/statutory terms, elevate to COMPLEX
        has_ip_terms = any(k in lower_q for k in [
            'patent', 'patents', 'trademark', 'bda', 'tkdl', 'section', 'rule', 'licensing',
            'formulation', 'extract', 'herbal', 'dca', 'nba', 'abs', 'synergy', 'prior art',
            '11992510', 'uspto', 'ipo', 'schedule t', 'form 25d', 'infringement', 'claim',
            'regulatory', 'guidelines', 'ashwagandha', 'triphala', 'curcumin'
        ])
        return cls._build_intent_result(
            intent='General Explanation',
            complexity='COMPLEX' if has_ip_terms else 'MODERATE',
            archetype='STANDARD_USER_FIRST',
            needs_deep_agent=has_ip_terms,
            query=query
        )

    @classmethod
    def _build_intent_result(
        cls,
        intent: QueryIntent,
        complexity: QueryComplexity,
        archetype: ResponseArchetype,
        needs_deep_agent: bool,
        query: str
    ) -> Dict[str, Any]:
        """Assembles standard intent classification envelope."""
        tools = cls.get_recommended_tools(intent)
        follow_ups = cls.get_follow_up_suggestions(intent, query)
        
        return {
            "intent": intent,
            "complexity": complexity,
            "archetype": archetype,
            "needs_deep_agent": needs_deep_agent,
            "recommended_tools": tools,
            "suggested_tools": tools,
            "follow_up_suggestions": follow_ups,
            "follow_ups": follow_ups,
            "research_process": "Search → Retrieve → Verify → Compare → Answer" if needs_deep_agent else "Retrieve → Verify → Answer"
        }

    @classmethod
    def get_recommended_tools(cls, intent: QueryIntent) -> List[str]:
        """
        Returns authoritative, context-specific tool and database recommendations.
        Provides official active markdown links for IP India, InPASS, WIPO, and EPO Espacenet.
        """
        if intent in ['DOCUMENT_DISCLOSURE', 'Document Disclosure']:
            return [
                "Admin-Uploaded Knowledge Base (pgvector Document Retrieval)",
                "Document Evidence & Chunk Grounding Verifier"
            ]
        elif intent in ['Patent Search', 'Patent Details', 'Prior Art Search']:
            return [
                "[Indian Patent Public Search (InPASS)](https://ipindia.gov.in/patents-before-you-apply-public-search?utm_source)",
                "[IP India - Intellectual Property India | Government of India](https://ipindia.gov.in/?utm_source)",
                "[WIPO PATENTSCOPE](https://www.wipo.int/en/web/patentscope?utm_source)",
                "[EPO Espacenet](https://www.epo.org/en/searching-for-patents/technical/espacenet?utm_source)"
            ]
        elif intent in ['Patentability Assessment', 'Section 3(p) Assessment', 'Traditional Knowledge / TKDL']:
            return [
                "TKDL — Traditional Knowledge Digital Library (Classical prior art barrier check)",
                "[Indian Patent Public Search (InPASS)](https://ipindia.gov.in/patents-before-you-apply-public-search?utm_source)",
                "[IP India - Intellectual Property India](https://ipindia.gov.in/?utm_source)",
                "National Biodiversity Authority (NBA) Portal (Form III mandatory approval)"
            ]
        elif intent in ['Section 3(e) Assessment', 'Novelty Assessment', 'Inventive Step Assessment']:
            return [
                "[Indian Patent Public Search (InPASS)](https://ipindia.gov.in/patents-before-you-apply-public-search?utm_source)",
                "[WIPO PATENTSCOPE](https://www.wipo.int/en/web/patentscope?utm_source)",
                "PubMed / ClinicalTrials.gov (Bioavailability & synergy experimental data verification)",
                "Indian Patent Office Biological Examination Guidelines"
            ]
        elif intent in ['Regulatory Guidance']:
            return [
                "CDSCO / State Ayush Licensing Portal (Form 25D & Rule 158B licensing)",
                "National Biodiversity Authority (NBA India Form III)",
                "Pharmacopoeial Commission for Indian Medicine & Homoeopathy (PCIM&H)"
            ]
        elif intent in ['Botanical Classification / Taxonomy']:
            return [
                "[Kew Plants of the World Online (POWO)](https://powo.science.kew.org/)",
                "[Botanical Survey of India (BSI) Flora of India](https://bsi.gov.in/)",
                "Ayurvedic Pharmacopoeia of India (API Botanical Monographs)",
                "Traditional Knowledge Digital Library (TKDL Botanical Registry)"
            ]
        elif intent in ['International IP Comparison']:
            return [
                "[WIPO PATENTSCOPE](https://www.wipo.int/en/web/patentscope?utm_source)",
                "[EPO Espacenet](https://www.epo.org/en/searching-for-patents/technical/espacenet?utm_source)",
                "USPTO Public Search (35 U.S.C. 101/103 examination records)"
            ]
        else:
            return [
                "[Indian Patent Public Search (InPASS)](https://ipindia.gov.in/patents-before-you-apply-public-search?utm_source)",
                "[IP India - Intellectual Property India](https://ipindia.gov.in/?utm_source)",
                "Traditional Knowledge Digital Library (TKDL)"
            ]

    @classmethod
    def get_follow_up_suggestions(
        cls,
        intent: QueryIntent,
        query: str,
        context: Optional[str] = None
    ) -> List[str]:
        """
        Generates AT MOST 2 high-value, relevant follow-up options.
        Strictly adhering to prompt section 17:
        'At the end, provide at most 2 useful follow-up options.'
        """
        lower_q = query.lower()

        # Patentability or Herb Formulation Queries
        if intent in ['Patentability Assessment', 'Section 3(p) Assessment', 'Section 3(e) Assessment']:
            herb = "Ashwagandha" if "ashwagandha" in lower_q else ("Triphala" if "triphala" in lower_q else ("Curcumin" if "curcumin" in lower_q else "herbal"))
            return [
                f"Want me to check Section 3(p) and TKDL overlap for {herb}?",
                "Want me to show how to prove synergism (CI < 1.0) under Section 3(e)?"
            ][:2]

        # Document Disclosure Queries
        if intent in ['DOCUMENT_DISCLOSURE', 'Document Disclosure']:
            return [
                "Want me to search for additional specific claims or data in this document?",
                "Want me to cross-reference this document's disclosures against Indian Patent Office prior art?"
            ][:2]

        # Patent Search / Prior Art Queries
        if intent in ['Patent Search', 'Prior Art Search']:
            return [
                "Want me to compare the top verified patents in a comparison table?",
                "Want me to evaluate potential Section 3(p) objections for these claims?"
            ][:2]

        # Patent Comparison
        if intent in ['Patent Comparison', 'International IP Comparison']:
            return [
                "Want me to examine independent claim differences between these records?",
                "Want me to evaluate foreign patent eligibility under US 35 U.S.C. 101 vs Indian Section 3(p)?"
            ][:2]

        # Regulatory & Licensing
        if intent in ['Regulatory Guidance']:
            return [
                "Want me to check Form 25D vs Rule 158B pilot clinical trial requirements?",
                "Want me to outline the NBA Form III filing checklist before patent grant?"
            ][:2]

        # Botanical Classification / Taxonomy
        if intent in ['Botanical Classification / Taxonomy']:
            return [
                "Want me to show the classical Sanskrit morphology and Ayurvedic properties?",
                "Want me to check therapeutic indications in Charaka or Sushruta Samhita?"
            ][:2]

        # Concept Explanation / General
        if intent in ['General Explanation', 'Traditional Knowledge / TKDL']:
            return [
                "Want me to show a real-world CSIR patent revocation case study?",
                "Want me to check if your concept has direct classical text citations?"
            ][:2]

        # Default fallback: at most 2
        return [
            "Want me to search for recent prior art patents on this concept?",
            "Want me to check the statutory requirements under the Indian Patents Act?"
        ][:2]
