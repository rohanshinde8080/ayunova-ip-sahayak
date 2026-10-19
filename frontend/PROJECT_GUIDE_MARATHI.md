# 🌿 IP-SAKTI Sahayak — संपूर्ण प्रोजेक्ट मार्गदर्शक व वर्किंग फ्लो
**Smart India Hackathon 2026 | Problem Statement: PS SIH26045 | Ministry of Ayush & AIIA**

---

## 📌 १. या प्रोजेक्टचे मुख्य उद्दिष्ट काय आहे? (Problem Statement)
आयुर्वेदिक औषधे, फॉर्म्युलेशन्स आणि वनौषधींवर आधारित उत्पादनांना पेटंट (Patent), ट्रेडमार्क (Trademark) आणि नियामक परवाने (Regulatory Licenses - FDA/Ayush) मिळवताना भारतीय संशोधकांना अनेक अडचणी येतात:
1. **Section 3(p) Patent Bar:** पारंपारिक ज्ञान (Traditional Knowledge / TKDL) असलेल्या औषधांना भारतात थेट पेटंट मिळत नाही.
2. **Section 3(e) Synergism:** घटकांचे मिश्रण असल्यास त्यामध्ये विशेष 'सिनर्जिस्टिक प्रभाव' सिद्ध करावा लागतो.
3. **Biological Diversity Act (BDA):** भारतीय वनस्पती वापरल्यास राष्ट्रीय जैवविविधता प्राधिकरण (NBA - Form III) ची परवानगी बंधनकारक असते.
4. **WIPO GRATK Treaty (2024) & US FDA Export:** जागतिक निर्यातीसाठी पारंपारिक ज्ञानाचे डिस्क्लोजर आणि FDA Botanical Drug Guidance चे नियम पाळावे लागतात.

👉 **IP-SAKTI Sahayak** हे एक प्रगत **AI Copilot (RAG Assistant)** आहे, जे आयुर्वेदिक इनोव्हेटर्सना प्रत्येक कायद्यानुसार अधिकृत सरकारी राजपत्रांच्या (Official Gazettes) संदर्भासह अचूक मार्गदर्शन करते.

---

## 🛠️ २. आम्ही या प्रोजेक्टमध्ये काय काय बनवले आहे? (Architecture)
* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS (Ayush Emerald & Gold Theme), Lucide Icons.
* **Architecture:** API-Ready Service Layer (`src/services/`) — हे सध्या Demo/Mock मोडमध्ये वेगाने काम करते आणि भविष्यात थेट Python FastAPI बॅकएंडशी जोडता येते.
* **Zero Hallucination RAG Grounding:** प्रत्येक उत्तरासोबत थेट सरकारी कायद्याचे (Section 3(p), Section 40 BDA, Rule 158B, WIPO Treaty) कलम आणि मूळ राजपत्र दाखवणारी सिस्टीम.

---

## 🚀 ३. प्रत्येक Feature चा उपयोग आणि कशाने काय होते? (Feature-by-Feature Guide)

### 🔹 १. Login Page (प्रवेश)
* **काय आहे:** एक सुंदर सरकारी HealthTech लॉगिन पेज.
* **काय होते:** 
  * तुम्ही `demo@ipsakti.ai` / `demo123` ने लॉगिन करू शकता.
  * किंवा **"Continue in Demo Mode"** वर १-क्लिक करून थेट आत जाऊ शकता (परीक्षकांना पासवर्ड विचारण्याची गरज नाही).
  * `admin@ipsakti.ai` / `admin123` टाकल्यास ॲडमिन कन्सोल उघडतो.

---

### 🔹 २. Dashboard & 5-Minute Demo Mode (मुख्य डॅशबोर्ड)
* **काय आहे:** ॲपचे मुख्य होमपेज, जिथून सर्व मॉड्यूल्स सुरू होतात.
* **काय होते:**
  * **[START 5-MIN DEMO] बटण:** यावर क्लिक करताच त्रिफळा (Triphala) फॉर्म्युलेशनचा १-२ सेकंदांचा RAG प्रोसेसिंग फ्लो सुरू होतो आणि थेट AI Assistant उघडतो.
  * **Ask IP-SAKTI Hero Card:** येथे युझर आपला प्रश्न टाईप करू शकतो किंवा खाली दिलेल्या Quick Chips (उदा. Triphala Patent, Brand Exclusivity, Low-Confidence Demo) वर क्लिक करू शकतो.
  * **Quick Navigation Cards:** ६ मुख्य मॉड्यूल्समध्ये १-क्लिकने जाण्यासाठी शॉर्टकट कार्ड्स.
  * **Recent Grounded Inquiries:** नुकत्याच विचारलेल्या प्रश्नांची यादी.

