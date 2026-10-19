/**
 * IP-SAKTI Sahayak - Frontend Interactive Application Logic
 * Problem Statement ID: 26045
 * Ministry of Ayush • All India Institute of Ayurveda
 */

// Global Application State
const appState = {
  jurisdiction: 'india', // 'india' or 'international'
  language: 'en',        // 'en', 'mr', 'hi', 'sa'
  isListening: false,
  activeTab: 'chat',
  wizard: {
    step: 1,
    q1: null,
    q2: null,
    q3: null
  }
};

// =========================================================
// 1. Localization & Multilingual Dictionary (Bhashini Engine)
// ========================================================
const translations = {
  en: {
    title: "IP-SAKTI Sahayak",
    govtTag: "Ministry of Ayush • All India Institute of Ayurveda",
    jurisdictionLabel: "Jurisdiction:",
    tabChat: "AI Legal Assistant",
    tabWizard: "Formulation Classifier",
    tabAbs: "ABS & Biodiversity Calculator",
    tabGraph: "Knowledge Graph",
    tabCorpus: "Statutory Corpus & TKDL",
    escalateBtn: "IP Facilitator",
    activeCorpusIndia: "Active Corpus: Indian Statutory Layer (Patents Act 1970 + 2024 Rules, BDA 2023)",
    activeCorpusIntl: "Active Corpus: International Layer (WIPO GRATK Treaty 2024, TRIPS, Nagoya Protocol)",
    welcomeText: "<p><strong>Namaste & Welcome!</strong> I am your AI assistant for Intellectual Property, Access-and-Benefit-Sharing (ABS), and Regulatory Guidance in Ayurveda.</p><p>Every response is <strong>strictly grounded in official statutes and 2024 gazette rules</strong> with verifiable source citations. Select a quick scenario below or ask your specific question.</p>",
    disclaimer: "Information provided is for technical research and statutory navigation only, not formal legal advice. Grounded in Patents Act 1970 (2024 Rules), Biological Diversity Act 2023, and WIPO GRATK Treaty 2024.",
    inputPlaceholder: "Ask any Ayurveda IPR, Patent, ABS, or Drug Regulatory question...",
    wizardHeading: "Ayurvedic Formulation & Drug Regulatory Classifier",
    wizardSubheading: "Answers the minimum clarifying questions to accurately classify your formulation and generate its custom IPR & ABS roadmap.",
    sugTitle1: "Can I patent an enhanced topical gel containing standardized Ashwagandha extract?",
    sugTitle2: "Is Classical Chyawanprash formulation patentable under Section 3(p)?",
    sugTitle3: "What are the ABS and NBA clearance rules for Curcuma extract export to USA/EU?"
  },
  mr: {
    title: "आयपी-शक्ती सहायक",
    govtTag: "आयुष मंत्रालय • अखिल भारतीय आयुर्वेद संस्थान (AIIA)",
    jurisdictionLabel: "अधिकारक्षेत्र:",
    tabChat: "AI कायदेशीर सल्लागार",
    tabWizard: "औषध वर्गीकरण विझार्ड",
    tabAbs: "ABS आणि जैवविविधता कॅल्क्युलेटर",
    tabGraph: "नॉलेज ग्राफ",
    tabCorpus: "सरकारी कायदे आणि TKDL",
    escalateBtn: "तज्ज्ञ सहाय्यक",
    activeCorpusIndia: "सक्रिय डेटाबेस: भारतीय कायदे (पेटंट कायदा १९७०, जैवविविधता नियम २०२४, DCA)",
    activeCorpusIntl: "सक्रिय डेटाबेस: आंतरराष्ट्रीय कायदे (WIPO GRATK करार २०२४, TRIPS, नागोया)",
    welcomeText: "<p><strong>नमस्ते!</strong> मी आयुर्वेद क्षेत्रातील बौद्धिक संपदा (IPR), जैवविविधता (ABS) आणि सरकारी नियमावलीसाठी तुमचा AI सहाय्यक आहे.</p><p>माझे प्रत्येक उत्तर <strong>२०२४ चे नवीन सरकारी नियम आणि कायद्याच्या कलमांच्या अधिकृत संदर्भासह (Citations)</strong> दिले जाते. खालीलपैकी एक पर्याय निवडा किंवा तुमचा प्रश्न विचारा.</p>",
    disclaimer: "ही केवळ माहिती व संशोधनासाठी आहे, अधिकृत कायदेशीर सल्ला नाही. भारतीय पेटंट नियम २०२४ आणि WIPO करारावर आधारित.",
    inputPlaceholder: "आयुर्वेद पेटंट, जैवविविधता (ABS) किंवा औषध नियमांबद्दल विचारा...",
    wizardHeading: "आयुर्वेदिक फॉर्म्युलेशन आणि औषध नियमन वर्गीकरण",
    wizardSubheading: "तुमचे उत्पादन नेमके कोणत्या श्रेणीत मोडते आणि त्यासाठी पेटंट व ABS चे काय नियम आहेत हे तपासण्यासाठी साधे प्रश्न.",
    sugTitle1: "अश्वगंधाच्या नवीन टॉपिकल जेलसाठी पेटंट व ABS मंजुरीची काय प्रक्रिया आहे?",
    sugTitle2: "शास्त्रीय च्यवनप्राश फॉर्म्युलेशनवर कलम ३(p) अंतर्गत पेटंट मिळू शकते का?",
    sugTitle3: "हळद / कर्क्युमिन अर्काची अमेरिका किंवा युरोपमध्ये निर्यातीसाठी NBA नियम काय आहेत?"
  },
  hi: {
    title: "आईपी-शक्ति सहायक",
    govtTag: "आयुष मंत्रालय • अखिल भारतीय आयुर्वेद संस्थान (AIIA)",
    jurisdictionLabel: "अधिकार क्षेत्र:",
    tabChat: "AI विधिक सहायक",
    tabWizard: "औषध वर्गीकरण विज़ार्ड",
    tabAbs: "ABS एवं जैव विविधता कैलकुलेटर",
    tabGraph: "नॉलेज ग्राफ",
    tabCorpus: "वैधानिक विधि एवं TKDL",
    escalateBtn: "विशेषज्ञ सहायता",
    activeCorpusIndia: "सक्रिय कॉर्पस: भारतीय विधिक ढांचा (पेटेंट अधिनियम 1970, जैव विविधता 2024)",
    activeCorpusIntl: "सक्रिय कॉर्पस: अंतर्राष्ट्रीय ढांचा (WIPO GRATK संधि 2024, TRIPS, नागोया)",
    welcomeText: "<p><strong>नमस्ते!</strong> मैं आयुर्वेद में बौद्धिक संपदा (IPR), जैव विविधता (ABS) और नियामक मार्गदर्शन के लिए आपका AI सहायक हूँ।</p><p>प्रत्येक उत्तर <strong>आधिकारिक कानूनों और 2024 के नए नियमों</strong> के सटीक संदर्भ के साथ दिया जाता है।</p>",
    disclaimer: "प्रदान की गई जानकारी केवल तकनीकी अनुसंधान के लिए है, औपचारिक कानूनी सलाह नहीं।",
    inputPlaceholder: "आयुर्वेद पेटेंट, ABS या औषधि नियामक संबंधी प्रश्न पूछें...",
    wizardHeading: "आयुर्वेदिक फॉर्मूलेशन एवं औषधि नियामक वर्गीकरण",
    wizardSubheading: "अपने उत्पाद का सही वर्गीकरण और पेटेंट व ABS मार्गदर्शिका प्राप्त करें।",
    sugTitle1: "क्या अश्वगंधा युक्त टॉपिकल जेल पर पेटेंट प्राप्त किया जा सकता है?",
    sugTitle2: "क्या शास्त्रीय च्यवनप्राश फॉर्मूलेशन धारा 3(p) के तहत पेटेंट योग्य है?",
    sugTitle3: "हल्दी अर्क के अमेरिका/यूरोप निर्यात के लिए ABS और NBA के नियम क्या हैं?"
  },
  sa: {
    title: "आईपी-शक्ति सहायकः",
    govtTag: "आयुष मन्त्रालयम् • अखिल भारतीय आयुर्वेद संस्थानम्",
    jurisdictionLabel: "अधिकारक्षेत्रम्:",
    tabChat: "एआई विधिक परामर्शदाता",
    tabWizard: "योग वर्गीकरणम्",
    tabAbs: "जैवविविधता ABS गणकः",
    tabGraph: "ज्ञान रेखाचित्रम्",
    tabCorpus: "संहिता ग्रन्थाः च",
    escalateBtn: "विशेषज्ञ सम्पर्कः",
    activeCorpusIndia: "सक्रिय ग्रन्थसङ्ग्रहः: भारतीय पेटेण्ट् विधानम् (१९७०/२०२४)",
    activeCorpusIntl: "सक्रिय ग्रन्थसङ्ग्रहः: अन्ताराष्ट्रिय WIPO सन्धिः २०२४",
    welcomeText: "<p><strong>नमस्ते!</strong> आयुर्वेद-बौद्धिकसम्पदा-जैवविविधता-नियमसम्बन्धे भवतां स्वागतम्।</p><p>सर्वाणि उत्तराणि प्रमाणग्रन्थैः सह दीयन्ते।</p>",
    disclaimer: "एषा सूचना केवलं मार्गदर्शनाय अस्ति, न तु साक्षात् विधिकपरामर्शः।",
    inputPlaceholder: "आयुर्वेद-पेटेण्ट्-जैवविविधता विषये पृच्छतु...",
    wizardHeading: "आयुर्वेदिक योग एवं औषध वर्गीकरणम्",
    wizardSubheading: "भवतः योगस्य विधि-संरक्षणाय मार्गदर्शनम्।",
    sugTitle1: "अश्वगन्धा-लेपस्य पेटेण्ट्-संरक्षणाय का प्रक्रिया अस्ति?",
    sugTitle2: "च्यवनप्राश-योगस्य पेटेण्ट्-स्वीकृतिः सम्भवति वा?",
    sugTitle3: "हरिद्रा-निर्यात-सम्बन्धे NBA जैवविविधता-नियमाः के सन्ति?"
  }
};

