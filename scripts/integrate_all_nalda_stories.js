import fs from 'fs';
import path from 'path';

const forestsPath = path.resolve('data/forests.json');
const forests = JSON.parse(fs.readFileSync(forestsPath, 'utf-8'));

// Load current i18n
const i18nPath = path.resolve('src/data/i18n.json');
const currentI18n = JSON.parse(fs.readFileSync(i18nPath, 'utf-8'));

// Check nalda
const naldaForest = forests.find(f => f.id === 'nalda');
if (!naldaForest) {
  throw new Error('Nalda forest not found');
}

// -------------------------------------------------------------
// Story 2: La Banda del Palomar (Chucho el Palomo)
// -------------------------------------------------------------
const storyChuchoDef = {
  id: "banda-palomar",
  titleKey: "story_palomar_title",
  contentRating: "everyone",
  guide: {
    id: "chucho-palomo",
    nameKey: "guide_chucho_name",
    personaKey: "guide_chucho_persona",
    systemPromptKey: "guide_chucho_system_prompt",
    knowledgeBase: [
      "cuevas_palomares_palomas.json",
      "castillo_nalda_azoteas.json",
      "iregua_bano_aves.json",
      "calles_nalda_migas.json"
    ],
    voice: "Puck",
    greetingKey: "guide_chucho_greeting"
  },
  durations: {
    "30min": {
      pois: ["castillo-nalda", "arco-villa"],
      distance_km: 0.8,
      descriptionKey: "duration_30min_description"
    },
    "1h": {
      pois: ["castillo-nalda", "arco-villa", "mirador-cameros"],
      distance_km: 2.5,
      descriptionKey: "duration_1h_description"
    },
    "1h30": {
      pois: ["castillo-nalda", "arco-villa", "mirador-cameros", "cuevas-palomares"],
      distance_km: 4.5,
      descriptionKey: "duration_1h30_description"
    },
    "2h": {
      pois: ["castillo-nalda", "arco-villa", "mirador-cameros", "cuevas-palomares", "ermita-villavieja"],
      distance_km: 6.5,
      descriptionKey: "duration_2h_description"
    }
  },
  difficulties: {
    "novato": { points_per_test: 100, free_hints: 2, easy_mode_geofence_m: 50 },
    "explorador": { points_per_test: 150, free_hints: 1, easy_mode_geofence_m: 25 },
    "maestro": { points_per_test: 250, free_hints: 0, easy_mode_geofence_m: 0 }
  }
};

const storyChuchoObj = {
  id: "banda-palomar",
  title: "La Banda del Palomar",
  icon: "🕊️",
  summary: "Una aventura gamberra y canalla por Nalda guiada por Chucho el Palomo, el rey de las palomas de Los Palomares.",
  narrative: "¡Epa, plumas! Soy Chucho el Palomo. Aquí en Nalda mando yo y mi bandada de Los Palomares. ¿Vienes a curiosear o a volar con la banda? ¡Al loro con las pistas que las piedras hablan si sabes mirar desde arriba!",
  mission: "Explorar Nalda desde la perspectiva de la bandada callejera, sortear los desafíos de las alturas y conseguir el título honorífico de 'Pichón Jefe de Nalda'.",
  narratorName: "Chucho el Palomo",
  narratorRole: "Líder callejero de la bandada de Los Palomares",
  narratorTone: "Gamberro, pícaro, canalla callejero y protector de su bandada",
  narratorAvatar: "🕊️",
  voiceName: "Puck",
  characterBio: "Paloma líder de la bandada que anida en las oquedades medievales de Los Palomares. Conoce cada cornisa, teja y rincón secreto de Nalda a vista de pájaro.",
  characterGreeting: "¡Epa, plumas! Soy Chucho el Palomo. ¿Vienes a caminar o a que te eche una pata la mejor paloma de La Rioja? ¡Vuelo rasante y al lío!",
  guide: storyChuchoDef.guide,
  durations: storyChuchoDef.durations,
  difficulties: storyChuchoDef.difficulties
};

