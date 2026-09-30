import fs from 'fs';
import path from 'path';

const frenchStoryKeys = {
  "story_guerra_summary": {
    "es": "Verano de 1944. Las patrullas ocupantes vigilan los caminos; la red maquis ha escondido claves a lo largo del río Eau Bourde.",
    "fr": "Été 1944. Les patrouilles d'occupation surveillent les chemins ; le réseau maquis a caché des clés le long de l'Eau Bourde.",
    "en": "Summer 1944. Occupation patrols watch the roads; the Maquis network has hidden keys along the Eau Bourde river."
  },
  "story_guerra_narrative": {
    "es": "Las tropas de ocupación patrullan las carreteras principales. En la espesura del bosque de Canéjan, la red maquis ha escondido cilindros con coordenadas y nombres en clave. Eres el enlace del maquis.",
    "fr": "Les troupes d'occupation patrouillent les routes principales. Dans l'épaisseur de la forêt de Canéjan, le réseau maquis a caché des cylindres avec des coordonnées et des noms de code. Tu es l'agent de liaison du maquis.",
    "en": "Occupation troops patrol the main roads. In the thick of Canéjan forest, the Maquis network has hidden cylinders with coordinates and code names. You are the Maquis liaison."
  },
  "story_guerra_mission": {
    "es": "Actuar como enlace de la Resistencia, seguir las señales ocultas en los árboles y descifrar las claves para abrir paso seguro hacia Burdeos.",
    "fr": "Agir comme agent de liaison de la Résistance, suivre les signes cachés dans les arbres et déchiffrer les clés pour ouvrir un passage sûr vers Bordeaux.",
    "en": "Act as a Resistance liaison, follow the signs hidden in the trees and decipher the keys to open a safe path toward Bordeaux."
  },
  "story_molino_summary": {
    "es": "Año 1878. Maître Pierre ideó un mecanismo hidráulico para triplicar la fuerza motriz del molino y ocultó sus bocetos a lo largo de la cuenca.",
    "fr": "Année 1878. Maître Pierre a imaginé un mécanisme hydraulique pour tripler la force motrice du moulin et a caché ses croquis le long du bassin.",
    "en": "Year 1878. Maître Pierre devised a hydraulic mechanism to triple the mill's driving force and hid his sketches along the basin."
  },
  "story_molino_narrative": {
    "es": "En 1878, Maître Pierre ideó un sistema de esclusas capaz de triplicar la fuerza motriz del molino sin desbordar el río. Ante las disputas entre terratenientes, ocultó sus planos en puntos clave de la ribera.",
    "fr": "En 1878, Maître Pierre a imaginé un système d'écluses capable de tripler la force motrice du moulin sans faire déborder la rivière. Face aux disputes entre propriétaires, il a caché ses plans dans des points clés de la rive.",
    "en": "In 1878, Maître Pierre devised a sluice system capable of tripling the mill's driving force without overflowing the river. Amid disputes between landowners, he hid his plans at key points along the bank."
  },
  "story_molino_mission": {
    "es": "Reconstruir las medidas del caudal, examinar la cantería de las acequias y encontrar la combinación del cofre del Rouillac.",
    "fr": "Reconstituer les mesures du débit, examiner la maçonnerie des biefs et trouver la combinaison du coffre de Rouillac.",
    "en": "Reconstruct the flow measurements, examine the millraces' stonework and find the combination of the Rouillac chest."
  },
  "story_hechizo_summary": {
    "es": "Un sortilegio de niebla ha congelado la melodía del arroyo y las flores no despiertan.",
    "fr": "Un sortilège de brume a gelé la mélodie du ruisseau et les fleurs ne s'éveillent pas.",
    "en": "A spell of mist has frozen the brook's melody and the flowers won't wake."
  },
  "story_hechizo_narrative": {
    "es": "Un viejo sortilegio de niebla ha congelado la melodía del arroyo y las flores de ribera han cerrado sus pétalos. Sylvaine, espíritu del agua dulce, busca exploradores puros de corazón para devolver la luz.",
    "fr": "Un vieux sortilège de brume a gelé la mélodie du ruisseau et les fleurs de rive ont fermé leurs pétales. Sylvaine, esprit de l'eau douce, cherche des explorateurs au cœur pur pour rendre la lumière.",
    "en": "An old spell of mist has frozen the brook's melody and the riverside flowers have closed their petals. Sylvaine, spirit of fresh water, seeks pure-hearted explorers to bring back the light."
  },
  "story_hechizo_mission": {
    "es": "Ayudar a la dríade Sylvaine a conectar con los árboles centenarios, purificar las aguas y romper el maleficio.",
    "fr": "Aider la dryade Sylvaine à communiquer avec les arbres centenaires, purifier les eaux et rompre le maléfice.",
    "en": "Help the dryad Sylvaine connect with the ancient trees, purify the waters and break the curse."
  },
  "story_promenade_summary": {
    "es": "Cuentos infantiles y esculturas de madera diseñados por los niños de Canéjan junto a un escultor y cuentacuentos local.",
    "fr": "Contes d'enfants et sculptures en bois imaginés par les enfants de Canéjan avec un sculpteur et conteur local.",
    "en": "Children's tales and wooden sculptures imagined by the children of Canéjan with a local sculptor and storyteller."
  },
  "story_promenade_narrative": {
    "es": "En este sendero, los dibujos y cuentos de los niños cobraron vida. Duendecillos del musgo, pájaros parlanchines y piedras que cantan aguardan a toda la familia en una aventura llena de ternura.",
    "fr": "Sur ce sentier, les dessins et contes des enfants ont pris vie. Des petits lutins de mousse, des oiseaux bavards et des pierres qui chantent attendent toute la famille dans une aventure pleine de tendresse.",
    "en": "On this trail, the children's drawings and tales came to life. Moss sprites, chatty birds and singing stones await the whole family in an adventure full of tenderness."
  },
  "story_promenade_mission": {
    "es": "Seguir las pistas rimadas de los alumnos, descubrir los animalitos del arroyo y hacer reír al bosque en familia.",
    "fr": "Suivre les indices rimés des élèves, découvrir les petits animaux du ruisseau et faire rire la forêt en famille.",
    "en": "Follow the pupils' rhyming clues, discover the brook's little animals and make the forest laugh as a family."
  }
};

