import {
  SourceCitation,
  StructuredAIAnswer,
  ProductClassificationResult,
  IPAdvisorResult,
  ComparisonData,
  ComplianceItem,
  DocumentAnalysisResult,
  KnowledgeDocument,
  FacilitatorRequest,
  Jurisdiction
} from '../types';

export const DEMO_SOURCES: Record<string, SourceCitation> = {
  'sec-3p-patents': {
    id: 'sec-3p-patents',
    title: 'Section 3(p) — Inventions Relating to Traditional Knowledge',
    authority: 'Indian Patent Office (CGPDTM) / Ministry of Commerce & Industry',
    section: 'Section 3(p), Patents Act 1970 (as amended)',
    page: 'Act No. 39 of 1970',
    jurisdiction: 'India',
    verified: true,
    url: 'Demo source — connect official source URL (ipindia.gov.in)',
    summary: 'An invention which in effect is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is not patentable.',
    gazetteExcerpt: 'Section 3(p): The following are not inventions within the meaning of this Act: "(p) an invention which, in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components."',
    officialAct: 'The Patents Act, 1970 (India)'
  },
  'sec-3e-patents': {
    id: 'sec-3e-patents',
    title: 'Section 3(e) — Admixture Resulting Only in Aggregation of Properties',
    authority: 'Indian Patent Office (CGPDTM)',
    section: 'Section 3(e), Patents Act 1970',
    page: 'Guidelines for Examination of Patent Applications',
    jurisdiction: 'India',
    verified: true,
    url: 'Demo source — connect official source URL (ipindia.gov.in)',
    summary: 'A substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance is not patentable unless synergistic efficacy is proven by comparative experimental data.',
    gazetteExcerpt: 'Section 3(e): A substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance is not an invention.',
    officialAct: 'The Patents Act, 1970 (India)'
  },
  'bda-sec40-2024': {
    id: 'bda-sec40-2024',
    title: 'Biological Diversity Act — Section 40 & NTAC Exemption List',
    authority: 'National Biodiversity Authority (NBA) / Ministry of Environment, Forest and Climate Change',
    section: 'Section 40 read with BDA Amendment Act 2023 / Rules 2024',
    page: 'Gazette Notification S.O. 1352(E)',
    jurisdiction: 'India',
    verified: true,
    url: 'Demo source — connect official source URL (nbaindia.org)',
    summary: 'Section 40 empowers Central Government to exempt commonly traded biological resources (Normally Traded as Commodities - NTAC) from prior approval, provided they are traded as commodities and not accessed for patented research without declaration.',
    gazetteExcerpt: 'Section 40: Central Government may, in consultation with the National Biodiversity Authority, by notification, exempt biological resources normally traded as commodities or items derived from them.',
    officialAct: 'Biological Diversity Act, 2002 & Amendment Act 2023'
  },
  'dca-first-schedule': {
    id: 'dca-first-schedule',
    title: 'Drugs and Cosmetics Act, 1940 — First Schedule & Rule 158B',
    authority: 'Ministry of Ayush / Central Drugs Standard Control Organisation (CDSCO)',
    section: 'First Schedule & Rule 158B, Drugs and Cosmetics Rules 1945',
    page: 'Chapter IV-A, Section 3(a)',
    jurisdiction: 'India',
    verified: true,
    url: 'Demo source — connect official source URL (ayush.gov.in)',
    summary: 'Defines Ayurvedic, Siddha or Unani drugs manufactured exclusively in accordance with the formulae described in the authoritative books specified in the First Schedule (e.g. Charaka Samhita, Sushruta Samhita, Ayurvedic Formulary of India).',
    gazetteExcerpt: 'Section 3(a): "Ayurvedic, Siddha or Unani drug" includes all medicines intended for internal or external use for or in the diagnosis, treatment, mitigation or prevention of disease in human beings or animals, and manufactured exclusively in accordance with the formulae described in the authoritative books of Ayurvedic, Siddha and Unani Tibb system of medicine, specified in the First Schedule.',
    officialAct: 'Drugs & Cosmetics Act, 1940'
  },
  'wipo-gratk-2024': {
    id: 'wipo-gratk-2024',
    title: 'WIPO Treaty on Intellectual Property, Genetic Resources and Associated Traditional Knowledge',
    authority: 'World Intellectual Property Organization (WIPO), Geneva',
    section: 'Article 3 — Mandatory Disclosure Requirement',
    page: 'WIPO Diplomatic Conference Treaty (May 2024)',
    jurisdiction: 'Global',
    verified: true,
    url: 'Demo source — connect official source URL (wipo.int)',
    summary: 'Requires patent applicants worldwide to disclose the country of origin of genetic resources and the indigenous people or local community providing associated traditional knowledge in their patent applications.',
    gazetteExcerpt: 'Article 3(1): Where the claimed invention in a patent application is based on genetic resources, each Contracting Party shall require applicants to disclose the country of origin of the genetic resources.',
    officialAct: 'WIPO GRATK Treaty (Adopted May 24, 2024)'
  },
  'us-fda-botanicals': {
    id: 'us-fda-botanicals',
    title: 'US FDA Guidance for Industry: Botanical Drug Development',
    authority: 'U.S. Food and Drug Administration (Center for Drug Evaluation and Research)',
    section: 'Guidance Docket FDA-2000-D-0105 (Rev. 2)',
    page: 'Sections IV–VI: CMC and Clinical Verification',
    jurisdiction: 'USA',
    verified: true,
    url: 'Demo source — connect official source URL (fda.gov)',
    summary: 'Provides specific recommendations on submitting INDs and NDAs for botanical drug products, addressing batch-to-batch consistency, raw material authentication, and clinical efficacy standards.',
    gazetteExcerpt: 'FDA Botanical Guidance: Botanical products often have complex active constituents. The applicant must establish comprehensive botanical raw material controls (GAP), multiple active/marker chromatographic assays, and clinical efficacy demonstration.',
    officialAct: 'Federal Food, Drug, and Cosmetic Act (21 U.S.C. 355)'
  }
};