// Riddles for Story 2 (Chucho)
const chuchoRiddles = [
  {
    id: "chucho-t1-castillo",
    poiId: "castillo-nalda",
    storyId: "banda-palomar",
    name: "Ojo de Paloma en el Castillo",
    difficulty: "novato",
    question: "Oye, plumas: desde lo alto de la torre del castillo veo todo el valle. En 1299 encerraron aquí a un noble de postín. ¿Quién era el pájaro enjaulado?",
    type: "test",
    options: ["Don Juan de Austria", "Juan Alonso de Haro", "El Obispo de Calahorra", "El Cid Campeador"],
    answer: "Juan Alonso de Haro",
    hints: ["No llevaba plumas, pero era señor de Cameros.", "Su apellido tiene nombre de pueblo con mucho vino."],
    staticHints: ["Señor de Cameros en el siglo XIII", "Juan Alonso de Haro"],
    points: 100,
    correctIndex: 1
  },
  {
    id: "chucho-t2-arco",
    poiId: "arco-villa",
    storyId: "banda-palomar",
    name: "Aduana de Plumas en el Arco",
    difficulty: "explorador",
    question: "Mis palomas montan guardia en lo alto del Arco de la Villa. ¿Qué función histórica tenía este arco de piedra en la muralla medieval?",
    type: "text",
    answer: "Puerta defensiva de entrada a la villa",
    acceptedAnswers: ["puerta defensiva", "puerta de entrada", "defensa", "muralla", "entrada a la villa", "acceso amurallado"],
    hints: ["Nadie pasaba sin ser visto desde arriba.", "Era la puerta principal del recinto amurallado."],
    staticHints: ["Entrada protegida", "Puerta amurallada"],
    points: 150
  },
  {
    id: "chucho-t3-mirador",
    poiId: "mirador-cameros",
    storyId: "banda-palomar",
    name: "Ruta de Vuelo Cameros",
    difficulty: "maestro",
    question: "¿Qué río desciende por el cañón hacia el Ebro y es nuestra piscina favorita para remojar las plumas?",
    type: "text",
    answer: "Iregua",
    acceptedAnswers: ["iregua", "río iregua", "rio iregua"],
    hints: ["Empieza por I y tiene 6 letras.", "Pasa rozando Nalda."],
    staticHints: ["Río principal del valle", "Iregua"],
    points: 250
  },
  {
    id: "chucho-t4-palomares",
    poiId: "cuevas-palomares",
    storyId: "banda-palomar",
    name: "El Cuartel General de la Banda",
    difficulty: "explorador",
    question: "¡Aquí está mi palacio! Las Cuevas de Los Palomares tienen decenas de huecos tallados en roca. ¿Qué uso religioso tuvieron antes de ser nuestro hogar?",
    type: "test",
    options: ["Eremitorio medieval de monjes", "Almacén de pólvora carlista", "Caballerizas romanas", "Molino de agua subterráneo"],
    answer: "Eremitorio medieval de monjes",
    hints: ["Eran celdas de silencio y oración para ermitaños.", "Siglos después vinieron las palomas."],
    staticHints: ["Monjes ermitaños en la roca", "Eremitorio medieval"],
    points: 150,
    correctIndex: 0
  },
  {
    id: "chucho-t5-ermita",
    poiId: "ermita-villavieja",
    storyId: "banda-palomar",
    name: "La Campana de Villavieja",
    difficulty: "novato",
    question: "En la espadaña de la Ermita de Villavieja nos posamos a tomar el sol. ¿Qué celebración tradicional reúne a los vecinos con bollos y procesión en este lugar?",
    type: "test",
    options: ["La Romería de Villavieja", "La Tomatina de Nalda", "La Batalla del Vino de Cameros", "El Desfile de Halcones"],
    answer: "La Romería de Villavieja",
    hints: ["Una fiesta popular llena de cánticos y devoción.", "Se sube en romería."],
    staticHints: ["Fiesta tradicional", "Romería de Villavieja"],
    points: 100,
    correctIndex: 0
  }
];

