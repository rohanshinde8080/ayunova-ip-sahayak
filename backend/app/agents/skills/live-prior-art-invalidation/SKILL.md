---
name: live-prior-art-invalidation
description: Methodology combining classical TKDL shloka citations, Neo4j multi-hop traversal, and Tavily live global patent search to defeat broad foreign biopiracy claims.
---

# Live Prior Art Invalidation & Biopiracy Defense Playbook

## 1. Objective & Scope
This playbook provides a systematic protocol for identifying, analyzing, and invalidating broad foreign patent claims (USPTO, EPO, WIPO) or conflicting domestic applications that attempt to monopolize traditional Indian Ayurvedic remedies (e.g. *US Patent 11992510* on Triphala with *Bacillus coagulans*, or historical biopiracy attempts on turmeric and neem).

---

## 2. Invalidation Protocol: 4-Tier Evidence Assembly

### Tier 1: Claim Scope Deconstruction
1. Identify independent vs. dependent claims of the target patent.
2. Separate:
   - Traditional active botanical components (e.g. *Emblica officinalis*, *Terminalia chebula*, *Terminalia bellerica*).
   - Non-botanical additives (e.g. probiotic spores, surfactants, binders).
   - Claimed therapeutic indication (e.g. gut microbiome modulation, inflammation, metabolic health).
3. Determine whether the claimed therapeutic effect is known in classical Ayurvedic literature.

### Tier 2: Multi-Hop Knowledge Graph Traversal (Neo4j)
Execute targeted Cypher queries to link botanicals to classical treatises:
```cypher
MATCH (h:Herb)-[:CONTAINS_HERB]-(f:Formulation)-[:CITED_IN]->(t:Treatise)
WHERE h.name IN ['Amalaki', 'Haritaki', 'Bibhitaki', 'Triphala']
RETURN f.name, t.name, t.canonical_author, f.classical_indications;
```
Extract shlokas from *Charaka Samhita* (Sutra Sthana / Chikitsa Sthana) and *Sushruta Samhita* establishing pre-existing knowledge of the exact therapeutic indication centuries prior to the target patent's priority date.

### Tier 3: Live Prior Art Verification (Tavily Search)
Search global patent and academic databases in real time:
- Query terms: `"[botanical Latin name]" AND "[indication]" AND "prior art" OR "patent"`.
- Verify filing status, priority date, and cited patent family members on USPTO, Google Patents, and Espacenet.
- Search Indian CTRI clinical trials to uncover prior public use or clinical trial disclosures prior to the foreign application's priority date.

### Tier 4: Structuring the Opposition Brief (Section 25(1) / 35 U.S.C. 102)
Draft the opposition grounds with statutory backing:
1. **Lack of Novelty / Anticipation**: Prior publication in classical texts and TKDL entries.
2. **Obviousness / Lack of Inventive Step**: The claimed addition of standard additives (e.g. standard probiotics) represents an obvious combination for a person skilled in the art without surprising synergism.
3. **Non-Patentable Subject Matter**: Under Section 3(p) (traditional knowledge) and Section 3(e) (mere admixture without synergy data).
4. **Non-Disclosure of Biological Source**: Violation of mandatory biological origin declaration.

---

## 3. Opposition Filing Deliverables Checklist
- [ ] Claim chart comparing target patent claims side-by-side with TKDL / classical shlokas.
- [ ] Sanskrit shloka transliteration, translation, and authoritative treatise citation.
- [ ] Excerpt from Ayurvedic Pharmacopoeia of India (API) monographs.
- [ ] Published scientific literature with pre-dating priority timestamps.
- [ ] Formal Pre-Grant Opposition petition prepared under Form 7A.