export const DEMO_TRIPHALA_ANSWER: StructuredAIAnswer = {
  answer: 'Comprehensive preliminary guidance on IP protection and regulatory requirements for your Triphala-based Ayurvedic formulation.',
  assessment: 'An Ayurvedic formulation based on classical Triphala raises multiple intellectual property and regulatory considerations under Indian and international law. Because Triphala (Amalaki, Haritaki, Bibhitaki) is extensively documented in authoritative texts (Charaka Samhita, Sushruta Samhita, Ayurvedic Formulary of India) and the Traditional Knowledge Digital Library (TKDL), a straightforward formulation is subject to statutory patent exclusions under Section 3(p) of the Patents Act, 1970. However, distinct avenues for protection (novel extraction processes, synergistic delivery compositions, trademarks) and specific regulatory licensing pathways exist.',
  considerations: [
    'Section 3(p) Traditional Knowledge Exclusion: Standard compositions of Triphala or known therapeutic uses cannot be patented as they represent documented traditional knowledge.',
    'Synergistic Efficacy Requirement (Section 3(e)): If proposing a novel modified formulation or specific stoichiometric ratio, you must demonstrate non-obvious synergistic therapeutic efficacy via quantitative comparative bioassays against standard Triphala controls.',
    'Novel Process / Extraction Protection: A novel, non-obvious extraction technique (e.g. green solvent supercritical CO2 fraction, sustained-release phytosome carrier, nano-lipid vehicle) may be eligible for a process/method patent.',
    'Brand & Trade Dress Protection: Register a distinctive brand trademark (Class 5 for pharmaceuticals/herbal supplements and Class 3 for herbal cosmetics) under the Trade Marks Act, 1999.',
    'Biological Diversity Act (BDA 2002/2023) Compliance: Prior to commercialization or filing patent applications involving Indian biological resources, mandatory approval (Form III) or State Biodiversity Board intimation is statutory.'
  ],
  regulatory: [
    'Licensing Pathway under Drugs & Cosmetics Act, 1940: If prepared strictly per Ayurvedic Formulary of India (AFI), apply for a Classical Ayurvedic Drug Manufacturing License (Form 25D).',
    'Patent & Proprietary (P&P) Pathway (Rule 158B): If incorporating modern excipients or altered ratios while retaining traditional ingredients, apply for a P&P Ayurvedic License with proof of textual reference or pilot safety data.',
    'Ayurveda Aahar Route: If positioned strictly as food supplement for health promotion, evaluate Food Safety and Standards (Ayurveda Aahar) Regulations, 2022 (FSSAI/Ministry of Ayush).',
    'Good Manufacturing Practice (GMP): Mandatory compliance with Schedule T of the Drugs and Cosmetics Rules, 1945.'
  ],
  risks: 'Patentability and regulatory classification depend strictly on formulation details, comparative bioassay data, and jurisdiction. AI guidance is preliminary and must not replace professional patent attorney and regulatory consultant evaluations.',
  nextSteps: [
    'Document the exact formulation composition, batch manufacturing records (BMR), and chromatographic fingerprint (HPLC/HPTLC).',
    'Perform a rigorous prior-art screening across TKDL, Indian Patent Office database (InPASS), and WIPO Patentscope.',
    'Conduct comparative efficacy bioassays if claiming synergistic advantages under Section 3(e).',
    'Initiate Form III application with the National Biodiversity Authority (NBA) if filing patent claims on biological materials.',
    'Consult an empanelled Ayush IP Facilitator / registered Patent Agent prior to public disclosure.'
  ],
  confidence: 'HIGH',
  evidenceCount: 4,
  sources: [
    DEMO_SOURCES['sec-3p-patents'],
    DEMO_SOURCES['sec-3e-patents'],
    DEMO_SOURCES['bda-sec40-2024'],
    DEMO_SOURCES['dca-first-schedule']
  ],
  detectedLanguage: 'English (en)',
  detectedJurisdiction: 'India',
  detectedProductType: 'Ayurvedic Formulation / Polyherbal Medicine',
  subgraph: {
    nodes: [
      { id: 'herb-triphala', label: 'Herb', type: 'Herb', name: 'Triphala', color: '#10b981', properties: { constituents: 'Haritaki, Bibhitaki, Amalaki' } },
      { id: 'herb-haritaki', label: 'Herb', type: 'Herb', name: 'Haritaki', color: '#10b981', properties: { botanical: 'Terminalia chebula' } },
      { id: 'herb-amalaki', label: 'Herb', type: 'Herb', name: 'Amalaki', color: '#10b981', properties: { botanical: 'Phyllanthus emblica' } },
      { id: 'sec-3p', label: 'Section', type: 'Section', name: 'Section 3(p) TK Bar', color: '#6366f1', properties: { statute: 'The Patents Act, 1970' } },
      { id: 'sec-3e', label: 'Section', type: 'Section', name: 'Section 3(e) Synergism', color: '#6366f1', properties: { statute: 'The Patents Act, 1970' } },
      { id: 'treatise-charaka', label: 'Treatise', type: 'Treatise', name: 'Charaka Samhita', color: '#f59e0b', properties: { century: 'Classical Ayurvedic Text' } },
      { id: 'statute-patents', label: 'Statute', type: 'Statute', name: 'The Patents Act, 1970', color: '#3b82f6', properties: { jurisdiction: 'India' } },
      { id: 'patent-us-11992510', label: 'Patent', type: 'Patent', name: 'US Patent 11992510', color: '#a855f7', properties: { assignee: 'Proviva Pharma' } }
    ],
    edges: [
      { id: 'e1', source: 'herb-triphala', target: 'herb-haritaki', label: 'CONTAINS_HERB', type: 'CONTAINS_HERB' },
      { id: 'e2', source: 'herb-triphala', target: 'herb-amalaki', label: 'CONTAINS_HERB', type: 'CONTAINS_HERB' },
      { id: 'e3', source: 'herb-triphala', target: 'treatise-charaka', label: 'DOCUMENTED_IN', type: 'DOCUMENTED_IN' },
      { id: 'e4', source: 'herb-triphala', target: 'sec-3p', label: 'BARRED_BY', type: 'BARRED_BY' },
      { id: 'e5', source: 'sec-3p', target: 'statute-patents', label: 'PART_OF', type: 'PART_OF' },
      { id: 'e6', source: 'sec-3e', target: 'statute-patents', label: 'PART_OF', type: 'PART_OF' },
      { id: 'e7', source: 'patent-us-11992510', target: 'herb-triphala', label: 'CLAIMS_OR_CITES', type: 'CLAIMS_OR_CITES' }
    ]
  }
};

