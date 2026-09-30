import fs from 'fs';
import path from 'path';

const arTitles = {
  "ar_castillo_title": {
    "es": "Torre del Homenaje Reconstruida",
    "fr": "Tour du Hommage Reconstruite",
    "en": "Rebuilt Keep Tower"
  },
  "ar_arco_title": {
    "es": "Vigías Medievales en el Arco",
    "fr": "Guetteurs Médiévaux sous l'Arche",
    "en": "Medieval Watchmen at the Arch"
  },
  "ar_mirador_title": {
    "es": "Etiquetas del Valle del Iregua",
    "fr": "Étiquettes de la Vallée de l'Iregua",
    "en": "Iregua Valley Labels"
  },
  "ar_cuevas_title": {
    "es": "Paloma Mensajera 3D",
    "fr": "Colombe Messagère 3D",
    "en": "3D Carrier Dove"
  },
  "ar_ermita_title": {
    "es": "Cesta de Vendimia Riojana",
    "fr": "Panier de Vendange Rioja",
    "en": "Rioja Harvest Basket"
  }
};

// 1. Update i18n JSON files
function updateI18n(filePath) {
  if (!fs.existsSync(filePath)) return;
  const i18n = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!i18n.ui) i18n.ui = { es: {}, fr: {}, en: {} };
  if (!i18n.keys) i18n.keys = {};

  for (const [k, v] of Object.entries(arTitles)) {
    i18n.keys[k] = v;
    i18n.ui.es[k] = v.es;
    i18n.ui.fr[k] = v.fr;
    i18n.ui.en[k] = v.en;
  }

  fs.writeFileSync(filePath, JSON.stringify(i18n, null, 2), 'utf-8');
  console.log('Updated i18n with AR titles:', filePath);
}

updateI18n(path.resolve('src/data/i18n.json'));
updateI18n(path.resolve('i18n.json'));

// 2. Update forests JSON files
const poiArMap = {
  'castillo-nalda': {
    titleKey: 'ar_castillo_title',
    title: arTitles.ar_castillo_title.es,
    label: arTitles.ar_castillo_title.es
  },
  'arco-villa': {
    titleKey: 'ar_arco_title',
    title: arTitles.ar_arco_title.es,
    label: arTitles.ar_arco_title.es
  },
  'mirador-cameros': {
    titleKey: 'ar_mirador_title',
    title: arTitles.ar_mirador_title.es,
    label: arTitles.ar_mirador_title.es
  },
  'cuevas-palomares': {
    titleKey: 'ar_cuevas_title',
    title: arTitles.ar_cuevas_title.es,
    label: arTitles.ar_cuevas_title.es
  },
  'ermita-villavieja': {
    titleKey: 'ar_ermita_title',
    title: arTitles.ar_ermita_title.es,
    label: arTitles.ar_ermita_title.es
  }
};

function updateForestsPois(filePath) {
  if (!fs.existsSync(filePath)) return;
  const forests = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const nalda = forests.find(f => f.id === 'nalda');
  if (!nalda) return;

  nalda.pois = nalda.pois.map(poi => {
    const arMap = poiArMap[poi.id];
    if (!arMap) return poi;

    const updatedAr = {
      ...(poi.arAsset || {}),
      titleKey: arMap.titleKey,
      title: arMap.title,
      label: arMap.label
    };

    return {
      ...poi,
      arAsset: updatedAr
    };
  });

  fs.writeFileSync(filePath, JSON.stringify(forests, null, 2), 'utf-8');
  console.log('Updated Nalda POIs with AR titles in:', filePath);
}

updateForestsPois(path.resolve('data/forests.json'));
updateForestsPois(path.resolve('forest-packs-seed.json'));
updateForestsPois(path.resolve('data/forest-packs-seed.json'));

console.log('AR titles successfully applied!');