---

### 🔹 ३. AI Assistant (RAG आधारित कायदेशीर सल्लागार)
* **काय आहे:** ChatGPT सारखा ३-कॉलमचा प्रगत इंटरफेस.
* **कॉलम १ (डावीकडे - Threads):** सेव्ह केलेले चॅट सेशन्स आणि प्रसेट डेमो प्रॉम्प्ट्स.
* **कॉलम २ (मध्यभागी - Chat):**
  * प्रश्न विचारल्यावर **१-२ सेकंदांचा RAG Pipeline** दिसतो:
    1. ✓ Language detected: English / Marathi / Hindi
    2. ✓ Jurisdiction detected: India
    3. ✓ Product classified: Ayurvedic formulation
    4. ✓ Relevant knowledge retrieved (TKDL, Patents Act, DCA, BDA)
    5. ✓ Evidence evaluated & Confidence scored
    6. ✓ Answer generated & Citations verified
  * **Structured AI Answer मिळतो:**
    * 🧠 **Assessment:** पारंपारिक ज्ञान आणि पेटंट पात्रतेचे प्राथमिक विश्लेषण.
    * 📌 **Key IP Considerations:** Section 3(p) TK बार, Section 3(e) सिनर्जिस्टिक डेटा, प्रोसेस पेटंट्स.
    * 📋 **Regulatory Pathways:** Rule 158B, Form 25D, Schedule T GMP.
    * ⚠️ **Risks & Limitations:** कायदेशीर मर्यादा आणि सावधगिरीच्या सूचना.
    * 🚀 **Recommended Next Steps:** १, २, ३, ४ अशा पायऱ्या.
  * **Bhashini Voice Input:** माईक चिन्हावर क्लिक केल्यास व्हॉइस इनपुट सिम्युलेट होते.
* **कॉलम ३ (उजवीकडे - Evidence & Sources Panel):**
  * उत्तरामध्ये वापरलेल्या सर्व अधिकृत सरकारी राजपत्रांची कार्डे दिसतात (उदा. Section 3(p), Section 3(e), BDA Section 40, Rule 158B).
  * **Evidence Confidence (High/Medium/Low):** विश्वासाची पातळी दाखवतो.

---

### 🔹 ४. Official Gazette Modal Drawer (अधिकृत राजपत्र दर्शक)
* **काय आहे:** चॅटमधील किंवा कार्डवरील कोणत्याही **Source Citation Badge** वर क्लिक केल्यावर उघडणारी खिडकी.
* **काय होते:**
  * भारताच्या **Patents Act 1970**, **Biological Diversity Act 2023**, किंवा **WIPO GRATK 2024** मधील मूळ कायद्याचा **खराखुरा परिच्छेद (Gazette Excerpt)** स्क्रिनवर दिसतो.
  * परीक्षकांना सिद्ध होते की AI हवेत उत्तर देत नसून अधिकृत कायद्यावर आधारित आहे.

---

### 🔹 ५. Product Classification Engine (उत्पादन वर्गीकरण विझार्ड)
* **काय आहे:** उत्पादनाची माहिती भरून ते नेमके कोणत्या सरकारी कॅटेगरीत येते हे सांगणारा फॉर्म.
* **कसं वापरायचं:**
  * फॉर्म्युलेशनचे नाव, घटक (उदा. Amalaki, Haritaki), उपयोग, डोस फॉर्म (Tablet, Oil, Capsule), आणि देश निवडा.
  * किंवा वरील **Presets (Triphala Tablet / Curcumin Phytosome / Kumkumadi Oil / Immuno Kadha)** वर क्लिक करा.
  * **[Classify Product]** वर क्लिक करा.
* **काय आउटपुट मिळते:**
  * उत्पादन **Classical Medicine**, **Patent & Proprietary (P&P)**, **Phytopharmaceutical Drug**, **Ayurveda-Aahar (FSSAI)**, की **Ayurvedic Cosmetic** आहे याचा निर्णय.
  * त्यासाठी लागणारे अर्ज फॉर्म (Form 25D, Form 32, Form B) आणि परवाना मार्ग.
  * **[Download Classification Dossier]** ने रिपोर्ट डाऊनलोड करता येतो.