export const LOW_CONFIDENCE_DEMO_ANSWER: StructuredAIAnswer = {
  answer: 'Preliminary review indicates limited authoritative evidence on this proprietary compound combination in classical Ayush registries.',
  assessment: 'The proposed formulation contains an unconventional hybrid matrix of synthetic peptides combined with uncharacterized rainforest bio-actives. Authoritative statutory texts (Ayurvedic Pharmacopoeia of India, First Schedule) and public TKDL records do not contain sufficient verified precedents for automated regulatory classification.',
  considerations: [
    'High ambiguity regarding classification under Drugs & Cosmetics Act (First Schedule) vs New Drugs and Clinical Trials Rules (NDCT 2019).',
    'Potential requirement for pre-clinical toxicology and Phase I-III clinical trials under CDSCO scrutiny.',
    'Access and Benefit Sharing (ABS) jurisdiction across multiple geographical territories requires customized legal review.'
  ],
  regulatory: [
    'May not qualify as traditional Ayurvedic medicine without textual backing.',
    'Likely categorized as a Phytopharmaceutical Drug or New Chemical Entity requiring DCGI approval.'
  ],
  risks: 'High risk of regulatory rejection or Section 3(p)/3(d) patent objections without customized legal structuring.',
  nextSteps: [
    'Submit full chemical dossier to an Ayush Legal & Regulatory Facilitator.',
    'Request pre-submission regulatory consultation with CDSCO Ayush vertical.'
  ],
  confidence: 'LOW',
  evidenceCount: 1,
  sources: [
    DEMO_SOURCES['sec-3p-patents']
  ],
  detectedLanguage: 'English',
  detectedJurisdiction: 'India',
  detectedProductType: 'Unclassified Hybrid Bioactive'
};