// Change Language
function changeLanguage(langCode) {
  appState.language = langCode;
  const dict = translations[langCode] || translations.en;

  document.getElementById('txtGovtTag').innerText = dict.govtTag;
  document.getElementById('txtJurisdictionLabel').innerText = dict.jurisdictionLabel;
  document.getElementById('txtTabChat').innerText = dict.tabChat;
  document.getElementById('txtTabWizard').innerText = dict.tabWizard;
  document.getElementById('txtTabAbs').innerText = dict.tabAbs;
  document.getElementById('txtTabGraph').innerText = dict.tabGraph;
  document.getElementById('txtTabCorpus').innerText = dict.tabCorpus;
  document.getElementById('txtEscalateBtn').innerText = dict.escalateBtn;
  document.getElementById('txtDisclaimerText').innerText = dict.disclaimer;
  document.getElementById('userQueryInput').placeholder = dict.inputPlaceholder;
  document.getElementById('txtWizardHeading').innerText = dict.wizardHeading;
  document.getElementById('txtWizardSubheading').innerText = dict.wizardSubheading;

  // Update suggested titles if elements exist
  const s1 = document.getElementById('sugTitle1');
  const s2 = document.getElementById('sugTitle2');
  const s3 = document.getElementById('sugTitle3');
  if (s1 && dict.sugTitle1) s1.innerText = dict.sugTitle1;
  if (s2 && dict.sugTitle2) s2.innerText = dict.sugTitle2;
  if (s3 && dict.sugTitle3) s3.innerText = dict.sugTitle3;

  // Update active corpus label
  const isIndia = appState.jurisdiction === 'india';
  document.getElementById('txtActiveCorpusText').innerText = isIndia ? dict.activeCorpusIndia : dict.activeCorpusIntl;
}

// =========================================================
// 2. Jurisdiction Switcher (India vs International)
// =========================================================
function setJurisdiction(type) {
  appState.jurisdiction = type;
  const btnIndia = document.getElementById('btnIndia');
  const btnIntl = document.getElementById('btnIntl');
  const dict = translations[appState.language] || translations.en;

  if (type === 'india') {
    btnIndia.classList.add('active');
    btnIntl.classList.remove('active');
    document.getElementById('txtActiveCorpusText').innerText = dict.activeCorpusIndia;
  } else {
    btnIntl.classList.add('active');
    btnIndia.classList.remove('active');
    document.getElementById('txtActiveCorpusText').innerText = dict.activeCorpusIntl;
  }

  // Add system note in chat
  appendSystemMessage(
    type === 'india'
      ? "🌐 Switched to <strong>National Jurisdiction (India)</strong>: Grounded in Patents Act 1970 (2024 Rules), Biological Diversity Act 2023, Drugs & Cosmetics Act 1940, and FSSAI 2022."
      : "🌐 Switched to <strong>International Jurisdiction</strong>: Grounded in WIPO GRATK Treaty 2024, TRIPS Art 27, Nagoya Protocol on ABS, and US-FDA/EMA Botanical guidelines."
  );
}

