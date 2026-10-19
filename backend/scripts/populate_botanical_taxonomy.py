"""
Database Migration: Populate Authoritative Botanical Taxonomy into PostgreSQL ayurveda_knowledge.doc_metadata
Seeds peer-reviewed taxonomic ranks (Kingdom, Division, Class, Order, Family, Genus, Species, Binomial Name, Vernacular Names, Morphology, Authorities)
directly into Neon PostgreSQL ayurveda_knowledge table.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal
from app.models.db_models import AyurvedaKnowledge

TAXONOMY_MAP = {
    "ayur-ashwagandha": {
        "kingdom": "Plantae (Plants)",
        "subkingdom": "Tracheobionta (Vascular plants)",
        "superdivision": "Spermatophyta (Seed plants)",
        "division": "Magnoliophyta (Flowering plants / Angiosperms)",
        "class": "Magnoliopsida (Dicotyledons)",
        "subclass": "Asteridae",
        "order": "Solanales",
        "family": "Solanaceae (Nightshade / Potato family)",
        "genus": "Withania Pauquy",
        "species": "Withania somnifera (L.) Dunal",
        "binomial_name": "Withania somnifera (L.) Dunal",
        "authority": "(L.) Dunal",
        "synonyms": ["Physalis somnifera L.", "Physalis flexuosa L."],
        "vernacular_names": {
            "Sanskrit": "Aśvagandhā, Hayagandhā, Vājinī",
            "Hindi": "Ashwagandha, Asgandh",
            "English": "Indian Ginseng, Winter Cherry",
            "Tamil": "Amukkuram",
            "Telugu": "Pennerugadda",
            "Bengali": "Ashvagandha",
            "Marathi": "Asgandha"
        },
        "habit": "Perennial erect tomentose evergreen shrub (30–150 cm in height)",
        "morphology": "Branches round, densely clothed with whitish or silver-grey stellate tomentum. Leaves simple, alternate or sub-opposite, ovate, 5–10 cm long, entire margin. Flowers greenish or dull yellow, bisexual, bell-shaped in axillary cymes. Fruit globose berry, bright orange-red when ripe, enclosed in an inflated, accrescent papery calyx. Seeds reniform, flat, yellow-brown.",
        "parts_used": "Roots (Ashwagandha Mula), leaves, and seeds",
        "habitat_distribution": "Drier sub-tropical regions of India (Rajasthan, Gujarat, MP, Punjab, UP) and Mediterranean to South Asia",
        "official_sources": [
            "Ayurvedic Pharmacopoeia of India (API Part I, Vol. I, Monograph 10: Asvagandha, pp. 19-20)",
            "Botanical Survey of India (BSI) Flora of India",
            "Kew Royal Botanic Gardens — Plants of the World Online (POWO ID: urn:lsid:ipni.org:names:821639-1)"
        ]
    },
    "ayur-curcumin": {
        "kingdom": "Plantae (Plants)",
        "subkingdom": "Tracheobionta (Vascular plants)",
        "superdivision": "Spermatophyta (Seed plants)",
        "division": "Magnoliophyta (Flowering plants / Angiosperms)",
        "class": "Liliopsida (Monocotyledons)",
        "subclass": "Zingiberidae",
        "order": "Zingiberales",
        "family": "Zingiberaceae (Ginger family)",
        "genus": "Curcuma L.",
        "species": "Curcuma longa L.",
        "binomial_name": "Curcuma longa L.",
        "authority": "L.",
        "synonyms": ["Curcuma domestica Valeton", "Amomum curcuma Jacq."],
        "vernacular_names": {
            "Sanskrit": "Haridrā, Niśā, Kāñcanī, Gauri",
            "Hindi": "Haldi",
            "English": "Turmeric",
            "Tamil": "Manjal",
            "Telugu": "Pasupu",
            "Bengali": "Halud"
        },
        "habit": "Perennial herbaceous plant with extensive aromatic rhizomes (up to 1 m tall)",
        "morphology": "Tufted leaves with long petioles, oblong-lanceolate, up to 1 meter in length. Inflorescence a spike with pale yellow flowers nestled in green and pink bracts. Underground rhizome ovate, pyriform, multi-branched with brilliant deep orange-yellow interior and warm aromatic scent.",
        "parts_used": "Cured and dried rhizome (Haridra)",
        "habitat_distribution": "Cultivated extensively throughout tropical India (Telangana, Andhra Pradesh, Tamil Nadu, Kerala, Odisha)",
        "official_sources": [
            "Ayurvedic Pharmacopoeia of India (API Part I, Vol. I, Monograph 23: Haridra, pp. 45-46)",
            "Botanical Survey of India (BSI) Flora of India",
            "Kew Royal Botanic Gardens — Plants of the World Online (POWO ID: urn:lsid:ipni.org:names:796451-1)"
        ]
    },
    "ayur-neem": {
        "kingdom": "Plantae (Plants)",
        "subkingdom": "Tracheobionta (Vascular plants)",
        "superdivision": "Spermatophyta (Seed plants)",
        "division": "Magnoliophyta (Flowering plants / Angiosperms)",
        "class": "Magnoliopsida (Dicotyledons)",
        "subclass": "Rosidae",
        "order": "Sapindales",
        "family": "Meliaceae (Mahogany family)",
        "genus": "Azadirachta A.Juss.",
        "species": "Azadirachta indica A.Juss.",
        "binomial_name": "Azadirachta indica A.Juss.",
        "authority": "A.Juss.",
        "synonyms": ["Melia azadirachta L."],
        "vernacular_names": {
            "Sanskrit": "Nimba, Ariṣṭa, Picumarda",
            "Hindi": "Neem",
            "English": "Neem Tree, Margosa Tree",
            "Tamil": "Vembu",
            "Telugu": "Vepa"
        },
        "habit": "Medium to large evergreen tree (15–20 m in height)",
        "morphology": "Dense spreading crown, dark brown deeply fissured bark. Imparipinnate compound leaves with 9–17 lanceolate, falcate serrate leaflets. Flowers small, white, fragrant in axillary panicles. Fruit a smooth ellipsoidal drupe, yellow-green when ripe with a single seed.",
        "parts_used": "Stem bark, leaves, flowers, seeds, and seed oil",
        "habitat_distribution": "Throughout India in deciduous and semi-arid zones",
        "official_sources": [
            "Ayurvedic Pharmacopoeia of India (API Part I, Vol. II, Monograph 51: Nimba, pp. 115-116)",
            "Botanical Survey of India (BSI) Flora of India",
            "Kew Royal Botanic Gardens — Plants of the World Online (POWO ID: urn:lsid:ipni.org:names:577909-1)"
        ]
    },
    "ayur-tulsi": {
        "kingdom": "Plantae (Plants)",
        "subkingdom": "Tracheobionta (Vascular plants)",
        "superdivision": "Spermatophyta (Seed plants)",
        "division": "Magnoliophyta (Flowering plants / Angiosperms)",
        "class": "Magnoliopsida (Dicotyledons)",
        "subclass": "Asteridae",
        "order": "Lamiales",
        "family": "Lamiaceae (Mint family)",
        "genus": "Ocimum L.",
        "species": "Ocimum tenuiflorum L. (syn. Ocimum sanctum L.)",
        "binomial_name": "Ocimum tenuiflorum L.",
        "authority": "L.",
        "synonyms": ["Ocimum sanctum L.", "Ocimum monachorum L."],
        "vernacular_names": {
            "Sanskrit": "Tulasī, Surasā, Viṣṇupriyā",
            "Hindi": "Tulsi",
            "English": "Holy Basil, Sacred Basil",
            "Tamil": "Thulasi",
            "Telugu": "Tulasi"
        },
        "habit": "Erect aromatic branched herbaceous sub-shrub (30–75 cm in height)",
        "morphology": "Square stems with hairy pubescence, simple elliptic-oblong serrate leaves (green in Sri Tulsi, dark purple in Krishna Tulsi) rich in aromatic essential oils. Flowers purplish-pink in terminal verticillasters. Nutlets subglobose, brown.",
        "parts_used": "Leaves, aerial parts, and seeds",
        "habitat_distribution": "Indigenous to India, cultivated across all states and temples",
        "official_sources": [
            "Ayurvedic Pharmacopoeia of India (API Part I, Vol. II, Monograph 73: Tulasi, pp. 157-158)",
            "Botanical Survey of India (BSI) Flora of India",
            "Kew Royal Botanic Gardens — Plants of the World Online (POWO ID: urn:lsid:ipni.org:names:452654-1)"
        ]
    },
    "ayur-brahmi": {
        "kingdom": "Plantae (Plants)",
        "subkingdom": "Tracheobionta (Vascular plants)",
        "superdivision": "Spermatophyta (Seed plants)",
        "division": "Magnoliophyta (Flowering plants / Angiosperms)",
        "class": "Magnoliopsida (Dicotyledons)",
        "subclass": "Asteridae",
        "order": "Lamiales",
        "family": "Plantaginaceae (Plantain family; historically Scrophulariaceae)",
        "genus": "Bacopa Aubl.",
        "species": "Bacopa monnieri (L.) Wettst.",
        "binomial_name": "Bacopa monnieri (L.) Wettst.",
        "authority": "(L.) Wettst.",
        "synonyms": ["Lysimachia monnieri L.", "Herpestis monniera (L.) Kunth"],
        "vernacular_names": {
            "Sanskrit": "Brāhmī, Sarasvatī, Medhyā",
            "Hindi": "Brahmi, Jalnim",
            "English": "Water Hyssop, Herb of Grace",
            "Tamil": "Brahmi",
            "Telugu": "Sambarenu"
        },
        "habit": "Prostrate creeping succulent perennial marsh herb",
        "morphology": "Rooting at nodes with fleshy oblanceolate or spatulate sessile leaves (6–15 mm long). Flowers small, solitary, axillary, pale white or bluish-purple, 5-lobed. Fruit an ovoid capsule.",
        "parts_used": "Whole plant (Panchanga)",
        "habitat_distribution": "Wetlands, stream banks, and marshy habitats throughout India",
        "official_sources": [
            "Ayurvedic Pharmacopoeia of India (API Part I, Vol. II, Monograph 12: Brahmi, pp. 25-27)",
            "Botanical Survey of India (BSI) Flora of India",
            "Kew Royal Botanic Gardens — Plants of the World Online (POWO ID: urn:lsid:ipni.org:names:804595-1)"
        ]
    },
    "ayur-giloy": {
        "kingdom": "Plantae (Plants)",
        "subkingdom": "Tracheobionta (Vascular plants)",
        "superdivision": "Spermatophyta (Seed plants)",
        "division": "Magnoliophyta (Flowering plants / Angiosperms)",
        "class": "Magnoliopsida (Dicotyledons)",
        "subclass": "Ranunculidae",
        "order": "Ranunculales",
        "family": "Menispermaceae (Moonseed family)",
        "genus": "Tinospora Miers",
        "species": "Tinospora cordifolia (Willd.) Miers",
        "binomial_name": "Tinospora cordifolia (Willd.) Miers",
        "authority": "(Willd.) Miers",
        "synonyms": ["Menispermum cordifolium Willd."],
        "vernacular_names": {
            "Sanskrit": "Guḍūcī, Amṛtā, Chhinnaruhā",
            "Hindi": "Giloy, Guduchi",
            "English": "Heart-leaved Moonseed, Tinospora",
            "Tamil": "Seenthil",
            "Telugu": "Tippatiga"
        },
        "habit": "Large glabrous deciduous climbing woody shrub",
        "morphology": "Succulent stems with corky grooved bark and prominent rosette lenticels; produces filiform aerial roots. Leaves membranous, cordate (heart-shaped), 7-nerved at base. Flowers unisexual, yellowish-green in axillary racemes. Fruit drupelet, bright red when ripe.",
        "parts_used": "Dried stem (Guduchi Kanda) and water-extract starch (Guduchi Satva)",
        "habitat_distribution": "Tropical deciduous forests across India ascending to 300 m",
        "official_sources": [
            "Ayurvedic Pharmacopoeia of India (API Part I, Vol. I, Monograph 19: Guduchi, pp. 41-42)",
            "Botanical Survey of India (BSI) Flora of India",
            "Kew Royal Botanic Gardens — Plants of the World Online (POWO ID: urn:lsid:ipni.org:names:584347-1)"
        ]
    },
    "ayur-ginger": {
        "kingdom": "Plantae (Plants)",
        "subkingdom": "Tracheobionta (Vascular plants)",
        "superdivision": "Spermatophyta (Seed plants)",
        "division": "Magnoliophyta (Flowering plants / Angiosperms)",
        "class": "Liliopsida (Monocotyledons)",
        "subclass": "Zingiberidae",
        "order": "Zingiberales",
        "family": "Zingiberaceae (Ginger family)",
        "genus": "Zingiber Mill.",
        "species": "Zingiber officinale Roscoe",
        "binomial_name": "Zingiber officinale Roscoe",
        "authority": "Roscoe",
        "synonyms": ["Amomum zingiber L."],
        "vernacular_names": {
            "Sanskrit": "Śuṇṭhī, Ārdraka, Nāgara, Viśvabheṣaja",
            "Hindi": "Sonth, Adrak",
            "English": "Ginger",
            "Tamil": "Sukku, Inji",
            "Telugu": "Sonthi, Allam"
        },
        "habit": "Erect perennial herb with thick tuberous aromatic rhizomes (up to 1 m)",
        "morphology": "Pseudostems formed from leaf sheaths, distichous lanceolate leaves (15–20 cm long). Inflorescence spike dense with greenish-yellow flowers. Rhizome stout, laterally compressed, lobed/palmate, pale yellow to buff interior with fibrous spicy pungency.",
        "parts_used": "Dried rhizome (Shunthi) and fresh rhizome (Ardraka)",
        "habitat_distribution": "Extensively cultivated in Kerala, Karnataka, Meghalaya, West Bengal",
        "official_sources": [
            "Ayurvedic Pharmacopoeia of India (API Part I, Vol. I, Monograph 51: Sunthi, pp. 103-104)",
            "Botanical Survey of India (BSI) Flora of India",
            "Kew Royal Botanic Gardens — Plants of the World Online (POWO ID: urn:lsid:ipni.org:names:798380-1)"
        ]
    },
    "ayur-piperine": {
        "kingdom": "Plantae (Plants)",
        "subkingdom": "Tracheobionta (Vascular plants)",
        "superdivision": "Spermatophyta (Seed plants)",
        "division": "Magnoliophyta (Flowering plants / Angiosperms)",
        "class": "Magnoliopsida (Magnoliids)",
        "subclass": "Magnoliidae",
        "order": "Piperales",
        "family": "Piperaceae (Pepper family)",
        "genus": "Piper L.",
        "species": "Piper nigrum L.",
        "binomial_name": "Piper nigrum L.",
        "authority": "L.",
        "synonyms": ["Piper trioicum Roxb."],
        "vernacular_names": {
            "Sanskrit": "Marica, Ūṣaṇa, Kṛṣṇa",
            "Hindi": "Kali Mirch",
            "English": "Black Pepper",
            "Tamil": "Milagu",
            "Telugu": "Miriyalu"
        },
        "habit": "Perennial woody evergreen climbing vine (liana) growing up to 10 m on host trees",
        "morphology": "Climbs via adventitious clinging roots at swollen nodes. Leaves simple, coriaceous, dark shiny green, broadly ovate, 8–15 cm long. Spicate inflorescence pendulous (5–15 cm). Fruits globose sessile berries (drupes) turning dull red when ripe; dried unripe berries form black wrinkled peppercorns containing piperine.",
        "parts_used": "Dried mature unripe fruits (Maricha)",
        "habitat_distribution": "Western Ghats evergreen forests, Kerala, Karnataka, Tamil Nadu",
        "official_sources": [
            "Ayurvedic Pharmacopoeia of India (API Part I, Vol. III, Monograph 35: Marica, pp. 115-117)",
            "Botanical Survey of India (BSI) Flora of India",
            "Kew Royal Botanic Gardens — Plants of the World Online (POWO ID: urn:lsid:ipni.org:names:682496-1)"
        ]
    },
    "ayur-shatavari": {
        "kingdom": "Plantae (Plants)",
        "subkingdom": "Tracheobionta (Vascular plants)",
        "superdivision": "Spermatophyta (Seed plants)",
        "division": "Magnoliophyta (Flowering plants / Angiosperms)",
        "class": "Liliopsida (Monocotyledons)",
        "subclass": "Liliidae",
        "order": "Asparagales",
        "family": "Asparagaceae (Asparagus family)",
        "genus": "Asparagus L.",
        "species": "Asparagus racemosus Willd.",
        "binomial_name": "Asparagus racemosus Willd.",
        "authority": "Willd.",
        "synonyms": ["Asparagus sarmentosus L."],
        "vernacular_names": {
            "Sanskrit": "Śatāvarī, Bahusutā, Abhiru",
            "Hindi": "Shatavari, Satavar",
            "English": "Indian Asparagus, Wild Asparagus",
            "Tamil": "Thanneervittan",
            "Telugu": "Pillipechara"
        },
        "habit": "Scrambling or climbing woody spiny undershrub (1–2 m)",
        "morphology": "Stems woody, thorny with recurved spines; cladodes (needle-like branchlets) clustered in groups of 2–6. Flowers small, white, fragrant in simple or branched racemes. Tuberous roots succulent, clustered/fascicled, spindle-shaped, tapering at both ends, ivory-white.",
        "parts_used": "Tuberous roots (Shatavari Mula)",
        "habitat_distribution": "Tropical and subtropical regions across India, especially rocky gravelly soils",
        "official_sources": [
            "Ayurvedic Pharmacopoeia of India (API Part I, Vol. IV, Monograph 49: Satavari, pp. 108-109)",
            "Botanical Survey of India (BSI) Flora of India",
            "Kew Royal Botanic Gardens — Plants of the World Online (POWO ID: urn:lsid:ipni.org:names:531238-1)"
        ]
    },
    "ayur-guggulu": {
        "kingdom": "Plantae (Plants)",
        "subkingdom": "Tracheobionta (Vascular plants)",
        "superdivision": "Spermatophyta (Seed plants)",
        "division": "Magnoliophyta (Flowering plants / Angiosperms)",
        "class": "Magnoliopsida (Dicotyledons)",
        "subclass": "Rosidae",
        "order": "Sapindales",
        "family": "Burseraceae (Frankincense and Myrrh family)",
        "genus": "Commiphora Jacq.",
        "species": "Commiphora wightii (Arn.) Bhandari (syn. Commiphora mukul (Hook. ex Stocks) Engl.)",
        "binomial_name": "Commiphora wightii (Arn.) Bhandari",
        "authority": "(Arn.) Bhandari",
        "synonyms": ["Balsamodendrum mukul Hook. ex Stocks", "Commiphora mukul (Hook. ex Stocks) Engl."],
        "vernacular_names": {
            "Sanskrit": "Guggulu, Devadhūpa, Kauśika",
            "Hindi": "Guggul, Guggulu",
            "English": "Indian Bdellium Tree",
            "Tamil": "Gukkulu",
            "Telugu": "Guggilamu"
        },
        "habit": "Spiny deciduous shrub or stunted tree (1.5–3 m in height)",
        "morphology": "Papery silver-grey peeling bark exuding aromatic oleo-gum-resin upon incision. Crooked knotty branches ending in sharp spines. Leaves simple or 3-foliolate, obovate, toothed. Flowers small, unisexual, brownish-red in fascicles.",
        "parts_used": "Purified oleo-gum-resin (Shuddha Guggulu)",
        "habitat_distribution": "Arid rocky tracts of Rajasthan, Gujarat (Kutch), Madhya Pradesh",
        "official_sources": [
            "Ayurvedic Pharmacopoeia of India (API Part I, Vol. I, Monograph 18: Guggulu, pp. 37-38)",
            "Botanical Survey of India (BSI) Flora of India",
            "Kew Royal Botanic Gardens — Plants of the World Online (POWO ID: urn:lsid:ipni.org:names:127885-1)"
        ]
    },
    "ayur-triphala": {
        "kingdom": "Plantae (Plants)",
        "subkingdom": "Tracheobionta (Vascular plants)",
        "superdivision": "Spermatophyta (Seed plants)",
        "division": "Magnoliophyta (Flowering plants / Angiosperms)",
        "class": "Equisetopsida / Magnoliopsida",
        "order": "Myrtales & Malpighiales",
        "family": "Combretaceae (Haritaki & Bibhitaki) + Phyllanthaceae (Amalaki)",
        "genus": "Terminalia L. + Phyllanthus L.",
        "species": "Terminalia chebula Retz. + Terminalia bellirica (Gaertn.) Roxb. + Phyllanthus emblica L.",
        "binomial_name": "Three Myrobalans (Polyherbal Botanical Composite)",
        "authority": "Classical Ayurvedic Pharmacopoeia Standards",
        "synonyms": ["Three Fruits", "Phalatrikam", "Vara"],
        "vernacular_names": {
            "Sanskrit": "Triphalā, Phalatrika, Vara",
            "Hindi": "Triphala",
            "English": "Three Myrobalans",
            "Tamil": "Tiripala",
            "Telugu": "Triphalalu"
        },
        "habit": "Formulation of three prominent Indian forest trees (1:1:1 ratio of pericarp)",
        "morphology": "1. Terminalia chebula (Haritaki): Large deciduous tree, ribbed yellowish-brown drupe. 2. Terminalia bellirica (Bibhitaki): Tall tree, velvety globose drupe. 3. Phyllanthus emblica (Amalaki): Medium deciduous tree with feathery light green pinnate foliage and fleshy 6-lobed sour fruits.",
        "parts_used": "Dried fruit pericarps (without seeds) in equal proportion (1:1:1)",
        "habitat_distribution": "Mixed deciduous forests throughout the Indian subcontinent",
        "official_sources": [
            "Ayurvedic Pharmacopoeia of India (API Part I, Vol. I & II Monographs)",
            "Ayurvedic Formulary of India (AFI Part I, 7:15)",
            "Charaka Samhita Chikitsasthana 1:3; Sushruta Samhita Sutrasthana 38"
        ]
    }
}


def populate():
    db = SessionLocal()
    updated_count = 0
    try:
        for rec_id, tax_data in TAXONOMY_MAP.items():
            record = db.query(AyurvedaKnowledge).filter(AyurvedaKnowledge.id == rec_id).first()
            if record:
                meta = dict(record.doc_metadata or {})
                meta["taxonomy"] = tax_data
                record.doc_metadata = meta
                updated_count += 1
                print(f"[OK] Updated taxonomy for {record.common_name} ({record.id})")
        db.commit()
        print(f"\nSuccessfully populated authoritative taxonomy for {updated_count} botanical records in PostgreSQL.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to populate taxonomy: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    populate()