export const DEMO_RECENT_QUERIES = [
  {
    id: 'q1',
    query: 'I have developed a Triphala-based Ayurvedic formulation. Can I protect it through IP and what regulatory requirements should I check?',
    date: 'Today, 04:15 PM',
    jurisdiction: 'India' as const,
    confidence: 'HIGH' as const,
    category: 'Formulation Patent & Regulatory'
  },
  {
    id: 'q2',
    query: 'What IP protection may be relevant for an Ayurvedic brand launching globally across US and EU markets?',
    date: 'Yesterday, 11:30 AM',
    jurisdiction: 'International' as const,
    confidence: 'HIGH' as const,
    category: 'Global Trademark & Botanical Drug'
  },
  {
    id: 'q3',
    query: 'What should I check regarding National Biodiversity Authority (NBA) approval before commercializing an Ashwagandha extract?',
    date: '2 days ago',
    jurisdiction: 'India' as const,
    confidence: 'HIGH' as const,
    category: 'Biodiversity & ABS (Section 40)'
  }
];

export const DEMO_CLASSIFICATION_SAMPLE: ProductClassificationResult = {
  category: 'Patent & Proprietary Medicine (P&P)',
  description: 'An Ayurvedic medicine containing ingredients mentioned in the authoritative books of Ayurveda, but prepared in a non-classical dosage form (modified release tablet) or novel ratio.',
  ipConsiderations: [
    'Subject to Section 3(p) exclusion unless novel non-obvious process or synergistic combination is demonstrated.',
    'Formulation process patent is viable if novel manufacturing step or carrier is established.',
    'Trademark registration in Class 5 is strongly advised before market launch.',
    'Design registration (Class 28) for unique proprietary packaging or applicator.'
  ],
  regulatoryPathway: [
    'State Licensing Authority (SLA) Ayush application under Rule 158B of Drugs and Cosmetics Rules, 1945.',
    'Form 25D application supported by safety data or published textual citations of ingredients.',
    'Proof of Heavy Metal, Pesticide residue, and Microbial load testing per Ayurvedic Pharmacopoeia of India (API).',
    'Schedule T GMP certification of manufacturing facility.'
  ],
  traditionalKnowledgeScreening: 'All active botanical ingredients (Amalaki, Haritaki, Bibhitaki) are indexed in TKDL and First Schedule texts. Product must not claim classical moniker without adhering to exact AFI text formula.',
  confidence: 'High',
  applicableSchedules: ['First Schedule, DCA 1940', 'Rule 158B, DCR 1945', 'Schedule T (GMP)'],
  recommendedForms: ['Ayush Form 24D / 25D', 'Form III (NBA if IP applied)', 'Stability Study Protocol Annexure'],
  sources: [
    DEMO_SOURCES['dca-first-schedule'],
    DEMO_SOURCES['sec-3p-patents'],
    DEMO_SOURCES['bda-sec40-2024']
  ]
};

export const DEMO_IP_ANALYSIS: IPAdvisorResult = {
  routes: [
    {
      route: 'Patent',
      relevance: 'Potentially applicable for novel extraction methods, synergistic compositions, or stabilized nano-phytosome carriers.',
      potentialConcern: 'High risk of Section 3(p) (Traditional Knowledge) and Section 3(e) (Mere admixture) objections without clear comparative experimental bioassay data.',
      recommendedNextStep: 'File a provisional patent application focused on the specific synergistic ratio or proprietary extraction method with comparative in-vitro efficacy data against standard control.',
      applicableLaw: 'The Patents Act 1970 (Sec 3(p), Sec 3(e), Sec 10)',
      sources: ['Section 3(p) Guidelines', 'Section 3(e) Synergism Standard', 'WIPO GRATK Article 3']
    },
    {
      route: 'Trademark',
      relevance: 'Crucial for brand exclusivity, consumer trust, and preventing market counterfeit in AYUSH market.',
      potentialConcern: 'Avoid descriptive Sanskrit / generic Ayurvedic terms (e.g., "Shuddha Triphala") as exclusive marks; create distinctive coined or combination marks.',
      recommendedNextStep: 'Conduct TM search on Indian IP Office Class 5 / Class 3 registry and file under 45-class classification.',
      applicableLaw: 'Trade Marks Act, 1999',
      sources: ['IP India TM Portal', 'Nice Classification Class 5']
    },
    {
      route: 'Trade Secret / Confidential Know-how',
      relevance: 'Strong protection for specific fermentation temperature curves, exact extraction ratios, or proprietary solvent recovery.',
      potentialConcern: 'Does not protect against independent discovery or reverse-engineering once product is commercially available.',
      recommendedNextStep: 'Implement strict Non-Disclosure Agreements (NDAs), laboratory access controls, and compartmentalized SOPs.',
      applicableLaw: 'Indian Contract Act, 1872 & Common Law',
      sources: ['National IPR Policy 2016']
    },
    {
      route: 'Traditional Knowledge Considerations',
      relevance: 'Mandatory declaration of Indian biological resources and textual provenance.',
      potentialConcern: 'Patent claims without NBA Form III clearance face revocation under Section 64 of Patents Act.',
      recommendedNextStep: 'Submit NBA Form III simultaneous with patent filing.',
      applicableLaw: 'Biological Diversity Act, 2002 & Amendments 2023',
      sources: ['Section 6, BD Act 2002', 'Rule 18, BD Rules']
    }
  ],
  priorArtSimilarities: [
    {
      id: 'pa1',
      document: 'TKDL/AY/2049 — Triphala Rasayana Formulation',
      source: 'Traditional Knowledge Digital Library (CSIR-Ayush)',
      similarityPercentage: 87,
      relevantTopic: 'Equimolar combination of Emblica officinalis, Terminalia chebula, Terminalia bellirica for digestive and antioxidant use.',
      similarityNotes: 'Potential similarity detected — classical usage is public knowledge. Patent claims on basic combination will face Section 3(p) rejection; focus novelty strictly on delivery vehicle.',
      publicationDate: 'Ancient classical text compilation (Charaka Samhita Cikitsasthana 1:3)'
    },
    {
      id: 'pa2',
      document: 'IN Patent App 201821045920A — Synergistic Herbal Extract Ratio',
      source: 'Indian Patent Office Journal',
      similarityPercentage: 72,
      relevantTopic: 'Standardized polyphenol enriched extract of Triphala exhibiting enhanced free radical scavenging.',
      similarityNotes: 'Potential similarity in extraction solvent system. Distinguish your method by chromatographic yield data and lower temperature threshold.',
      publicationDate: 'Published: 2020-04-17'
    },
    {
      id: 'pa3',
      document: 'US Patent US9241968B2 — Topical botanical formulation with bio-enhancers',
      source: 'USPTO Patent Database',
      similarityPercentage: 64,
      relevantTopic: 'Ayurvedic phytochemical complex encapsulated in phospholipid liposomes.',
      similarityNotes: 'Examine claim boundaries for structural differences in your formulation’s lipid carrier matrix.',
      publicationDate: 'Granted: 2016-01-26'
    }
  ],
  confidence: 'High',
  overallGuidance: 'Your innovation demonstrates strong potential for a dual-track strategy: a Process/Composition Patent for the modified delivery matrix paired with immediate Trademark protection for brand equity.'
};