// -------------------------------------------------------------
// Story 3: El Expediente Iregua: Zorbo el Marciano (Zorbo)
// -------------------------------------------------------------
const storyZorboDef = {
  id: "expediente-zorbo",
  titleKey: "story_zorbo_title",
  contentRating: "everyone",
  guide: {
    id: "zorbo-marciano",
    nameKey: "guide_zorbo_name",
    personaKey: "guide_zorbo_persona",
    systemPromptKey: "guide_zorbo_system_prompt",
    knowledgeBase: [
      "anomalias_valle_iregua.json",
      "tecnologia_rupestre_palomares.json",
      "reactor_castillo_nalda.json",
      "combustible_fermentado_rioja.json"
    ],
    voice: "Zephyr",
    greetingKey: "guide_zorbo_greeting"
  },
  durations: {
    "30min": {
      pois: ["castillo-nalda", "arco-villa"],
      distance_km: 0.8,
      descriptionKey: "duration_30min_description"
    },
    "1h": {
      pois: ["castillo-nalda", "arco-villa", "mirador-cameros"],
      distance_km: 2.5,
      descriptionKey: "duration_1h_description"
    },
    "1h30": {
      pois: ["castillo-nalda", "arco-villa", "mirador-cameros", "cuevas-palomares"],
      distance_km: 4.5,
      descriptionKey: "duration_1h30_description"
    },
    "2h": {
      pois: ["castillo-nalda", "arco-villa", "mirador-cameros", "cuevas-palomares", "ermita-villavieja"],
      distance_km: 6.5,
      descriptionKey: "duration_2h_description"
    }
  },
  difficulties: {
    "novato": { points_per_test: 100, free_hints: 2, easy_mode_geofence_m: 50 },
    "explorador": { points_per_test: 150, free_hints: 1, easy_mode_geofence_m: 25 },
    "maestro": { points_per_test: 250, free_hints: 0, easy_mode_geofence_m: 0 }
  }
};

const storyZorboObj = {
  id: "expediente-zorbo",
  title: "El Expediente Iregua: Zorbo el Marciano",
  icon: "👽",
  summary: "Una investigación cósmico-absurda junto a Zorbo, un marciano extraviado que confunde Nalda con una base espacial alienígena.",
  narrative: "¡Saludos, espécimen bípedo! Soy Zorbo, del sector estelar ZX-4. Mi nave se averió en el Valle del Iregua. Mis escáneres detectan que Nalda es un nodo de energía cósmica... ¡Ayúdame a recalibrar la nave antes de que se enteren en mi planeta!",
  mission: "Ayudar a Zorbo a decodificar las anomalías geológicas e históricas de Nalda para recargar los propulsores de su platillo volante.",
  narratorName: "Zorbo el Marciano",
  narratorRole: "Científico extraviado del cuadrante galáctico ZX-4",
  narratorTone: "Absurdo, cósmico, intrigado y perplejo por las costumbres de La Rioja",
  narratorAvatar: "👽",
  voiceName: "Zephyr",
  characterBio: "Extraterrestre verde con tres ojos y antena oscilante. Cree firmemente que los viñedos son paneles fotosintéticos de recarga y que el Castillo de Nalda fue una rampa de despegue medieval.",
  characterGreeting: "¡Bip-bop! Saludos, humano terrícola. Mis sensores marcan lecturas insólitas en este valle fluvial. ¿Eres tú mi contacto local de Nalda?",
  guide: storyZorboDef.guide,
  durations: storyZorboDef.durations,
  difficulties: storyZorboDef.difficulties
};