// 1. Update i18n JSON files
function updateI18n(filePath) {
  if (!fs.existsSync(filePath)) return;
  const i18n = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!i18n.ui) i18n.ui = { es: {}, fr: {}, en: {} };
  if (!i18n.keys) i18n.keys = {};

  for (const [k, v] of Object.entries(frenchStoryKeys)) {
    i18n.keys[k] = v;
    i18n.ui.es[k] = v.es;
    i18n.ui.fr[k] = v.fr;
    i18n.ui.en[k] = v.en;
  }

  // Also update i18n.forests['bosque-canejan-cestas'] if present
  if (i18n.forests && i18n.forests['bosque-canejan-cestas']) {
    const fTrans = i18n.forests['bosque-canejan-cestas'];
    ['es', 'fr', 'en'].forEach(lang => {
      if (!fTrans[lang]) fTrans[lang] = { stories: {} };
      if (!fTrans[lang].stories) fTrans[lang].stories = {};

      fTrans[lang].stories['guerra'] = {
        ...(fTrans[lang].stories['guerra'] || {}),
        summary: frenchStoryKeys.story_guerra_summary[lang],
        narrative: frenchStoryKeys.story_guerra_narrative[lang],
        mission: frenchStoryKeys.story_guerra_mission[lang]
      };

      fTrans[lang].stories['molino_perdido'] = {
        ...(fTrans[lang].stories['molino_perdido'] || {}),
        summary: frenchStoryKeys.story_molino_summary[lang],
        narrative: frenchStoryKeys.story_molino_narrative[lang],
        mission: frenchStoryKeys.story_molino_mission[lang]
      };

      fTrans[lang].stories['hechizo_encantado'] = {
        ...(fTrans[lang].stories['hechizo_encantado'] || {}),
        summary: frenchStoryKeys.story_hechizo_summary[lang],
        narrative: frenchStoryKeys.story_hechizo_narrative[lang],
        mission: frenchStoryKeys.story_hechizo_mission[lang]
      };

      fTrans[lang].stories['promenade_enchantee'] = {
        ...(fTrans[lang].stories['promenade_enchantee'] || {}),
        summary: frenchStoryKeys.story_promenade_summary[lang],
        narrative: frenchStoryKeys.story_promenade_narrative[lang],
        mission: frenchStoryKeys.story_promenade_mission[lang]
      };
    });
  }

  fs.writeFileSync(filePath, JSON.stringify(i18n, null, 2), 'utf-8');
  console.log('Updated i18n in', filePath);
}

updateI18n(path.resolve('src/data/i18n.json'));
updateI18n(path.resolve('i18n.json'));

// 2. Update forests JSON files
const canejanStoryKeyMap = {
  'guerra': {
    summaryKey: 'story_guerra_summary',
    narrativeKey: 'story_guerra_narrative',
    missionKey: 'story_guerra_mission',
    summary: frenchStoryKeys.story_guerra_summary.es,
    narrative: frenchStoryKeys.story_guerra_narrative.es,
    mission: frenchStoryKeys.story_guerra_mission.es
  },
  'molino_perdido': {
    summaryKey: 'story_molino_summary',
    narrativeKey: 'story_molino_narrative',
    missionKey: 'story_molino_mission',
    summary: frenchStoryKeys.story_molino_summary.es,
    narrative: frenchStoryKeys.story_molino_narrative.es,
    mission: frenchStoryKeys.story_molino_mission.es
  },
  'hechizo_encantado': {
    summaryKey: 'story_hechizo_summary',
    narrativeKey: 'story_hechizo_narrative',
    missionKey: 'story_hechizo_mission',
    summary: frenchStoryKeys.story_hechizo_summary.es,
    narrative: frenchStoryKeys.story_hechizo_narrative.es,
    mission: frenchStoryKeys.story_hechizo_mission.es
  },
  'promenade_enchantee': {
    summaryKey: 'story_promenade_summary',
    narrativeKey: 'story_promenade_narrative',
    missionKey: 'story_promenade_mission',
    summary: frenchStoryKeys.story_promenade_summary.es,
    narrative: frenchStoryKeys.story_promenade_narrative.es,
    mission: frenchStoryKeys.story_promenade_mission.es
  }
};

function updateCanejanStories(filePath) {
  if (!fs.existsSync(filePath)) return;
  const forests = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const canejan = forests.find(f => f.id === 'bosque-canejan-cestas');
  if (!canejan) return;

  canejan.stories = canejan.stories.map(story => {
    const map = canejanStoryKeyMap[story.id];
    if (!map) return story;

    return {
      ...story,
      summaryKey: map.summaryKey,
      narrativeKey: map.narrativeKey,
      missionKey: map.missionKey,
      summary: map.summary,
      narrative: map.narrative,
      mission: map.mission
    };
  });

  fs.writeFileSync(filePath, JSON.stringify(forests, null, 2), 'utf-8');
  console.log('Updated Canejan stories in:', filePath);
}

updateCanejanStories(path.resolve('data/forests.json'));
updateCanejanStories(path.resolve('forest-packs-seed.json'));
updateCanejanStories(path.resolve('data/forest-packs-seed.json'));

console.log('French story keys applied successfully!');