export const DEMO_COMPARISONS: Record<Jurisdiction, ComparisonData> = {
  'India': {
    country: 'India',
    flag: '🇮🇳',
    ipConsiderations: [
      'Patents governed by Patents Act 1970 with strict Section 3(p) TK exclusion and Section 3(e) synergism rule.',
      'Mandatory National Biodiversity Authority (NBA) approval (Form III) for patent applications involving Indian biological resources.',
      'TKDL database actively utilized by examiners to challenge obvious herbal claims.'
    ],
    regulatoryPathway: [
      'Licensing under Drugs & Cosmetics Act 1940 / Rules 1945 (Form 24D / 25D) via State Ayush Licensing Authority.',
      'Classical products exempt from clinical trials; P&P products need safety evidence under Rule 158B.',
      'Ayurveda Aahar route regulated under FSSAI-Ayush joint regulations (2022).'
    ],
    typicalDocumentation: [
      'Master Formula Record & Batch Manufacturing Record per Schedule T GMP.',
      'Pharmacopoeial compliance dossier (Ayurvedic Pharmacopoeia of India).',
      'Stability data (accelerated & real time at 30°C/70% RH).'
    ],
    complianceCheckpoints: [
      'Schedule T GMP facility certification.',
      'Certificate of Analysis (CoA) with limits for heavy metals, aflatoxins, and pesticides.',
      'State Biodiversity Board (SBB) intimation under Section 7 of BD Act.'
    ],
    traditionalKnowledgeRequirements: [
      'Citations of authoritative texts from First Schedule of DCA 1940.',
      'Declaration in Patent Form 1 regarding biological resource origin.'
    ],
    importantNotes: 'India has the world’s most comprehensive traditional knowledge protection framework via TKDL and NBA.'
  },
  'USA': {
    country: 'USA',
    flag: '🇺🇸',
    ipConsiderations: [
      'Patents governed by 35 U.S.C. 101/102/103 under USPTO; no explicit Section 3(p) equivalent, but subject to 101 Natural Product & Alice/Mayo exclusions.',
      'Must disclose prior art known to applicant (Duty of Candor, 37 CFR 1.56).',
      'WIPO GRATK Treaty ratification will require origin disclosure once entered into force.'
    ],
    regulatoryPathway: [
      'Dietary Supplement Pathway under DSHEA 1994 (Structure/Function claims only; no disease treatment claims without NDI/GRAS).',
      'Botanical Drug Pathway under CDER FDA Guidance (IND -> Phase I/II/III -> NDA) for therapeutic claims.',
      'Cosmetics pathway under MoCRA 2022.'
    ],
    typicalDocumentation: [
      'FDA Facility Registration (Food Facility / Drug Establishment).',
      '21 CFR Part 111 cGMP compliance documentation for Dietary Supplements.',
      'New Dietary Ingredient (NDI) Notification if ingredient not marketed before Oct 15, 1994.'
    ],
    complianceCheckpoints: [
      'Mandatory Adverse Event Reporting (AER) system.',
      'FDA Compliant Supplement Facts panel without unapproved drug claims.',
      'Foreign Supplier Verification Program (FSVP) under FSMA.'
    ],
    traditionalKnowledgeRequirements: [
      'Classical Ayush texts may be submitted as prior art during patent prosecution or third-party preissuance submissions.'
    ],
    importantNotes: 'Labeling is strictly policed; claiming that an Ayurvedic supplement "cures diabetes" converts it into an unapproved new drug.'
  },
  'EU': {
    country: 'EU',
    flag: '🇪🇺',
    ipConsiderations: [
      'European Patent Convention (EPC) Article 52/53; Plant varieties non-patentable, but isolated botanical fractions may be patented.',
      'EU ABS Regulation (Regulation (EU) No 511/2014) implementing the Nagoya Protocol with mandatory due diligence declarations.'
    ],
    regulatoryPathway: [
      'Traditional Herbal Medicinal Products Directive (THMPD 2004/24/EC) — requires 30 years medicinal use (including 15 years within EU).',
      'Food Supplement Directive (Directive 2002/46/EC) via EFSA with mutual recognition across member states.',
      'Novel Food Regulation (EU) 2015/2283 if history of consumption in EU prior to May 1997 is lacking.'
    ],
    typicalDocumentation: [
      'Herbal Monograph dossier (HMPC / EMA monographs).',
      'EU Due Diligence ABS declaration via DECLARE database.',
      'Heavy metal limits in compliance with EU Regulation 1881/2006.'
    ],
    complianceCheckpoints: [
      'EMA HMPC monograph adherence for simplified registration.',
      'Pre-market notification in individual member states for food supplements (e.g. France DGCCRF, Germany BVL).'
    ],
    traditionalKnowledgeRequirements: [
      'Nagoya Protocol compliance strictly audited at custom checkpoints in EU member states.'
    ],
    importantNotes: 'High regulatory bar for medicinal claims; many Ayurvedic products enter EU as Food Supplements with health claim restrictions.'
  },
  'Japan': {
    country: 'Japan',
    flag: '🇯🇵',
    ipConsiderations: [
      'Japan Patent Office (JPO) guidelines on natural medicine patents; process and use patents common for Kampo and botanical preparations.',
      'Strict novelty examination against East Asian traditional pharmacopoeias.'
    ],
    regulatoryPathway: [
      'Kampo / Traditional Medicine category under PMDA (Pharmaceuticals and Medical Devices Agency).',
      'Foods for Specified Health Uses (FOSHU) or Foods with Function Claims (FFC) via Consumer Affairs Agency.'
    ],
    typicalDocumentation: [
      'Japanese Pharmacopoeia (JP) analytical methods alignment.',
      'PMDA Foreign Manufacturer Accreditation (FMA).',
      'Clinical trial data in Japanese population if applying as ethical pharmaceutical.'
    ],
    complianceCheckpoints: [
      'Strict pesticide residue positive list system (PLS).',
      'Japanese language labeling with rigorous ingredient breakdown.'
    ],
    traditionalKnowledgeRequirements: [
      'Nagoya Protocol domestic measures under Ministry of Environment Japan.'
    ],
    importantNotes: 'Japan possesses sophisticated regulatory pathways for Kampo formulations with established reimbursement under national health insurance.'
  },
  'International': {
    country: 'International',
    flag: '🌐',
    ipConsiderations: [
      'PCT (Patent Cooperation Treaty) international filing via WIPO allows 30/31-month timeline across 157 countries.',
      'WIPO GRATK Treaty (2024) mandates disclosure of origin for genetic resources in patent filings.',
      'Nagoya Protocol on Access and Benefit Sharing (ABS) requires compliance in over 130 signatory nations.'
    ],
    regulatoryPathway: [
      'WHO Guidelines on Good Agricultural and Collection Practices (GACP) for medicinal plants.',
      'Country-specific regulatory pathways (FDA, EMA, TGA, Health Canada, PMDA).'
    ],
    typicalDocumentation: [
      'Common Technical Document (CTD) Quality Module 3 for botanical products.',
      'GACP and GMP certifications.',
      'Standardized certificate of origin and phytosanitary certificate.'
    ],
    complianceCheckpoints: [
      'CITES (Convention on International Trade in Endangered Species) checks for endangered herbal flora (e.g., Aquilaria, Nardostachys).',
      'Pesticide residue testing against international limits (USP/EP/JP limits).'
    ],
    traditionalKnowledgeRequirements: [
      'WIPO GRATK Treaty mandatory disclosure of origin.'
    ],
    importantNotes: 'Global harmonization is accelerating through WHO benchmarks and the 2024 WIPO GRATK framework.'
  }
};