// Riddles for Story 3 (Zorbo)
const zorboRiddles = [
  {
    id: "zorbo-t1-castillo",
    poiId: "castillo-nalda",
    storyId: "expediente-zorbo",
    name: "La Rampa de Lanzamiento Medieval",
    difficulty: "novato",
    question: "¡Por las lunas de Júpiter! La elevación de este castillo ofrece un ángulo de reentrada orbital perfecto. ¿En qué siglo terrícola se construyó la fortaleza defensiva de Nalda?",
    type: "test",
    options: ["Siglo X (Edad Media)", "Siglo XIII (Edad Media)", "Siglo XX (Era Espacial)", "Año 3000"],
    answer: "Siglo XIII (Edad Media)",
    hints: ["Fue durante la época de los Señores de Cameros en el medievo.", "Alrededor del año 1200-1300."],
    staticHints: ["Siglo XIII medieval", "Época de los Haro"],
    points: 100,
    correctIndex: 1
  },
  {
    id: "zorbo-t2-arco",
    poiId: "arco-villa",
    storyId: "expediente-zorbo",
    name: "El Portal de Cuarzo y Caliza",
    difficulty: "explorador",
    question: "Mis escáneres registran una curvatura geométrica perfecta en este arco. En la cultura terrícola, ¿para qué servía esta compuerta de la villa amurallada?",
    type: "text",
    answer: "Control y defensa de acceso a la población",
    acceptedAnswers: ["defensa", "control de acceso", "puerta de muralla", "entrada a la villa", "proteger la villa", "portal amurallado"],
    hints: ["Evitaba que enemigos o forasteros entraran sin permiso.", "Control de paso."],
    staticHints: ["Control de acceso defensivo", "Puerta amurallada"],
    points: 150
  },
  {
    id: "zorbo-t3-mirador",
    poiId: "mirador-cameros",
    storyId: "expediente-zorbo",
    name: "Sensor Óptico Puerta de Cameros",
    difficulty: "maestro",
    question: "Desde este puesto de observación se domina el relieve de la comarca. ¿Cómo denominan los nativos a esta comarca montañosa al sur de Nalda?",
    type: "text",
    answer: "Cameros",
    acceptedAnswers: ["cameros", "tierra de cameros", "valle de cameros", "sierra de cameros"],
    hints: ["El mismo mirador lleva su nombre.", "Empieza por C."],
    staticHints: ["Comarca de Cameros", "Cameros"],
    points: 250
  },
  {
    id: "zorbo-t4-palomares",
    poiId: "cuevas-palomares",
    storyId: "expediente-zorbo",
    name: "Matriz Biológica de Silicio",
    difficulty: "explorador",
    question: "¡Fascinante! Cientos de hornacinas cúbicas excavadas en la pared de roca. ¿A qué bípedos con alas alberga hoy este complejo?",
    type: "test",
    options: ["Palomas bravías y torcaces", "Murciélagos de titanio", "Drones de reconocimiento", "Dragones del Iregua"],
    answer: "Palomas bravías y torcaces",
    hints: ["Son aves comunes de plumas grises.", "El propio nombre del sitio lo indica: Los Palomares."],
    staticHints: ["Aves de Los Palomares", "Palomas"],
    points: 150,
    correctIndex: 0
  },
  {
    id: "zorbo-t5-ermita",
    poiId: "ermita-villavieja",
    storyId: "expediente-zorbo",
    name: "El Transmisor de Villavieja",
    difficulty: "novato",
    question: "En las inmediaciones de esta ermita los humanos cultivan unas bayas púrpuras en espaldera para producir un combustible bebible. ¿Qué fruto es?",
    type: "test",
    options: ["Uva de viñedo de Rioja", "Criptonita silvestre", "Naranjas lunares", "Bayas de antimateria"],
    answer: "Uva de viñedo de Rioja",
    hints: ["Se cosecha en la vendimia de otoño.", "Da lugar al prestigioso vino riojano."],
    staticHints: ["Fruto de la vid", "Uva de Rioja"],
    points: 100,
    correctIndex: 0
  }
];

// -------------------------------------------------------------
// Merge Stories into Nalda Forest Pack
// -------------------------------------------------------------
const existingStoryIds = new Set(naldaForest.stories.map(s => s.id));

if (!existingStoryIds.has('banda-palomar')) {
  naldaForest.stories.push(storyChuchoObj);
}
if (!existingStoryIds.has('expediente-zorbo')) {
  naldaForest.stories.push(storyZorboObj);
}