---

### 🔹 ६. IP Protection Advisor & Prior Art Similarity (पेटंट व साम्य तपासणी)
* **काय आहे:** ३-स्टेप्सचा विझार्ड जो पेटंट, ट्रेडमार्क आणि ट्रेड सिक्रेटचे मार्ग सुचवतो व जुन्या पेटंट्सशी साम्य (Similarity %) तपासतो.
* **कसं चालतं:**
  * **Step 1:** इनोव्हेशनचे वर्णन.
  * **Step 2:** यामध्ये काय नवीन (Novel) शोध लावला आहे ते सांगणे.
  * **Step 3:** AI रणनीती तयार करतो:
    * **Patent Route:** प्रोसेस किंवा सिनर्जिस्टिक रेशो पेटंट.
    * **Trademark Route:** ब्रँड आणि क्लास ५/३ अंतर्गत ट्रेडमार्क.
    * **Trade Secret Route:** गुप्त एक्स्ट्रॅक्शन फॉर्म्युला.
    * **Prior Art Similarity Scores:** TKDL आणि पेटंट जर्नल्सशी साम्य दाखवणारे स्कोर (**८७% Classical Match**, **७२% Ratio Match**, **६४% USPTO Match**).

---

### 🔹 ७. Traditional Knowledge & ABS Biodiversity Calculator (जैवविविधता कॅल्क्युलेटर)
* **काय आहे:** भारतीय औषधी वनस्पती वापरताना कायद्यानुसार काय परवानग्या लागतात हे तपासण्याचे टूल.
* **कसं चालतं:**
  1. वनस्पती निवडा (उदा. Ashwagandha, Haridra/Turmeric, Sarpagandha, Triphala).
  2. संस्था प्रकार निवडा (भारतीय नागरिक/कंपनी की विदेशी कंपनी).
  3. काम निवडा (व्यावसायिक उत्पादन, पेटंट अर्ज, किंवा कच्चा माल निर्यात).
* **काय आउटपुट मिळते:**
  * **Section 40 NTAC Exemption:** शेतमालाप्रमाणे खरेदी केल्यास सूट आहे का?
  * **Section 3 / NBA Approval:** परदेशी कंपन्यांसाठी NBA चे **Form I** बंधनकारक आहे का?
  * **Section 6 / Form III:** पेटंट मिळवण्यापूर्वी NBA ची मंजुरी का आवश्यक आहे?
  * **Section 7 SBB Intimation:** राज्य जैवविविधता मंडळाला सूचना देणे.

---

### 🔹 ८. India vs International Comparison Matrix (देशांची तुलना)
* **काय आहे:** भारत, अमेरिका (USA), युरोप (EU), जपान (Japan) आणि जागतिक WIPO नियमांची तुलना करणारा तक्ता.
* **काय होते:**
  * वरून कोणतेही दोन देश निवडा (उदा. 🇮🇳 India vs 🇺🇸 USA).
  * भारताचा **Section 3(p) TK Bar** विरुद्ध अमेरिकेचा **35 U.S.C. 101 Natural Product Bar**.
  * भारताचा **Ayush Form 25D** मार्ग विरुद्ध अमेरिकेचा **FDA DSHEA (Dietary Supplement) / Botanical Drug (CDER)** मार्ग.
  * औषधातील जड धातू (Heavy Metals) आणि जपानचा Positive List System यांची तुलना.

---

### 🔹 ९. Compliance Checklist (परवाना पूर्तता चेकलिस्ट)
* **काय आहे:** उत्पादनाला बाजारात आणण्यापूर्वी १० महत्त्वाच्या कायदेशीर पायऱ्या तपासण्याची चेकलिस्ट.
* **काय होते:**
  * चेकलिस्ट आयटम्सवर (उदा. Schedule T GMP, TKDL Screening, Heavy Metals CoA, NBA Form III) क्लिक करून टिक करा.
  * वरचा **Progress Bar (उदा. ६०% $\rightarrow$ ८०% $\rightarrow$ १००%)** आपोआप लाईव्ह अपडेट होतो.
  * **[Export Audit Dossier]** ने प्रोग्रेस रिपोर्ट एक्सपोर्ट करता येतो.

---