export const DEMO_COMPLIANCE_ITEMS: ComplianceItem[] = [
  {
    id: 'c1',
    category: 'Documentation',
    title: 'Master Formulation Dossier Documented',
    description: 'Complete list of active botanical ingredients with Latin binomials, parts used (leaves, roots, bark), and exact percentages.',
    completed: true,
    requiredFor: 'Both',
    statutoryRef: 'Ayurvedic Formulary of India / Schedule T'
  },
  {
    id: 'c2',
    category: 'Documentation',
    title: 'Batch Manufacturing Record (BMR) Standardized',
    description: 'Standard operating procedures (SOP) for extraction, drying, blending, and finished product packaging.',
    completed: true,
    requiredFor: 'Both',
    statutoryRef: 'Rule 157, Drugs & Cosmetics Rules'
  },
  {
    id: 'c3',
    category: 'IP & Prior Art',
    title: 'TKDL & Prior-Art Screening Completed',
    description: 'Comprehensive search across Traditional Knowledge Digital Library and patent databases (InPASS, Patentscope, Google Patents).',
    completed: true,
    requiredFor: 'India',
    statutoryRef: 'Section 3(p), Patents Act 1970'
  },
  {
    id: 'c4',
    category: 'IP & Prior Art',
    title: 'Synergistic Efficacy Bioassay Data Prepared',
    description: 'Quantitative comparative data demonstrating non-obvious therapeutic synergism over individual known components.',
    completed: false,
    requiredFor: 'Both',
    statutoryRef: 'Section 3(e), Patents Act 1970'
  },
  {
    id: 'c5',
    category: 'Traditional Knowledge & ABS',
    title: 'Biological Resource Sourcing Declared',
    description: 'Geographical origin of Indian biological resources identified and verified against Section 40 NTAC exemption lists.',
    completed: true,
    requiredFor: 'India',
    statutoryRef: 'Section 40, Biological Diversity Act 2002'
  },
  {
    id: 'c6',
    category: 'Traditional Knowledge & ABS',
    title: 'NBA Form III / State Biodiversity Board Intimation',
    description: 'Application for approval to National Biodiversity Authority prior to filing patent or commercial access.',
    completed: false,
    requiredFor: 'India',
    statutoryRef: 'Section 6 & 7, Biological Diversity Act 2002'
  },
  {
    id: 'c7',
    category: 'Regulatory & Licensing',
    title: 'Ayush Manufacturing License (Form 25D / 24D)',
    description: 'License obtained from State Ayush Licensing Authority with approved product list endorsed.',
    completed: false,
    requiredFor: 'India',
    statutoryRef: 'Rule 153, Drugs & Cosmetics Rules 1945'
  },
  {
    id: 'c8',
    category: 'Regulatory & Licensing',
    title: 'Schedule T GMP Certification',
    description: 'Manufacturing unit inspected and certified for Good Manufacturing Practices by Ayush inspectorate.',
    completed: false,
    requiredFor: 'India',
    statutoryRef: 'Schedule T, Drugs & Cosmetics Rules'
  },
  {
    id: 'c9',
    category: 'Labeling & Quality',
    title: 'Heavy Metals, Pesticides & Microbial Testing (CoA)',
    description: 'Laboratory Certificate of Analysis from NABL accredited lab conforming to Ayurvedic Pharmacopoeia limits.',
    completed: false,
    requiredFor: 'Both',
    statutoryRef: 'API Vol I-IX standards'
  },
  {
    id: 'c10',
    category: 'Labeling & Quality',
    title: 'Compliant Packaging & Label Disclaimers',
    description: 'Statutory warnings, batch number, expiry date, storage conditions, and manufacturing license number prominently displayed.',
    completed: false,
    requiredFor: 'Both',
    statutoryRef: 'Rule 161, Drugs & Cosmetics Rules'
  }
];