// Add riddles
const existingRiddleIds = new Set(naldaForest.riddles.map(r => r.id));
[...chuchoRiddles, ...zorboRiddles].forEach(r => {
  if (!existingRiddleIds.has(r.id)) {
    naldaForest.riddles.push(r);
  }
});

// Update scene narratives
if (!naldaForest.sceneNarratives) naldaForest.sceneNarratives = {};
naldaForest.sceneNarratives["banda-palomar_castillo-nalda"] = "Chucho sobrevuela las almenas buscando migas y señalando la vista panorámica.";
naldaForest.sceneNarratives["banda-palomar_arco-villa"] = "Las palomas vigilan el arco de entrada como centinelas con plumas.";
naldaForest.sceneNarratives["banda-palomar_mirador-cameros"] = "El viento de Cameros levanta el vuelo de la bandada sobre el desfiladero.";
naldaForest.sceneNarratives["banda-palomar_cuevas-palomares"] = "¡El hogar supremo! El arrullo de docenas de palomas resuena en los nichos de roca.";
naldaForest.sceneNarratives["banda-palomar_ermita-villavieja"] = "Chucho se posa en la espadaña contemplando la tranquilidad de los viñedos.";

naldaForest.sceneNarratives["expediente-zorbo_castillo-nalda"] = "Zorbo apunta su escáner con pitidos agudos hacia las murallas del siglo XIII.";
naldaForest.sceneNarratives["expediente-zorbo_arco-villa"] = "Zorbo analiza la puerta de piedra sospechando un campo de contención terrícola.";
naldaForest.sceneNarratives["expediente-zorbo_mirador-cameros"] = "Zorbo calibra su brújula galáctica con la cordillera de Cameros de fondo.";
naldaForest.sceneNarratives["expediente-zorbo_cuevas-palomares"] = "Zorbo cree haber descubierto los camarotes de hibernación de una nave nodriza.";
naldaForest.sceneNarratives["expediente-zorbo_ermita-villavieja"] = "Zorbo degusta la atmósfera tranquila y registra el néctar de las vides riojanas.";

// Update forests.json, forest-packs-seed.json, data/forest-packs-seed.json
fs.writeFileSync(forestsPath, JSON.stringify(forests, null, 2), 'utf-8');
fs.writeFileSync(path.resolve('forest-packs-seed.json'), JSON.stringify(forests, null, 2), 'utf-8');
fs.writeFileSync(path.resolve('data/forest-packs-seed.json'), JSON.stringify(forests, null, 2), 'utf-8');
console.log('Successfully updated forests.json with all 4 Nalda stories!');