### 🔹 १०. Document Analyzer (दस्तऐवज विश्लेषक)
* **काय आहे:** रिसर्च पेपर किंवा फॉर्म्युलेशन डॉक्युमेंट (PDF/DOCX) टाकून तपासणी करणारे टूल.
* **कसं चालतं:**
  * **[Use Sample Document (Triphala_v2.pdf)]** बटणावर क्लिक करा.
  * AI डॉक्युमेंट स्कॅन करून:
    1. वनस्पती घटक व सोल्व्हंट्स (Supercritical CO2) शोधून काढतो.
    2. Section 3(p) आणि Section 3(e) च्या दृष्टीने कायदेशीर विश्लेषण देतो.
    3. **Missing Gaps:** फाईलमध्ये कोणत्या चाचण्यांचे अहवाल गहाळ आहेत (उदा. Heavy Metals Lead/Arsenic CoA किंवा कच्च्या मालाचा जिल्हा) हे शोधून दाखवतो.

---

### 🔹 ११. Query History (इतिहास व DPDP ऑडिट)
* **काय आहे:** युझरने आजवर विचारलेले सर्व प्रश्न आणि विश्लेषणांचा सेव्ह केलेला रेकॉर्ड.
* **काय होते:**
  * कोणताही प्रश्न सर्च करू शकता.
  * **[Re-open in Assistant]** वर क्लिक केल्यास तो जुना प्रश्न लगेच AI Assistant मध्ये पुन्हा उघडतो.

---

### 🔹 १२. Admin & Knowledge Base Console (ॲडमिन कन्सोल)
* **काय आहे:** ॲडमिन आणि Ayush IPR सेलसाठीचा कंट्रोल पॅनेल.
* **काय होते:**
  * जोडलेल्या ६ मुख्य कायद्यांचे (Patents Act, BDA, DCA, WIPO, API) ९,६३० चंक्सचे स्टेटस पाहता येते.
  * **[Re-index Knowledge Base]** बटणावर क्लिक केल्यास ४-स्टेप्सची वेक्टर एम्बेडिंग सिस्टीम लाईव्ह सिम्युलेट होते.

---

### 🔹 १३. Smart Human IP Facilitator Escalation (तज्ज्ञ मदत)
* **काय आहे:** जर एखाद्या प्रश्नात पारंपारिक पुरावा कमी असेल किंवा गुंतागुंतीचे रासायनिक घटक असतील, तर मानवी वकिलाकडे पाठवण्याची सोय.
* **काय होते:**
  * **[Request Ayush Expert Review]** वर क्लिक केल्यावर फॉर्म उघडतो.
  * सबमिट केल्यावर **Reference No. #IP-2026-1042** मिळतो आणि विनंती ॲडमिन रिव्ह्यू रांगेत जाते.

---

## 🎯 ४. हॅकाथॉन परीक्षकांसमोर ५ मिनिटांत कसे सादर करावे? (Judge Demo Flow)

1. **पहिले ३० सेकंद:** लॉगिन पेजवर **"Continue in Demo Mode"** दाबा. सांगा: *"आम्ही SIH PS 26045 साठी Ayurveda IP & Regulatory Copilot बनवला आहे."*
2. **१ मिनिट:** डॅशबोर्डवर **"START 5-MIN DEMO"** हिरव्या बटणावर दाबा. १-२ सेकंदात येणारा **RAG Pipeline**, **Assessment**, **Section 3(p) TK Rules**, आणि **AFI Licensing Pathway** दाखवा.
3. **२ मिनिट:** उजव्या पॅनेलमध्ये **Section 3(p)** च्या बॅजवर क्लिक करून **Official Gazette Modal** दाखवा (Zero Hallucination).
4. **३ मिनिट:** **Product Classification** उघडून 'Kumkumadi Oil' चे वर्गीकरण दाखवा. त्यानंतर **IP Protection Advisor** मधील **८७%, ७२%, ६४% Prior Art Similarity Scores** दाखवा.
5. **४ मिनिट:** **Traditional Knowledge & ABS** मधील **Biodiversity Calculator** मध्ये Ashwagandha vs Sarpagandha निवडून **Section 40 NTAC** व **Form III** दाखवा.
6. **५ मिनिट:** **Compliance Checklist** टिक करून प्रोग्रेस बार दाखवा, **Document Analyzer** चा सॅम्पल रिपोर्ट दाखवा, आणि चॅटमधील **Low-Confidence Demo** वरून **Expert Escalation (#IP-2026-1042)** दाखवून प्रेझेंटेशन संपवा.

---
*हे प्रोजेक्ट सध्या `http://localhost:5173/` वर लाईव्ह चालू आहे.*