export const DEMO_DOCUMENT_ANALYSIS: DocumentAnalysisResult = {
  fileName: 'Triphala_Novel_Synergistic_Formulation_v2.pdf',
  fileSize: '2.4 MB',
  pageCount: 14,
  detectedLanguage: 'English (with Sanskrit terminology)',
  detectedTopic: 'Polyherbal Formulation for Metabolic & Digestive Health',
  keyInformation: {
    productName: 'Bio-Enhanced Triphala Phytosome Matrix',
    herbsIdentified: [
      'Emblica officinalis (Amalaki)',
      'Terminalia chebula (Haritaki)',
      'Terminalia bellirica (Bibhitaki)',
      'Piper nigrum (Maricha / Bio-enhancer)'
    ],
    intendedUse: 'Support digestive assimilation, oxidative balance, and metabolic wellness',
    extractionSolvents: 'Supercritical CO2 + Hydro-ethanolic (70:30 v/v)'
  },
  ipConsiderations: [
    'Novel delivery system: Phospholipid complexation provides distinct patentability claim over raw herb admixtures.',
    'Section 3(p) clearance: Document references specific non-classical ratio (1:1:1:0.15) with enhanced bioavailability data.',
    'Section 3(e) consideration: Comparative pharmacokinetic graph on page 8 demonstrates 3.2x plasma concentration of gallic acid, serving as robust synergism evidence.'
  ],
  regulatoryConsiderations: [
    'Classification: Patent & Proprietary (P&P) Ayurvedic Medicine under Rule 158B (Drugs & Cosmetics Rules 1945).',
    'Licensing: Requires Form 25D from State Ayush Licensing Authority along with accelerated stability data.',
    'Biological Diversity Act: Requires NBA Form III filing prior to patent examination.'
  ],
  potentialMissingInformation: [
    'Heavy metal limits (Lead, Cadmium, Arsenic, Mercury) testing report missing in appendix.',
    'Exact geographical source / district of raw herbs in India not specified for ABS traceability.',
    'Shelf-life stability data at 40°C / 75% RH for zone IVb is incomplete.'
  ],
  relevantSources: [
    DEMO_SOURCES['sec-3p-patents'],
    DEMO_SOURCES['sec-3e-patents'],
    DEMO_SOURCES['dca-first-schedule'],
    DEMO_SOURCES['bda-sec40-2024']
  ],
  confidence: 'High'
};

