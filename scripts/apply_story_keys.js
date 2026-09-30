import fs from 'fs';
import path from 'path';

const storyKeys = {
  "story_guardian_summary": {
    "es": "Un bosque de historia, piedra y río en el Valle del Iregua. El Cronicón te guía por castillo, arco, cuevas y ermita para recomponer el sello NALDA.",
    "fr": "Une forêt d'histoire, de pierre et de rivière dans la vallée de l'Iregua. Le Cronicón te guide à travers château, arche, grottes et ermitage pour recomposer le sceau NALDA.",
    "en": "A forest of history, stone and river in the Iregua Valley. The Cronicón guides you through castle, arch, caves and hermitage to rebuild the NALDA seal."
  },
  "story_guardian_narrative": {
    "es": "Bienvenido, aprendiz. Soy el Cronicón, y estas piedras guardan memoria. Cada hito que visites te entregará una runa; al final, todas juntas formarán el nombre que el Iregua susurra desde hace siglos: NALDA.",
    "fr": "Bienvenue, apprenti. Je suis le Cronicón, et ces pierres gardent la mémoire. Chaque étape que tu visiteras te remettra une rune ; à la fin, toutes ensemble formeront le nom que l'Iregua murmure depuis des siècles : NALDA.",
    "en": "Welcome, apprentice. I am the Cronicón, and these stones keep memory. Each waypoint you visit will hand you a rune; in the end, all together they will form the name the Iregua has whispered for centuries: NALDA."
  },
  "story_guardian_mission": {
    "es": "Recorrer Nalda junto al sabio Cronicón, descifrar los enigmas medievales de cada hito y recomponer el sello sagrado NALDA.",
    "fr": "Parcourir Nalda avec le sage Cronicón, déchiffrer les énigmes médiévales de chaque étape et recomposer le sceau sacré NALDA.",
    "en": "Walk Nalda with the wise Cronicón, decipher the medieval riddles of each waypoint and rebuild the sacred seal NALDA."
  },
  "story_fray_summary": {
    "es": "El fantasma de un monje borracho te guía por Nalda contando chistes verdes y soltando la historia real entre eructo y eructo. No apto para niños ni para gente sin sentido del humor.",
    "fr": "Le fantôme d'un moine ivre te guide à Nalda en racontant des blagues grivoises et en lâchant la vraie histoire entre deux rots. Pas pour les enfants ni les gens sans humour.",
    "en": "The ghost of a drunk monk guides you through Nalda telling dirty jokes and dropping real history between burps. Not for kids or people without a sense of humour."
  },
  "story_fray_narrative": {
    "es": "¡Ehhhh, chaval! ¡Bienvenido a mi taberna! Bueno, a mi pueblo. Bueno, a lo que queda de él, porque yo llevo muerto desde 1387, ¡ja, ja, ja! ¿Tú sabes lo que es morirse ahogado en un barril de vino? ¡Una muerte digna, coño! Oye, ¿me ayudas a encontrar mi alma? La perdí en una apuesta contra el diablo. O eso, o se la dejé al obispo. No me acuerdo. ¡Ay, perdón! *eructo* ¡Eso ha sido el Espíritu Santo! Venga, vamos, que te voy contando la historia de Nalda. Pero si me ofreces un trago, mejor que mejor.",
    "fr": "Hé, mon gars ! Bienvenue dans ma taverne ! Enfin, dans mon village. Enfin, dans ce qu'il en reste, parce que je suis mort depuis 1387, ha ha ha ! Tu sais ce que c'est que de mourir noyé dans un tonneau de vin ? Une mort digne, bordel ! Dis, tu m'aides à retrouver mon âme ? Je l'ai perdue dans un pari contre le diable. Ou alors je l'ai laissée à l'évêque. Je ne me souviens plus. Oh, pardon ! *rot* C'était le Saint-Esprit ! Allez, viens, je te raconte l'histoire de Nalda. Mais si tu m'offres un coup, c'est encore mieux.",
    "en": "Hey, mate! Welcome to my tavern! I mean, my village. I mean, what's left of it, because I've been dead since 1387, ha ha ha! Do you know what it's like to drown in a wine barrel? A dignified death, damn it! Listen, will you help me find my soul? I lost it in a bet against the devil. Or maybe I left it with the bishop. I don't remember. Oh, sorry! *burp* That was the Holy Spirit! Come on, let's go, I'll tell you the history of Nalda. But if you offer me a drink, even better."
  },
  "story_fray_mission": {
    "es": "Acompañar al fantasma de Fray Botijo por Nalda, descifrar los enigmas históricos entre trago y trago, y reconstruir la palabra BOTIJO.",
    "fr": "Accompagner le fantôme de Fray Botijo à Nalda, déchiffrer les énigmes historiques entre deux verres et reconstruire le mot BOTIJO.",
    "en": "Accompany Friar Botijo's ghost through Nalda, decipher the historical riddles between drinks, and rebuild the word BOTIJO."
  },
  "story_palomar_summary": {
    "es": "Una aventura gamberra y canalla por Nalda guiada por Chucho el Palomo, el rey de las palomas de Los Palomares.",
    "fr": "Une aventure espiègle et canaille à Nalda guidée par Chucho le Pigeon, le roi des pigeons de Los Palomares.",
    "en": "A cheeky, streetwise adventure through Nalda guided by Chucho the Pigeon, king of the Los Palomares flock."
  },
  "story_palomar_narrative": {
    "es": "¡Epa, plumas! Soy Chucho el Palomo. Aquí en Nalda mando yo y mi bandada de Los Palomares. ¿Vienes a curiosear o a volar con la banda? ¡Al loro con las pistas, que las piedras hablan si sabes mirar desde arriba!",
    "fr": "Salut les plumes ! Moi c'est Chucho le Pigeon. Ici à Nalda, c'est moi et ma bande de Los Palomares qui commandons. Tu viens jeter un œil ou voler avec la bande ? Ouvre l'œil aux indices, les pierres parlent si tu sais regarder d'en haut !",
    "en": "Hey feather-heads! I'm Chucho the Pigeon. Here in Nalda, me and my Los Palomares flock run the show. Coming to snoop or to fly with the gang? Keep your eyes peeled for clues, stones talk if you know how to look from above!"
  },
  "story_palomar_mission": {
    "es": "Explorar Nalda desde la perspectiva de la bandada callejera, sortear los desafíos de las alturas y conseguir el título honorífico de 'Pichón Jefe de Nalda'.",
    "fr": "Explorer Nalda du point de vue de la bande de rue, relever les défis des hauteurs et obtenir le titre honorifique de 'Pigeon Chef de Nalda'.",
    "en": "Explore Nalda from the street-flock perspective, tackle the heights' challenges and earn the honorary title of 'Head Pigeon of Nalda'."
  },
  "story_zorbo_summary": {
    "es": "Una investigación cósmico-absurda junto a Zorbo, un marciano extraviado que confunde Nalda con una base espacial alienígena.",
    "fr": "Une enquête cosmico-absurde avec Zorbo, un Martien égaré qui confond Nalda avec une base spatiale extraterrestre.",
    "en": "A cosmic-absurd investigation with Zorbo, a lost Martian who confuses Nalda with an alien space base."
  },
  "story_zorbo_narrative": {
    "es": "¡Saludos, espécimen bípedo! Soy Zorbo, del sector estelar ZX-4. Mi nave se averió en el Valle del Iregua. Mis escáneres detectan que Nalda es un nodo de energía cósmica... ¡Ayúdame a recalibrar la nave antes de que se enteren en mi planeta!",
    "fr": "Salutations, spécimen bipède ! Je suis Zorbo, du secteur stellaire ZX-4. Mon vaisseau est tombé en panne dans la vallée de l'Iregua. Mes scanners détectent que Nalda est un nœud d'énergie cosmique... Aide-moi à recalibrer le vaisseau avant que ça se sache sur ma planète !",
    "en": "Greetings, bipedal specimen! I'm Zorbo, from star sector ZX-4. My ship broke down in the Iregua Valley. My scanners detect that Nalda is a cosmic energy node... Help me recalibrate the ship before they find out on my planet!"
  },
  "story_zorbo_mission": {
    "es": "Ayudar a Zorbo a decodificar las anomalías geológicas e históricas de Nalda para recargar los propulsores de su platillo volante.",
    "fr": "Aider Zorbo à décoder les anomalies géologiques et historiques de Nalda pour recharger les propulseurs de sa soucoupe.",
    "en": "Help Zorbo decode Nalda's geological and historical anomalies to recharge his flying saucer's thrusters."
  }
};