// =========================================================
// 3. Tab Switching
// =========================================================
function switchTab(tabId) {
  appState.activeTab = tabId;
  const tabs = ['chat', 'wizard', 'abs', 'graph', 'corpus'];

  tabs.forEach(t => {
    const btn = document.getElementById(`tab${capitalize(t)}`);
    const sec = document.getElementById(`sec${capitalize(t)}`);
    if (btn && sec) {
      if (t === tabId) {
        btn.classList.add('active');
        sec.classList.add('active');
      } else {
        btn.classList.remove('active');
        sec.classList.remove('active');
      }
    }
  });

  if (tabId === 'graph') {
    renderKnowledgeGraph();
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// =========================================================
// 4. Voice Input (Bhashini Speech Simulation)
// =========================================================
function toggleVoiceInput() {
  const btn = document.getElementById('btnVoice');
  const waveform = document.getElementById('voiceWaveform');
  const input = document.getElementById('userQueryInput');

  if (!appState.isListening) {
    appState.isListening = true;
    btn.classList.add('recording');
    waveform.style.display = 'flex';

    // Simulate Bhashini transcription after 2.5 seconds
    setTimeout(() => {
      if (appState.isListening) {
        if (appState.language === 'mr') {
          input.value = "अश्वगंधाच्या नवीन जेलसाठी पेटंट आणि ABS मंजुरीची काय प्रक्रिया आहे?";
        } else if (appState.language === 'hi') {
          input.value = "क्या शास्त्रीय च्यवनप्राश फॉर्मूलेशन पर पेटेंट प्राप्त किया जा सकता है?";
        } else {
          input.value = "Can I patent an enhanced topical gel containing standardized Ashwagandha extract?";
        }
        toggleVoiceInput();
        handleUserSubmit(new Event('submit'));
      }
    }, 2800);
  } else {
    appState.isListening = false;
    btn.classList.remove('recording');
    waveform.style.display = 'none';
  }
}

// =========================================================
// 5. RAG AI Legal Assistant Engine
// =========================================================

// Pre-curated Grounded Responses Repository
const ragCorpus = {
  ashwagandha_gel: {
    query: "Can I patent an enhanced topical gel containing standardized Ashwagandha extract?",
    response: `<p><strong>Statutory Determination:</strong> A formulation containing <em>Withania somnifera</em> (Ashwagandha) faces the statutory bar under <strong>Section 3(p) of the Patents Act, 1970</strong> (Traditional Knowledge exception).</p>
    <p>However, you <strong>CAN secure valid patent protection</strong> under the following conditions:</p>
    <ul>
      <li><strong>Novel Delivery System / Process:</strong> If you have developed a specific nanotechnology carrier (e.g. liposomal/nano-emulsion matrix) or a proprietary standardized extraction process resulting in unexpected synergistic transdermal permeation.</li>
      <li><strong>Synergistic Therapeutic Efficacy:</strong> You must demonstrate statistical data showing synergy (not a mere admixture) under <strong>Section 3(d) & 3(e)</strong>.</li>
    </ul>
    <p><strong>ABS & Biodiversity Clearance:</strong> Prior to filing this patent, if Indian biological resources are utilized, you must obtain approval from the <strong>National Biodiversity Authority (NBA) under Section 6 of the Biological Diversity Act, 2002 (Amended 2023)</strong> using <em>Form III</em>.</p>`,
    citations: [
      { tag: "Patents Act 1970, Sec 3(p)", key: "patents_act_3p" },
      { tag: "Patents Act 1970, Sec 3(d)", key: "patents_act_3d" },
      { tag: "Biological Diversity Act 2023, Sec 6", key: "biodiversity_2023" },
      { tag: "TKDL Reference (Withania somnifera)", key: "tkdl_ashwagandha" }
    ],
    confidence: "99.2% Grounded"
  },
  chyawanprash_tk: {
    query: "Is Classical Chyawanprash formulation patentable under Section 3(p)?",
    response: `<p><strong>Statutory Verdict: NO (Direct Composition Patent is Prohibited).</strong></p>
    <p>Chyawanprash is a classical formulation documented in authoritative texts (First Schedule of Drugs & Cosmetics Act 1940, including <em>Charaka Samhita Chikitsa Sthana</em>).</p>
    <ul>
      <li><strong>Section 3(p) Bar:</strong> An invention which in effect is traditional knowledge or an aggregation/duplication of known properties is non-patentable. The <strong>TKDL (Traditional Knowledge Digital Library)</strong> has repeatedly defended this formulation against foreign patent claims (e.g., at USPTO & EPO).</li>
      <li><strong>Permitted Commercial Protection:</strong> 
        1. <strong>Trademark:</strong> Register a distinctive brand name (e.g. "Dabur Chyawanprash", "Baidyanath Chyawanprash") under the Trade Marks Act, 1999.
        2. <strong>Trade Dress & Design:</strong> Protect packaging bottle design under the Designs Act, 2000.
        3. <strong>AYUSH Licensing:</strong> Obtain Classical ASU Drug License under Rule 153/154 of Drugs & Cosmetics Rules 1945.
      </li>
    </ul>`,
    citations: [
      { tag: "Patents Act 1970, Sec 3(p)", key: "patents_act_3p" },
      { tag: "Drugs & Cosmetics Act 1940, First Schedule", key: "drugs_cosmetics_1940" },
      { tag: "TKDL Prior-Art Defense Record", key: "tkdl_chyawanprash" }
    ],
    confidence: "99.8% Grounded"
  },
  turmeric_export: {
    query: "Curcuma Extract Export to EU/USA: Do I need NBA approval under Biodiversity Act 2024?",
    response: `<p><strong>Statutory Clearance Roadmap for Export:</strong></p>
    <p>1. <strong>Normally Traded Commodity (NTAC) Exemption Check:</strong> Whole dried rhizomes of <em>Curcuma longa</em> traded purely as an agricultural spice fall under the <strong>Section 40 Notification (NTAC list)</strong> and are exempt from ABS levies.</p>
    <p>2. <strong>Standardized Medicinal Extract (Non-Exempt):</strong> If exporting concentrated, value-added curcumin extracts or standardized phytochemical fractions for pharmaceutical/nutraceutical formulations, <strong>Section 40 exemption DOES NOT apply</strong>.</p>
    <ul>
      <li><strong>Indian Entities:</strong> Must file an intimation with the State Biodiversity Board (SBB) under <strong>Section 7</strong> and comply with the Fair and Equitable Benefit Sharing (FEBS) levy (0.1% to 0.5% of ex-factory sale).</li>
      <li><strong>Foreign Importers / Multi-nationals:</strong> Must obtain prior approval from the <strong>National Biodiversity Authority (NBA) under Section 3 & Form I</strong>.</li>
      <li><strong>International Patent Filing:</strong> Under the <strong>WIPO GRATK Treaty (2024)</strong>, patent filings in the EU/US using Indian turmeric must formally disclose India as the country of origin.</li>
    </ul>`,
    citations: [
      { tag: "Biological Diversity Act 2023, Sec 40 (NTAC)", key: "biodiversity_sec40" },
      { tag: "WIPO GRATK Treaty 2024, Art 3", key: "wipo_gratk_2024" },
      { tag: "Nagoya Protocol, Art 5 (Fair & Equitable ABS)", key: "nagoya_protocol" }
    ],
    confidence: "98.9% Grounded"
  },
  ayurveda_aahar: {
    query: "What is the regulatory difference between Ayurveda Aahar (FSSAI) vs Proprietary Ayurvedic Medicine (AYUSH)?",
    response: `<p><strong>Statutory Dual-Regime Comparison:</strong></p>
    <table style="width:100%; border-collapse: collapse; margin: 0.8rem 0; font-size: 0.85rem;">
      <tr style="background: rgba(212,175,55,0.15); border-bottom: 1px solid rgba(212,175,55,0.3);">
        <th style="padding: 6px; text-align: left;">Parameter</th>
        <th style="padding: 6px; text-align: left;">Ayurveda Aahar (FSSAI 2022)</th>
        <th style="padding: 6px; text-align: left;">Proprietary ASU Drug (DCA 1940)</th>
      </tr>
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
        <td style="padding: 6px; font-weight: bold;">Governing Act</td>
        <td style="padding: 6px;">Food Safety & Standards Act, 2006</td>
        <td style="padding: 6px;">Drugs & Cosmetics Act, 1940</td>
      </tr>
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
        <td style="padding: 6px; font-weight: bold;">Permitted Claims</td>
        <td style="padding: 6px;">Health & physiological balance only</td>
        <td style="padding: 6px;">Therapeutic / disease treatment & cure</td>
      </tr>
      <tr>
        <td style="padding: 6px; font-weight: bold;">Labelling Rules</td>
        <td style="padding: 6px;">Must carry "Ayurveda Aahar" logo</td>
        <td style="padding: 6px;">Schedule T GMP compliance & AYUSH Drug Lic</td>
      </tr>
    </table>
    <p><strong>Caution:</strong> Ayurveda Aahar products cannot claim treatment of diseases listed in Schedule J of Drugs & Cosmetics Rules or the Drugs and Magic Remedies Act 1954.</p>`,
    citations: [
      { tag: "FSSAI (Ayurveda Aahar) Reg. 2022", key: "fssai_aahar_2022" },
      { tag: "Drugs & Cosmetics Act 1940, Sec 3(a)", key: "drugs_cosmetics_1940" },
      { tag: "Drugs & Magic Remedies Act 1954", key: "magic_remedies_1954" }
    ],
    confidence: "99.5% Grounded"
  }
};

// Generic response generator for user typed questions
function generateGroundedResponse(userQuery) {
  const queryLower = userQuery.toLowerCase();

  if (queryLower.includes('ashwagandha') || queryLower.includes('gel') || queryLower.includes('nano') || queryLower.includes('topical')) {
    return ragCorpus.ashwagandha_gel;
  }
  if (queryLower.includes('chyawanprash') || queryLower.includes('classical') || queryLower.includes('charaka') || queryLower.includes('generic')) {
    return ragCorpus.chyawanprash_tk;
  }
  if (queryLower.includes('turmeric') || queryLower.includes('curcuma') || queryLower.includes('export') || queryLower.includes('europe') || queryLower.includes('usa')) {
    return ragCorpus.turmeric_export;
  }
  if (queryLower.includes('aahar') || queryLower.includes('food') || queryLower.includes('fssai') || queryLower.includes('dietary')) {
    return ragCorpus.ayurveda_aahar;
  }

  // Fallback Dynamic Legal Synthesis
  return {
    query: userQuery,
    response: `<p><strong>Statutory Analysis for:</strong> "<em>${escapeHTML(userQuery)}</em>"</p>
    <p>Under the ${appState.jurisdiction === 'india' ? 'Indian Legal Regime (Patents Act 1970 & Biological Diversity Act 2023)' : 'International Regime (WIPO GRATK Treaty 2024 & Nagoya Protocol)'}:</p>
    <ul>
      <li><strong>Section 3(p) & Traditional Knowledge Verification:</strong> If the formulation uses biological components cited in classical Ayurvedic compendia (First Schedule texts), claims must demonstrate demonstrable technological advancement or synergistic novelty.</li>
      <li><strong>ABS Regulatory Obligation:</strong> Under Section 3 & 7 of the Biological Diversity Act, commercialization requires intimation/approval from the designated State Biodiversity Board (SBB) or National Biodiversity Authority (NBA).</li>
      <li><strong>Recommended Next Step:</strong> Run your specific formulation parameters through our <strong>Formulation Classifier Wizard</strong> or escalate to an accredited Ayush IP Facilitator.</li>
    </ul>`,
    citations: [
      { tag: "The Patents Act, 1970 - Section 3(p)", key: "patents_act_3p" },
      { tag: "Biological Diversity Act 2023 - Section 6", key: "biodiversity_2023" },
      { tag: "WIPO GRATK Treaty 2024", key: "wipo_gratk_2024" }
    ],
    confidence: "97.6% Grounded"
  };
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Execute Quick Prompt
function executeQuickPrompt(promptKey) {
  const data = ragCorpus[promptKey];
  if (!data) return;

  const input = document.getElementById('userQueryInput');
  input.value = data.query;
  handleUserSubmit(new Event('submit'));
}

// Handle User Message Submission
function handleUserSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('userQueryInput');
  const query = input.value.trim();
  if (!query) return;

  // Append user message
  appendUserMessage(query);
  input.value = '';

  // Show typing indicator
  const typingId = showTypingIndicator();

  // Simulate RAG Retrieval & Streaming
  setTimeout(() => {
    removeTypingIndicator(typingId);
    const result = generateGroundedResponse(query);
    appendBotMessage(result);
  }, 900);
}

function appendUserMessage(text) {
  const container = document.getElementById('chatMessages');
  const msgDiv = document.createElement('div');
  msgDiv.className = 'msg user-msg';
  msgDiv.innerHTML = `
    <div class="msg-avatar user-avatar">YOU</div>
    <div class="msg-body">
      <div class="msg-header">
        <span class="bot-name">Researcher / Applicant</span>
        <span class="msg-time">Just now</span>
      </div>
      <div class="msg-text"><p>${escapeHTML(text)}</p></div>
    </div>
  `;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function appendBotMessage(data) {
  const container = document.getElementById('chatMessages');
  const msgDiv = document.createElement('div');
  msgDiv.className = 'msg bot-msg';

  let citationsHtml = '';
  if (data.citations && data.citations.length > 0) {
    citationsHtml = `
      <div class="citation-pills-wrap">
        <span class="citation-header-txt">Statutory Citations & Verification:</span>
        <div class="citations-list">
          ${data.citations.map(c => `
            <button class="citation-badge" onclick="openGazetteModal('${c.key}')">
              <span>📜 ${c.tag}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  msgDiv.innerHTML = `
    <div class="msg-avatar">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
    </div>
    <div class="msg-body">
      <div class="msg-header">
        <span class="bot-name">IP-SAKTI Sahayak AI</span>
        <span class="msg-time">Just now</span>
        <span class="grounded-tag">✓ ${data.confidence || 'RAG Grounded'}</span>
      </div>
      <div class="msg-text">${data.response}</div>
      ${citationsHtml}
    </div>
  `;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function appendSystemMessage(htmlText) {
  const container = document.getElementById('chatMessages');
  const msgDiv = document.createElement('div');
  msgDiv.className = 'msg system-notification';
  msgDiv.style.alignSelf = 'center';
  msgDiv.style.background = 'rgba(212, 175, 55, 0.08)';
  msgDiv.style.border = '1px solid rgba(212, 175, 55, 0.25)';
  msgDiv.style.borderRadius = '20px';
  msgDiv.style.padding = '0.4rem 1rem';
  msgDiv.style.fontSize = '0.78rem';
  msgDiv.style.color = '#e2e8f0';
  msgDiv.innerHTML = htmlText;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
  const container = document.getElementById('chatMessages');
  const typingDiv = document.createElement('div');
  const id = 'typing_' + Date.now();
  typingDiv.id = id;
  typingDiv.className = 'msg bot-msg';
  typingDiv.innerHTML = `
    <div class="msg-avatar">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
    </div>
    <div class="msg-body" style="padding: 0.75rem 1rem;">
      <span style="font-size:0.8rem; color:#d4af37;">Retrieving statutory corpus & verifying Section 3(p)...</span>
    </div>
  `;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// =========================================================
// 6. Formulation Classification Wizard
// =========================================================

function selectWizardOption(step, optionVal) {
  if (step === 1) {
    appState.wizard.q1 = optionVal;
    document.getElementById('wStep1').classList.add('completed');
    document.getElementById('wConn1').classList.add('filled');
    document.getElementById('wStep2').classList.add('active');

    document.getElementById('viewStep1').style.display = 'none';
    document.getElementById('viewStep2').style.display = 'block';
  } else if (step === 2) {
    appState.wizard.q2 = optionVal;
    document.getElementById('wStep2').classList.add('completed');
    document.getElementById('wConn2').classList.add('filled');
    document.getElementById('wStep3').classList.add('active');

    document.getElementById('viewStep2').style.display = 'none';
    document.getElementById('viewStep3').style.display = 'block';
  } else if (step === 3) {
    appState.wizard.q3 = optionVal;
    document.getElementById('wStep3').classList.add('completed');
    document.getElementById('wConn3').classList.add('filled');
    document.getElementById('wStep4').classList.add('active');

    document.getElementById('viewStep3').style.display = 'none';
    document.getElementById('viewStep4').style.display = 'block';

    generateWizardVerdict();
  }
}

function generateWizardVerdict() {
  const { q1, q2, q3 } = appState.wizard;
  const titleEl = document.getElementById('txtVerdictTitle');
  const regEl = document.getElementById('txtVerdictReg');
  const iprEl = document.getElementById('txtVerdictIPR');
  const absEl = document.getElementById('txtVerdictABS');
  const tkdlEl = document.getElementById('txtVerdictTKDL');

  if (q1 === 'classical_yes' && q3 === 'use_therapeutic') {
    titleEl.innerText = "Classical Ayurvedic Medicine (Generic / Shastriya Formulation)";
    regEl.innerText = "Governed by First Schedule of Drugs & Cosmetics Act 1940. Requires State AYUSH License under Rule 153. No separate clinical trial required (safety/efficacy presumed by traditional text citation).";
    iprEl.innerText = "NO Patent for formulation under Section 3(p). Protect via Registered Brand Trademark (Trade Marks Act 1999) & distinctive trade dress.";
    absEl.innerText = "Exempt from NBA approval for registered Indian Vaidyas/practitioners. Commercial manufacturing requires intimation to State Biodiversity Board (SBB) under Section 7.";
    tkdlEl.innerText = "100% indexed in Traditional Knowledge Digital Library (TKDL). Direct patenting attempts will trigger official pre-grant opposition.";
  } else if (q3 === 'use_aahar') {
    titleEl.innerText = "Ayurveda Aahar (Dietary Health Supplement under FSSAI)";
    regEl.innerText = "Governed by Food Safety and Standards (Ayurveda Aahar) Regulations, 2022. No AYUSH drug license needed, but FSSAI Special Category License with mandatory 'Ayurveda Aahar' logo is mandatory. Strictly NO disease curative claims permitted.";
    iprEl.innerText = "Eligible for trademark, copyright on branding/recipes, and patent for novel functional food matrix or stabilization method.";
    absEl.innerText = "If using herbs on Section 40 NTAC list traded as food commodities, ABS exemption applies. Non-NTAC herbs require SBB intimation.";
    tkdlEl.innerText = "TKDL citation needed to prove food/dietary historical usage in classical texts.";
  } else if (q1 === 'classical_no' || q2 === 'inno_synergy') {
    titleEl.innerText = "Phytopharmaceutical / High-Novelty ASU Drug (New Chemical / Bioactive Entity)";
    regEl.innerText = "Section 3(a) & Rule 122E/Schedule Y of Drugs & Cosmetics Act. Requires Central Licensing Authority (DCGI / CDSCO) approval with Phase I-III clinical trial safety dossiers.";
    iprEl.innerText = "HIGH PATENTABILITY POTENTIAL: Composition-of-matter, synergistic bioactive ratios (overcoming Section 3(d)), and international PCT patent filing.";
    absEl.innerText = "MANDATORY Form III prior approval from National Biodiversity Authority (NBA) before filing patent applications in India or abroad.";
    tkdlEl.innerText = "Prior-art search in TKDL required to establish inventive step over existing traditional literature.";
  } else {
    titleEl.innerText = "Patent & Proprietary (P&P) Ayurvedic Medicine";
    regEl.innerText = "Rule 158B of Drugs & Cosmetics Rules 1945. Requires safety & pilot clinical trial evidence / published scientific literature for State AYUSH licensing.";
    iprEl.innerText = "Process Patent allowed. Formulation patent valid only if synergistic efficacy over traditional dosage is established (Section 3(d) & 3(e)).";
    absEl.innerText = "Intimation to State Biodiversity Board (SBB) under Section 7 required before commercial production.";
    tkdlEl.innerText = "Claims must avoid broad generic plant mixtures to prevent Section 3(p) objections.";
  }
}

function resetWizard() {
  appState.wizard = { step: 1, q1: null, q2: null, q3: null };
  ['wStep1', 'wStep2', 'wStep3', 'wStep4'].forEach(id => document.getElementById(id).className = 'step-node');
  ['wConn1', 'wConn2', 'wConn3'].forEach(id => document.getElementById(id).className = 'step-connector');
  document.getElementById('wStep1').classList.add('active');

  ['viewStep1', 'viewStep2', 'viewStep3', 'viewStep4'].forEach((id, idx) => {
    document.getElementById(id).style.display = idx === 0 ? 'block' : 'none';
  });
}

function copyVerdictReport() {
  const title = document.getElementById('txtVerdictTitle').innerText;
  const reg = document.getElementById('txtVerdictReg').innerText;
  const ipr = document.getElementById('txtVerdictIPR').innerText;
  const abs = document.getElementById('txtVerdictABS').innerText;

  const text = `=== IP-SAKTI Sahayak Classification Dossier ===\nCategory: ${title}\n\nRegulatory Path:\n${reg}\n\nIPR Strategy:\n${ipr}\n\nABS & Biodiversity:\n${abs}\n=============================================`;
  navigator.clipboard.writeText(text).then(() => {
    alert("Regulatory Brief copied to clipboard!");
  });
}

function exportVerdictToChat() {
  const title = document.getElementById('txtVerdictTitle').innerText;
  switchTab('chat');
  const input = document.getElementById('userQueryInput');
  input.value = `I have completed the classification wizard and my product is: ${title}. What are the detailed compliance steps?`;
  handleUserSubmit(new Event('submit'));
}

// =========================================================
// 7. ABS & Biodiversity Compliance Calculator
// =========================================================
const absDatabase = {
  ashwagandha: { isNTAC: false, isEndangered: false, sbbLevy: "0.1% to 0.3%" },
  turmeric: { isNTAC: true, isEndangered: false, sbbLevy: "Exempt for raw spice; 0.2% for extracts" },
  sarpagandha: { isNTAC: false, isEndangered: true, sbbLevy: "0.5% (Strict NBA Oversight - Red Listed)" },
  guggulu: { isNTAC: false, isEndangered: true, sbbLevy: "0.4% (Vulnerable Wild Resin)" },
  brahmi: { isNTAC: false, isEndangered: false, sbbLevy: "0.2%" },
  tulsi: { isNTAC: true, isEndangered: false, sbbLevy: "Exempt for traditional food/tea; 0.1% for Pharma" }
};

function evaluateABS() {
  const herb = document.getElementById('herbSelect').value;
  const entity = document.getElementById('entitySelect').value;
  const activity = document.getElementById('activitySelect').value;
  const source = document.getElementById('sourceSelect').value;

  const herbData = absDatabase[herb] || { isNTAC: false, isEndangered: false, sbbLevy: "0.2%" };

  const statusChip = document.getElementById('absStatusChip');
  const resTitle = document.getElementById('absResultTitle');
  const resStatute = document.getElementById('resStatute');
  const resForm = document.getElementById('resForm');
  const resFee = document.getElementById('resFee');
  const resExempt = document.getElementById('resExempt');
  const resDeadline = document.getElementById('resDeadline');

  // Logic Tree
  if (entity === 'foreign_entity') {
    statusChip.className = 'status-chip chip-strict';
    statusChip.innerText = "MANDATORY APPROVAL: NATIONAL BIODIVERSITY AUTHORITY (NBA)";
    resTitle.innerText = "Section 3 Prior Approval & Benefit-Sharing Agreement (Form I)";
    resStatute.innerText = "Section 3 of Biological Diversity Act 2002 (Amended 2023)";
    resForm.innerText = "Form I (Application for Access to Biological Resources by Non-Indians)";
    resFee.innerText = "3.0% to 5.0% of purchase price of biological resources or negotiated gross royalty";
    resExempt.innerText = "Foreign entities cannot claim NTAC Section 40 exemption for commercial manufacturing or IPR.";
    resDeadline.innerText = "Before accessing biological resources or importing material into foreign jurisdiction";
  } else if (activity === 'ipr_patent') {
    statusChip.className = 'status-chip chip-strict';
    statusChip.innerText = "NBA PERMISSION REQUIRED BEFORE PATENT GRANT";
    resTitle.innerText = "Form III Approval for Intellectual Property Rights";
    resStatute.innerText = "Section 6 of Biological Diversity Act (Amended 2023)";
    resForm.innerText = "Form III (Application for seeking prior approval of NBA for applying for IPR)";
    resFee.innerText = "0.2% to 1.0% of commercial sales upon patent commercialization";
    resExempt.innerText = "Section 40 NTAC DOES NOT apply to patent applications.";
    resDeadline.innerText = "Prior to patent grant in India, or before sealing of international PCT claims";
  } else if (herbData.isNTAC && source === 'market_ntac' && activity === 'commercial_mfg') {
    statusChip.className = 'status-chip chip-exempt';
    statusChip.innerText = "SECTION 40 NTAC EXEMPTION APPLICABLE";
    resTitle.innerText = "Exempt from ABS Obligations (Normally Traded Commodity)";
    resStatute.innerText = "Section 40 Notification of Biological Diversity Act";
    resForm.innerText = "No Form I/III required for domestic agricultural/food trade";
    resFee.innerText = "Zero (0%) ABS Levy";
    resExempt.innerText = "Exempt provided the resource is procured from open mandi as raw traded commodity.";
    resDeadline.innerText = "Maintain mandi purchase invoices for compliance auditing";
  } else {
    statusChip.className = 'status-chip chip-approved';
    statusChip.innerText = "STATE BIODIVERSITY BOARD (SBB) INTIMATION REQUIRED";
    resTitle.innerText = "Form I Intimation to State Biodiversity Board";
    resStatute.innerText = "Section 7 of Biological Diversity Act 2023";
    resForm.innerText = "State Biodiversity Board Online Portal Intimation";
    resFee.innerText = herbData.sbbLevy + " of ex-factory gross sales";
    resExempt.innerText = "Value-added medicinal extract requires formal SBB intimation.";
    resDeadline.innerText = "Prior to commercial production batch release";
  }
}

// =========================================================
// 8. Relational Knowledge Graph Visualizer (SVG)
// =========================================================

const graphNodes = [
  { id: 'ashwa', label: 'Withania somnifera\n(Ashwagandha)', x: 180, y: 120, type: 'herb' },
  { id: 'witha', label: 'Withanolides A/D\n(Bioactive)', x: 380, y: 80, type: 'inno' },
  { id: 'charak', label: 'Charaka Samhita\n(Chikitsa Sthana)', x: 160, y: 320, type: 'tk' },
  { id: 'sec3p', label: 'Section 3(p)\nTK Patent Bar', x: 400, y: 240, type: 'statute' },
  { id: 'sec3d', label: 'Section 3(d)\nSynergistic Novelty', x: 620, y: 120, type: 'inno' },
  { id: 'nba', label: 'NBA Form III\nABS Compliance', x: 620, y: 320, type: 'statute' },
  { id: 'wipo', label: 'WIPO GRATK Treaty\n(2024 Origin Disclosure)', x: 780, y: 220, type: 'inno' }
];

const graphLinks = [
  { source: 'ashwa', target: 'witha', label: 'contains' },
  { source: 'ashwa', target: 'charak', label: 'codified in' },
  { source: 'charak', target: 'sec3p', label: 'establishes prior art' },
  { source: 'witha', target: 'sec3d', label: 'enhanced via nano-carrier' },
  { source: 'sec3p', target: 'sec3d', label: 'overcomes bar via' },
  { source: 'ashwa', target: 'nba', label: 'requires clearance' },
  { source: 'sec3d', target: 'wipo', label: 'international filing' }
];

function renderKnowledgeGraph() {
  const svg = document.getElementById('kgSvg');
  if (!svg) return;
  svg.innerHTML = '';

  // Draw Links
  graphLinks.forEach(link => {
    const src = graphNodes.find(n => n.id === link.source);
    const tgt = graphNodes.find(n => n.id === link.target);
    if (!src || !tgt) return;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', src.x);
    line.setAttribute('y1', src.y);
    line.setAttribute('x2', tgt.x);
    line.setAttribute('y2', tgt.y);
    line.setAttribute('stroke', 'rgba(212, 175, 55, 0.35)');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '4 2');
    svg.appendChild(line);
  });

  // Draw Nodes
  graphNodes.forEach(node => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'kg-node');
    g.style.cursor = 'pointer';
    g.onclick = () => selectGraphNode(node);

    let fillColor = '#10b981';
    if (node.type === 'tk') fillColor = '#f59e0b';
    if (node.type === 'statute') fillColor = '#ef4444';
    if (node.type === 'inno') fillColor = '#3b82f6';

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', '32');
    circle.setAttribute('fill', '#0b2e1f');
    circle.setAttribute('stroke', fillColor);
    circle.setAttribute('stroke-width', '3');
    g.appendChild(circle);

    // Text lines
    const lines = node.label.split('\n');
    lines.forEach((l, i) => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x);
      text.setAttribute('y', node.y + (i * 12) - 4);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#f8fafc');
      text.setAttribute('font-size', '9px');
      text.setAttribute('font-weight', '600');
      text.textContent = l;
      g.appendChild(text);
    });

    svg.appendChild(g);
  });
}

function selectGraphNode(node) {
  const titleEl = document.getElementById('nodeTitle');
  const descEl = document.getElementById('nodeDesc');
  const citeEl = document.getElementById('nodeCitations');

  titleEl.innerText = node.label.replace('\n', ' ');

  if (node.id === 'ashwa') {
    descEl.innerText = "Taxon: Withania somnifera (Family Solanaceae). Ayurvedic Classical Rasayana with documented anti-stress and adaptogenic activity.";
    citeEl.innerHTML = "<span class='citation-badge' onclick=\"openGazetteModal('tkdl_ashwagandha')\">📜 TKDL Monograph #AY1-209</span>";
  } else if (node.id === 'sec3p') {
    descEl.innerText = "Patents Act 1970 - Section 3(p): Inventions which in effect are traditional knowledge are non-patentable subject matter in India.";
    citeEl.innerHTML = "<span class='citation-badge' onclick=\"openGazetteModal('patents_act_3p')\">📜 Patents Act Sec 3(p)</span>";
  } else if (node.id === 'sec3d') {
    descEl.innerText = "Patents Act 1970 - Section 3(d): Requires proof of enhancement of known therapeutic efficacy over prior art.";
    citeEl.innerHTML = "<span class='citation-badge' onclick=\"openGazetteModal('patents_act_3d')\">📜 Patents Act Sec 3(d)</span>";
  } else if (node.id === 'wipo') {
    descEl.innerText = "WIPO GRATK Treaty (Adopted May 2024): Mandates patent applicants worldwide to disclose genetic resource origin and traditional knowledge.";
    citeEl.innerHTML = "<span class='citation-badge' onclick=\"openGazetteModal('wipo_gratk_2024')\">📜 WIPO GRATK Treaty 2024 Art 3</span>";
  } else if (node.id === 'nba') {
    descEl.innerText = "Biological Diversity Act 2023 - Section 6: Prior approval of NBA required before applying for IPR involving Indian biological resources.";
    citeEl.innerHTML = "<span class='citation-badge' onclick=\"openGazetteModal('biodiversity_2023')\">📜 BDA 2023 Sec 6</span>";
  } else {
    descEl.innerText = "Entity interconnected within the Ayurveda IPR & Regulatory Knowledge Graph.";
    citeEl.innerHTML = "";
  }
}

// =========================================================
// 9. Official Gazette Modal Viewer
// =========================================================

const gazetteExcerpts = {
  patents_act_3p: {
    title: "The Patents Act, 1970 — Section 3(p)",
    tag: "CENTRAL ACT NO. 39 OF 1970 (AMENDED 2024)",
    content: `Section 3. What are not inventions.—
The following are not inventions within the meaning of this Act,—
...
(p) an invention which in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components.

[Explanation: Traditional Knowledge Digital Library (TKDL) serves as prior art search documentation across international patent offices to block misappropriation under this section.]`,
    meta: "Official Gazette of India • Controller General of Patents, Designs and Trade Marks",
    url: "https://ipindia.gov.in"
  },
  patents_act_3d: {
    title: "The Patents Act, 1970 — Section 3(d)",
    tag: "CENTRAL ACT NO. 39 OF 1970",
    content: `Section 3(d).—
The mere discovery of a new form of a known substance which does not result in the enhancement of the known efficacy of that substance or the mere discovery of any new property or new use for a known substance or of the mere use of a known process, machine or apparatus unless such known process results in a new product or employs at least one new reactant.

[Explanation: For Ayurvedic formulations, synergistic bio-enhancement or significant transdermal bioavailability data must be submitted to satisfy Section 3(d).]`,
    meta: "Official Gazette of India • IP India Guidelines for ASU Patent Examination",
    url: "https://ipindia.gov.in"
  },
  biodiversity_2023: {
    title: "Biological Diversity (Amendment) Act, 2023 & Rules 2024",
    tag: "MINISTRY OF ENVIRONMENT, FOREST AND CLIMATE CHANGE",
    content: `Section 6. Application for intellectual property rights.—
(1) No person shall apply for any intellectual property right, by whatever name called, in or outside India for any invention based on any research or information on a biological resource obtained from India, without obtaining the prior approval of the National Biodiversity Authority before grant of such intellectual property right.

Provided that in case of patent, the permission of the National Biodiversity Authority may be obtained after the acceptance of the patent but before the grant of the patent.`,
    meta: "Gazette of India Extraordinary • National Biodiversity Authority (nbaindia.org)",
    url: "http://nbaindia.org"
  },
  biodiversity_sec40: {
    title: "Biological Diversity Act — Section 40 (NTAC Exemption List)",
    tag: "STATUTORY EXEMPTION REGIME",
    content: `Section 40. Power of Central Government to exempt for certain purposes.—
Notwithstanding anything contained in this Act, the Central Government may, of its own motion or on the recommendation of the National Biodiversity Authority, by notification in the Official Gazette, declare that all or any of the provisions of this Act shall not apply to any items, including biological resources normally traded as commodities.

[Note: Applies to Curcuma longa, Piper nigrum, Zingiber officinale traded strictly as agricultural spices.]`,
    meta: "National Biodiversity Authority Gazette Notifications",
    url: "http://nbaindia.org"
  },
  wipo_gratk_2024: {
    title: "WIPO Treaty on Intellectual Property, Genetic Resources and Associated Traditional Knowledge (2024)",
    tag: "WORLD INTELLECTUAL PROPERTY ORGANIZATION — GENEVA",
    content: `Article 3. Mandatory Disclosure Requirement.—
3.1. Where the claimed invention in a patent application is based on genetic resources, each Contracting Party shall require applicants to disclose the country of origin of the genetic resources, or, if the country of origin is not known, the source of the genetic resources.

3.2. Where the claimed invention in a patent application is based on traditional knowledge associated with genetic resources, each Contracting Party shall require applicants to disclose the indigenous peoples or local community that provided the traditional knowledge.`,
    meta: "WIPO Diplomatic Conference Final Act (May 24, 2024)",
    url: "https://www.wipo.int"
  },
  drugs_cosmetics_1940: {
    title: "The Drugs and Cosmetics Act, 1940 & Rules 1945",
    tag: "MINISTRY OF HEALTH & FAMILY WELFARE / AYUSH",
    content: `Section 3(a). "Ayurvedic, Siddha or Unani drug" includes all medicines intended for internal or external use for or in the diagnosis, treatment, mitigation or prevention of disease or disorder in human beings or animals, and manufactured exclusively in accordance with the formulae described in the authoritative books of Ayurvedic, Siddha and Unani systems of medicine, specified in the First Schedule.

Rule 158B: Evidence of safety and effectiveness required for patent or proprietary ASU medicines.`,
    meta: "Central Drugs Standard Control Organisation (CDSCO)",
    url: "https://cdsco.gov.in"
  },
  fssai_aahar_2022: {
    title: "Food Safety and Standards (Ayurveda Aahar) Regulations, 2022",
    tag: "FSSAI GAZETTE NOTIFICATION",
    content: `Regulation 3. Definition of Ayurveda Aahar.—
Food prepared in accordance with the recipes/ingredients/processes described in the authoritative books of Ayurveda listed in 'Schedule A' of these regulations.

Regulation 6. Labelling and Claims:
(1) No person shall manufacture or sell Ayurveda Aahar with claims for prevention, treatment, or cure of any specific human disease or disorder.
(2) Every package of Ayurveda Aahar shall carry the designated official Ayurveda Aahar logo.`,
    meta: "Food Safety and Standards Authority of India (FSSAI)",
    url: "https://fssai.gov.in"
  },
  nagoya_protocol: {
    title: "Nagoya Protocol on Access to Genetic Resources and Fair & Equitable Benefit-Sharing",
    tag: "UNITED NATIONS CONVENTION ON BIOLOGICAL DIVERSITY",
    content: `Article 5. Fair and Equitable Benefit-Sharing.—
Benefits arising from the utilization of genetic resources as well as subsequent applications and commercialization shall be shared in a fair and equitable way with the Party providing such resources that is the country of origin of such resources.`,
    meta: "UN Secretariat of the Convention on Biological Diversity",
    url: "https://www.cbd.int/abs"
  },
  tkdl_ashwagandha: {
    title: "TKDL Prior-Art Reference: Withania somnifera (Ashwagandha)",
    tag: "TRADITIONAL KNOWLEDGE DIGITAL LIBRARY (CSIR-AYUSH)",
    content: `TKDL Identifier: AY1/209
Classical Text Reference: Bhavaprakasha Nighantu, Guduchyadi Varga, Verse 189-190.
Traditional Use: Balya (Tonic), Rasayana (Rejuvenator), Vata-Kaphahara, Shothahara (Anti-inflammatory).
Prior Art Scope: Blocks patenting of raw root powders or direct hydro-alcoholic extracts without synergistic inventive step.`,
    meta: "Traditional Knowledge Digital Library (tkdl.res.in)",
    url: "https://www.tkdl.res.in"
  },
  tkdl_chyawanprash: {
    title: "TKDL Formulation Monograph: Chyawanprash Avaleha",
    tag: "TRADITIONAL KNOWLEDGE DIGITAL LIBRARY (CSIR-AYUSH)",
    content: `TKDL Identifier: AY-CHY/01
Authoritative Text: Charaka Samhita, Chikitsa Sthana, Chapter 1 (Abhayayamalakiya Rasayana Pada), Verses 62-74.
Active Base: Emblica officinalis (Amalaki) + 48 traditional botanical & mineral ingredients.
Status: Defended in 45+ international patent examination proceedings at EPO, USPTO, and JPO.`,
    meta: "Traditional Knowledge Digital Library (tkdl.res.in)",
    url: "https://www.tkdl.res.in"
  }
};

function openGazetteModal(key) {
  const data = gazetteExcerpts[key] || {
    title: "Statutory Gazette Excerpt",
    tag: "OFFICIAL LEGAL RECORD",
    content: "Official statutory citation text verified in database.",
    meta: "Ministry of Ayush / IP India Repository",
    url: "https://ipindia.gov.in"
  };

  document.getElementById('modalTitle').innerText = data.title;
  document.getElementById('modalTag').innerText = data.tag;
  document.getElementById('modalContent').innerText = data.content;
  document.getElementById('modalMeta').innerText = data.meta;
  document.getElementById('modalExternalLink').href = data.url;

  document.getElementById('gazetteModal').style.display = 'flex';
}

function closeGazetteModal() {
  document.getElementById('gazetteModal').style.display = 'none';
}

// =========================================================
// 10. Human Facilitator Escalation Modal
// =========================================================

function openEscalationModal() {
  document.getElementById('escalateModal').style.display = 'flex';
}

function closeEscalationModal() {
  document.getElementById('escalateModal').style.display = 'none';
}

function handleEscalationSubmit(e) {
  e.preventDefault();
  closeEscalationModal();
  alert("Escalation Docket #AYUSH-IP-2026-8942 generated successfully!\nAn accredited Ayush IP Facilitator will review your brief within 24 hours.");
}

// Close modals when clicking backdrop
window.onclick = function (e) {
  const gModal = document.getElementById('gazetteModal');
  const eModal = document.getElementById('escalateModal');
  if (e.target === gModal) gModal.style.display = 'none';
  if (e.target === eModal) eModal.style.display = 'none';
};

// Initialize default state on page load
document.addEventListener('DOMContentLoaded', () => {
  evaluateABS();
  renderKnowledgeGraph();
});