export const DEMO_KNOWLEDGE_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: 'kd-1',
    title: 'The Patents Act 1970 (Section 3(p), 3(d), 3(e), Section 10)',
    authority: 'CGPDTM / Ministry of Commerce & Industry',
    category: 'Patents Act',
    jurisdiction: 'India',
    chunksCount: 1420,
    status: 'Active',
    lastUpdated: '2024-06-15'
  },
  {
    id: 'kd-2',
    title: 'Biological Diversity Act 2002 & BDA Amendment Act 2023',
    authority: 'National Biodiversity Authority (NBA)',
    category: 'Biodiversity (BDA)',
    jurisdiction: 'India',
    chunksCount: 890,
    status: 'Active',
    lastUpdated: '2024-05-10'
  },
  {
    id: 'kd-3',
    title: 'Drugs and Cosmetics Act 1940 & Rules 1945 (Chapter IV-A, Rule 158B, Schedule T)',
    authority: 'Ministry of Ayush / CDSCO',
    category: 'Ayush / Drugs & Cosmetics',
    jurisdiction: 'India',
    chunksCount: 2310,
    status: 'Active',
    lastUpdated: '2024-07-01'
  },
  {
    id: 'kd-4',
    title: 'WIPO GRATK Treaty 2024 (Intellectual Property & Genetic Resources)',
    authority: 'WIPO Secretariat, Geneva',
    category: 'International (WIPO/Nagoya/FDA)',
    jurisdiction: 'Global',
    chunksCount: 420,
    status: 'Active',
    lastUpdated: '2024-05-24'
  },
  {
    id: 'kd-5',
    title: 'Ayurvedic Pharmacopoeia of India (API) Formulations & Monograph Indices',
    authority: 'Pharmacopoeia Commission for Indian Medicine & Homoeopathy (PCIM&H)',
    category: 'Pharmacopoeia',
    jurisdiction: 'India',
    chunksCount: 3850,
    status: 'Active',
    lastUpdated: '2024-04-18'
  },
  {
    id: 'kd-6',
    title: 'US FDA Guidance for Industry: Botanical Drug Development (CDER)',
    authority: 'U.S. FDA',
    category: 'International (WIPO/Nagoya/FDA)',
    jurisdiction: 'USA',
    chunksCount: 740,
    status: 'Active',
    lastUpdated: '2023-11-20'
  }
];

export const DEMO_FACILITATOR_REQUESTS: FacilitatorRequest[] = [
  {
    id: 'req-1',
    referenceNumber: 'IP-2026-1042',
    innovationName: 'Supercritical Curcumin Nano-micellar Solution',
    subject: 'Section 3(p) Clearance & Form III NBA Filing Strategy',
    jurisdiction: 'India',
    query: 'Need guidance on whether our supercritical nano-micellar formulation of Curcuma longa with piperine overcomes Section 3(p) objections and what specific comparative bioassay protocols the Indian Patent Office expects.',
    contactEmail: 'innovator@ayushbiotech.in',
    submittedAt: '2026-09-07 14:22',
    status: 'Pending Review',
    priority: 'Normal'
  },
  {
    id: 'req-2',
    referenceNumber: 'IP-2026-0988',
    innovationName: 'Ashwagandha Withanolide Glycoside Sustained Release Tablet',
    subject: 'US FDA Botanical Drug IND Filing vs Dietary Supplement Export',
    jurisdiction: 'USA',
    query: 'Seeking assistance to structure analytical chromatographic data for FDA NDI notification versus standard dietary supplement label claims.',
    contactEmail: 'regulatory@herbalsolutions.com',
    submittedAt: '2026-09-05 10:15',
    status: 'In Analysis',
    priority: 'Urgent'
  }
];
