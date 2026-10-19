import { ProductClassificationInput, ProductClassificationResult } from '../types';
import { DEMO_CLASSIFICATION_SAMPLE, DEMO_SOURCES } from '../data/demoData';

const IS_DEMO_MODE = true;

export const classificationService = {
  classifyProduct: async (input: ProductClassificationInput): Promise<ProductClassificationResult> => {
    if (IS_DEMO_MODE) {
      await new Promise(r => setTimeout(r, 600));

      const nameLower = (input.name + ' ' + input.purpose + ' ' + input.dosageForm).toLowerCase();

      if (nameLower.includes('cosmetic') || nameLower.includes('cream') || nameLower.includes('face') || nameLower.includes('oil') || nameLower.includes('shampoo')) {
        return {
          category: 'Ayurvedic Cosmetic',
          description: 'An Ayurvedic formulation manufactured with traditional herbs intended for cleansing, beautifying, promoting attractiveness, or altering appearance without therapeutic disease-curing claims.',
          ipConsiderations: [
            'Brand Trademark (Class 3) is primary asset.',
            'Novel cosmetic vehicle (e.g., non-greasy micro-emulsion) can be patented as a process/composition.',
            'Industrial design protection (Design Act 2000) for unique dispenser bottle.'
          ],
          regulatoryPathway: [
            'Manufacturing license under Part XVI of Drugs and Cosmetics Rules (Form 32).',
            'Must comply with IS standards for cosmetic products and heavy metal/microbial tolerances.',
            'No disease curing claims permissible under labeling laws.'
          ],
          traditionalKnowledgeScreening: 'Herbal ingredients must have documented cosmetic/skincare mentions in classical texts or API Vol I.',
          confidence: 'High',
          applicableSchedules: ['Part XVI, Drugs & Cosmetics Rules 1945', 'IS 4707 (Part 1 & 2)'],
          recommendedForms: ['Form 32 (Cosmetics License)', 'Schedule M-II compliance'],
          sources: [
            DEMO_SOURCES['dca-first-schedule'],
            DEMO_SOURCES['sec-3p-patents']
          ]
        };
      }

      if (nameLower.includes('aahar') || nameLower.includes('supplement') || nameLower.includes('tea') || nameLower.includes('kadha') || nameLower.includes('food')) {
        return {
          category: 'Ayurveda-Aahar (FSSAI/Ayush)',
          description: 'Food prepared in accordance with the recipes or processes or methods described in the authoritative books of Ayurveda, intended for health promotion and physiological balance.',
          ipConsiderations: [
            'Recipe cannot be patented per Section 3(p); Trademark (Class 29/30/32) is critical.',
            'Proprietary packaging or convenient ready-to-drink formulation technology can be protected.'
          ],
          regulatoryPathway: [
            'FSSAI Licensing under Food Safety and Standards (Ayurveda Aahar) Regulations, 2022.',
            'Mandatory display of the official "Ayurveda Aahar" logo on package front.',
            'Formulation must not contain synthetic vitamins, minerals, or isolated active molecules.'
          ],
          traditionalKnowledgeScreening: 'Must adhere strictly to authorized Ahara texts and raw material lists in FSSAI Schedule A.',
          confidence: 'High',
          applicableSchedules: ['FSSAI Ayurveda Aahar Regulations 2022', 'FSS Act 2006'],
          recommendedForms: ['FSSAI Form B License', 'Ayush Ahara Endorsement Certificate'],
          sources: [
            DEMO_SOURCES['dca-first-schedule'],
            DEMO_SOURCES['bda-sec40-2024']
          ]
        };
      }

      if (nameLower.includes('phytopharm') || nameLower.includes('extract') || nameLower.includes('fraction') || nameLower.includes('molecule')) {
        return {
          category: 'Phytopharmaceutical / New Botanical Drug',
          description: 'A purified and standardized fraction with defined minimum four bioactive marker compounds, assessed for safety and therapeutic efficacy through clinical trials.',
          ipConsiderations: [
            'Strongest potential for composition of matter and method-of-use patents in India (overcoming 3(p) via purification characterization) and globally.',
            'Eligible for 20-year patent protection under Patents Act 1970.'
          ],
          regulatoryPathway: [
            'Central Drugs Standard Control Organisation (CDSCO) approval under New Drugs and Clinical Trials Rules (NDCT 2019).',
            'Mandatory Phase I-III clinical trials and toxicity profiling.',
            'Must contain minimum 4 bioactive markers quantified by validated HPLC/LC-MS methods.'
          ],
          traditionalKnowledgeScreening: 'Traditional origin acknowledged, but novel isolation/fractionation overcomes pure TK exclusion.',
          confidence: 'High',
          applicableSchedules: ['Rule 122E / NDCT Rules 2019', 'Schedule Y (Toxicity)'],
          recommendedForms: ['Form CT-04 (Clinical Trial)', 'Form CT-23 (Import/Manufacture New Drug)'],
          sources: [
            DEMO_SOURCES['sec-3p-patents'],
            DEMO_SOURCES['sec-3e-patents'],
            DEMO_SOURCES['us-fda-botanicals']
          ]
        };
      }

      // Default: Patent & Proprietary Medicine
      return DEMO_CLASSIFICATION_SAMPLE;
    }

    const res = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    return res.json();
  }
};