// 1. Update i18n JSON files
function updateI18n(filePath) {
  if (!fs.existsSync(filePath)) return;
  const i18n = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!i18n.ui) i18n.ui = { es: {}, fr: {}, en: {} };
  if (!i18n.keys) i18n.keys = {};

  for (const [k, v] of Object.entries(storyKeys)) {
    i18n.keys[k] = v;
    i18n.ui.es[k] = v.es;
    i18n.ui.fr[k] = v.fr;
    i18n.ui.en[k] = v.en;
  }

  fs.writeFileSync(filePath, JSON.stringify(i18n, null, 2), 'utf-8');
  console.log('Updated i18n file:', filePath);
}

updateI18n(path.resolve('src/data/i18n.json'));
updateI18n(path.resolve('i18n.json'));

// 2. Update forests JSON files
const storyKeyMapping = {
  'guardian-iregua': {
    summaryKey: 'story_guardian_summary',
    narrativeKey: 'story_guardian_narrative',
    missionKey: 'story_guardian_mission',
    summary: storyKeys.story_guardian_summary.es,
    narrative: storyKeys.story_guardian_narrative.es,
    mission: storyKeys.story_guardian_mission.es
  },
  'fraile-botijo': {
    summaryKey: 'story_fray_summary',
    narrativeKey: 'story_fray_narrative',
    missionKey: 'story_fray_mission',
    summary: storyKeys.story_fray_summary.es,
    narrative: storyKeys.story_fray_narrative.es,
    mission: storyKeys.story_fray_mission.es
  },
  'banda-palomar': {
    summaryKey: 'story_palomar_summary',
    narrativeKey: 'story_palomar_narrative',
    missionKey: 'story_palomar_mission',
    summary: storyKeys.story_palomar_summary.es,
    narrative: storyKeys.story_palomar_narrative.es,
    mission: storyKeys.story_palomar_mission.es
  },
  'expediente-zorbo': {
    summaryKey: 'story_zorbo_summary',
    narrativeKey: 'story_zorbo_narrative',
    missionKey: 'story_zorbo_mission',
    summary: storyKeys.story_zorbo_summary.es,
    narrative: storyKeys.story_zorbo_narrative.es,
    mission: storyKeys.story_zorbo_mission.es
  }
};

function updateForestStories(filePath) {
  if (!fs.existsSync(filePath)) return;
  const forests = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const nalda = forests.find(f => f.id === 'nalda');
  if (!nalda) return;

  nalda.stories = nalda.stories.map(story => {
    const map = storyKeyMapping[story.id];
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
  console.log('Updated forest stories in:', filePath);
}

updateForestStories(path.resolve('data/forests.json'));
updateForestStories(path.resolve('forest-packs-seed.json'));
updateForestStories(path.resolve('data/forest-packs-seed.json'));

console.log('All story keys applied successfully!');