// -------------------------------------------------------------
// New i18n Translations in ES, FR, EN
// -------------------------------------------------------------
const newI18nKeys = {
  // Story 2: La Banda del Palomar
  "story_palomar_title": {
    "es": "La Banda del Palomar",
    "fr": "La Bande du Pigeonnier",
    "en": "The Pigeon Flock Gang"
  },
  "guide_chucho_name": {
    "es": "Chucho el Palomo",
    "fr": "Chucho le Pigeon",
    "en": "Chucho the Pigeon"
  },
  "guide_chucho_persona": {
    "es": "Paloma líder de la bandada que anida en las oquedades medievales de Los Palomares. Conoce cada cornisa, teja y rincón secreto de Nalda a vista de pájaro.",
    "fr": "Chef pigeon du troupeau nichant dans les cavités médiévales de Los Palomares. Connaît chaque corniche de Nalda à vol d'oiseau.",
    "en": "Leader pigeon of the flock nesting in the medieval cliff niches of Los Palomares. Knows every rooftop of Nalda from a bird's eye view."
  },
  "guide_chucho_greeting": {
    "es": "¡Epa, plumas! Soy Chucho el Palomo. ¿Vienes a caminar o a que te eche una pata la mejor paloma de La Rioja? ¡Vuelo rasante y al lío!",
    "fr": "Salut les plumes ! Je suis Chucho le Pigeon. Tu viens marcher ou te faire guider par le meilleur pigeon de La Rioja ? Vol rasant et c'est parti !",
    "en": "Hey feather-heads! I'm Chucho the Pigeon. Ready to walk or need a wing from the top pigeon in La Rioja? Low flight and let's roll!"
  },
  "guide_chucho_system_prompt": {
    "es": "Eres Chucho el Palomo, una paloma gamberra, canalla y callejera que anida en las Cuevas de Los Palomares de Nalda. Hablas rápido, con jerga callejera simpática ('plumas', 'al loro', 'a vista de pájaro'). Solo hablas de Nalda y de tu bandada.",
    "fr": "Tu es Chucho le Pigeon, un pigeon espiègle et débrouillard nichant dans les Grottes des Palomares à Nalda. Tu parles avec verve et humour de rue.",
    "en": "You are Chucho the Pigeon, a cheeky street-smart pigeon nesting in the Palomares Caves of Nalda. You speak fast with friendly street slang ('feathers', 'keep eyes peeled')."
  },

  // Story 3: El Expediente Iregua: Zorbo el Marciano
  "story_zorbo_title": {
    "es": "El Expediente Iregua: Zorbo el Marciano",
    "fr": "Le Dossier Iregua : Zorbo le Martien",
    "en": "The Iregua Files: Zorbo the Martian"
  },
  "guide_zorbo_name": {
    "es": "Zorbo el Marciano",
    "fr": "Zorbo le Martien",
    "en": "Zorbo the Martian"
  },
  "guide_zorbo_persona": {
    "es": "Extraterrestre verde con tres ojos y antena oscilante. Cree firmemente que los viñedos son paneles fotosintéticos de recarga y que el Castillo de Nalda fue una rampa de despegue medieval.",
    "fr": "Extraterrestre vert à trois yeux et antenne oscillante. Pense que le château de Nalda était une rampe de lancement médiévale.",
    "en": "Green extraterrestrial with three eyes and a wobbly antenna. Believes the Castle of Nalda was a medieval launchpad."
  },
  "guide_zorbo_greeting": {
    "es": "¡Bip-bop! Saludos, humano terrícola. Mis sensores marcan lecturas insólitas en este valle fluvial. ¿Eres tú mi contacto local de Nalda?",
    "fr": "Bip-bop ! Salutations, humain terrien. Mes capteurs détectent des anomalies insolites dans cette vallée fluviale. Es-tu mon contact local à Nalda ?",
    "en": "Beep-bop! Greetings, Earth human. My quantum sensors detect strange readings in this river valley. Are you my local Nalda contact?"
  },
  "guide_zorbo_system_prompt": {
    "es": "Eres Zorbo el Marciano, un científico alienígena extraviado en el valle del Iregua. Confundes con humor absurdo la historia y paisajes de Nalda con alta tecnología espacial.",
    "fr": "Tu es Zorbo le Martien, un scientifique extraterrestre égaré dans la vallée de l'Iregua. Tu confonds avec un humour absurde l'histoire de Nalda avec la technologie spatiale.",
    "en": "You are Zorbo the Martian, an alien scientist lost in the Iregua valley. You humorously mistake Nalda's historical stone heritage for cosmic tech."
  }
};

// Merge into i18n
function mergeTranslations(filePath) {
  const i18n = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!i18n.ui) i18n.ui = { es: {}, fr: {}, en: {} };
  if (!i18n.keys) i18n.keys = {};

  for (const [k, val] of Object.entries(newI18nKeys)) {
    i18n.ui.es[k] = val.es;
    i18n.ui.fr[k] = val.fr;
    i18n.ui.en[k] = val.en;
    i18n.keys[k] = val;
  }

  fs.writeFileSync(filePath, JSON.stringify(i18n, null, 2), 'utf-8');
  console.log(`Merged new translations into ${filePath}`);
}

mergeTranslations(path.resolve('src/data/i18n.json'));
mergeTranslations(path.resolve('i18n.json'));

console.log('All 4 Nalda stories fully synchronized in database and i18n!');
