import fs from 'fs';
import path from 'path';

// Load existing forests and i18n
const forestsPath = path.resolve('data/forests.json');
const forests = JSON.parse(fs.readFileSync(forestsPath, 'utf-8'));

// The Nalda pack seed from user
const naldaPackSeed = {
  "id": "nalda",
  "region": "La Rioja, España",
  "country": "ES",
  "center": { "lat": 42.3351, "lng": -2.4883 },
  "nameKey": "forest_nalda_name",
  "descriptionKey": "forest_nalda_description",
  "pois": [
    {
      "id": "castillo-nalda",
      "emoji": "🏰",
      "nameKey": "poi_castillo_name",
      "coords": { "lat": 42.3351, "lng": -2.4883 },
      "stories": ["guardian-iregua", "fraile-botijo"],
      "ar": {
        "type": "3d_reconstruction",
        "model": "torre_homenaje_v1.glb",
        "trigger": "camera_poi",
        "descriptionKey": "ar_castillo_description"
      }
    },
    {
      "id": "arco-villa",
      "emoji": "⛪",
      "nameKey": "poi_arco_name",
      "coords": { "lat": 42.3342, "lng": -2.4869 },
      "stories": ["guardian-iregua", "fraile-botijo"],
      "ar": {
        "type": "temporal_portal",
        "model": "vigias_medievales_v1.glb",
        "trigger": "cross_arch",
        "descriptionKey": "ar_arco_description"
      }
    },
    {
      "id": "mirador-cameros",
      "emoji": "🌄",
      "nameKey": "poi_mirador_name",
      "coords": { "lat": 42.3215, "lng": -2.4910 },
      "stories": ["guardian-iregua", "fraile-botijo"],
      "ar": {
        "type": "overlay_labels",
        "model": "valle_labels_v1.json",
        "trigger": "camera_horizon",
        "descriptionKey": "ar_mirador_description"
      }
    },
    {
      "id": "cuevas-palomares",
      "emoji": "🕳️",
      "nameKey": "poi_cuevas_name",
      "coords": { "lat": 42.3373, "lng": -2.4788 },
      "stories": ["guardian-iregua", "fraile-botijo"],
      "ar": {
        "type": "animated_character",
        "model": "paloma_3d_v1.glb",
        "trigger": "camera_cave_entrance",
        "descriptionKey": "ar_cuevas_description"
      }
    },
    {
      "id": "ermita-villavieja",
      "emoji": "🌳",
      "nameKey": "poi_ermita_name",
      "coords": { "lat": 42.3270, "lng": -2.4770 },
      "stories": ["guardian-iregua", "fraile-botijo"],
      "ar": {
        "type": "virtual_still_life",
        "model": "cesta_vendimia_v1.glb",
        "trigger": "camera_ermita",
        "descriptionKey": "ar_ermita_description"
      }
    }
  ],
  "stories": [
    {
      "id": "guardian-iregua",
      "titleKey": "story_guardian_title",
      "guide": {
        "id": "cronicon",
        "nameKey": "guide_cronicon_name",
        "personaKey": "guide_cronicon_persona",
        "systemPromptKey": "guide_cronicon_system_prompt",
        "knowledgeBase": [
          "castillo_nalda_historia.json",
          "cuevas_palomares.json",
          "iregua_rio.json",
          "senorio_cameros.json",
          "vinedos_rioja.json"
        ],
        "voice": "es-ES-Wavenet-M",
        "greetingKey": "guide_cronicon_greeting"
      },
      "durations": {
        "30min": {
          "pois": ["castillo-nalda", "arco-villa"],
          "distance_km": 0.8,
          "descriptionKey": "duration_30min_description"
        },
        "1h": {
          "pois": ["castillo-nalda", "arco-villa", "mirador-cameros"],
          "distance_km": 2.5,
          "descriptionKey": "duration_1h_description"
        },
        "1h30": {
          "pois": ["castillo-nalda", "arco-villa", "mirador-cameros", "cuevas-palomares"],
          "distance_km": 4.5,
          "descriptionKey": "duration_1h30_description"
        },
        "2h": {
          "pois": ["castillo-nalda", "arco-villa", "mirador-cameros", "cuevas-palomares", "ermita-villavieja"],
          "distance_km": 6.5,
          "descriptionKey": "duration_2h_description"
        }
      },
      "difficulties": {
        "novato": { "points_per_test": 100, "free_hints": 2, "easy_mode_geofence_m": 50 },
        "explorador": { "points_per_test": 150, "free_hints": 1, "easy_mode_geofence_m": 25 },
        "maestro": { "points_per_test": 250, "free_hints": 0, "easy_mode_geofence_m": 0 }
      },
      "tests": [
        {
          "id": "t1-1",
          "poi": "castillo-nalda",
          "difficulty": "novato",
          "type": "test",
          "questionKey": "t1_1_question",
          "optionsKeys": ["t1_1_opt_a", "t1_1_opt_b", "t1_1_opt_c", "t1_1_opt_d"],
          "correctIndex": 1,
          "hintsKeys": ["t1_1_hint1", "t1_1_hint2", "t1_1_hint3"],
          "points": 100
        },
        {
          "id": "t1-2",
          "poi": "castillo-nalda",
          "difficulty": "explorador",
          "type": "text",
          "questionKey": "t1_2_question",
          "answersKeys": ["t1_2_ans1", "t1_2_ans2", "t1_2_ans3"],
          "hintsKeys": ["t1_2_hint1", "t1_2_hint2", "t1_2_hint3"],
          "points": 150
        },
        {
          "id": "t1-3",
          "poi": "castillo-nalda",
          "difficulty": "maestro",
          "type": "text",
          "questionKey": "t1_3_question",
          "answersKeys": ["t1_3_ans1", "t1_3_ans2", "t1_3_ans3"],
          "hintsKeys": ["t1_3_hint1", "t1_3_hint2", "t1_3_hint3"],
          "points": 250
        },
        {
          "id": "t2-1",
          "poi": "arco-villa",
          "difficulty": "novato",
          "type": "test",
          "questionKey": "t2_1_question",
          "optionsKeys": ["t2_1_opt_a", "t2_1_opt_b", "t2_1_opt_c", "t2_1_opt_d"],
          "correctIndex": 1,
          "hintsKeys": ["t2_1_hint1", "t2_1_hint2", "t2_1_hint3"],
          "points": 100
        },
        {
          "id": "t2-2",
          "poi": "arco-villa",
          "difficulty": "explorador",
          "type": "text",
          "questionKey": "t2_2_question",
          "answersKeys": ["t2_2_ans1", "t2_2_ans2", "t2_2_ans3"],
          "hintsKeys": ["t2_2_hint1", "t2_2_hint2", "t2_2_hint3"],
          "points": 150
        },
        {
          "id": "t2-3",
          "poi": "arco-villa",
          "difficulty": "maestro",
          "type": "text",
          "questionKey": "t2_3_question",
          "answersKeys": ["t2_3_ans1", "t2_3_ans2"],
          "hintsKeys": ["t2_3_hint1", "t2_3_hint2", "t2_3_hint3"],
          "points": 250
        },
        {
          "id": "t3-1",
          "poi": "mirador-cameros",
          "difficulty": "novato",
          "type": "test",
          "questionKey": "t3_1_question",
          "optionsKeys": ["t3_1_opt_a", "t3_1_opt_b", "t3_1_opt_c", "t3_1_opt_d"],
          "correctIndex": 1,
          "hintsKeys": ["t3_1_hint1", "t3_1_hint2", "t3_1_hint3"],
          "points": 100
        },
        {
          "id": "t3-2",
          "poi": "mirador-cameros",
          "difficulty": "explorador",
          "type": "text",
          "questionKey": "t3_2_question",
          "answersKeys": ["t3_2_ans1", "t3_2_ans2", "t3_2_ans3"],
          "hintsKeys": ["t3_2_hint1", "t3_2_hint2", "t3_2_hint3"],
          "points": 150
        },
        {
          "id": "t3-3",
          "poi": "mirador-cameros",
          "difficulty": "maestro",
          "type": "text",
          "questionKey": "t3_3_question",
          "answersKeys": ["t3_3_ans1", "t3_3_ans2", "t3_3_ans3"],
          "hintsKeys": ["t3_3_hint1", "t3_3_hint2", "t3_3_hint3"],
          "points": 250
        },
        {
          "id": "t4-1",
          "poi": "cuevas-palomares",
          "difficulty": "novato",
          "type": "test",
          "questionKey": "t4_1_question",
          "optionsKeys": ["t4_1_opt_a", "t4_1_opt_b", "t4_1_opt_c", "t4_1_opt_d"],
          "correctIndex": 1,
          "hintsKeys": ["t4_1_hint1", "t4_1_hint2", "t4_1_hint3"],
          "points": 100
        },
        {
          "id": "t4-2",
          "poi": "cuevas-palomares",
          "difficulty": "explorador",
          "type": "text",
          "questionKey": "t4_2_question",
          "answersKeys": ["t4_2_ans1", "t4_2_ans2", "t4_2_ans3", "t4_2_ans4"],
          "hintsKeys": ["t4_2_hint1", "t4_2_hint2", "t4_2_hint3"],
          "points": 150
        },
        {
          "id": "t4-3",
          "poi": "cuevas-palomares",
          "difficulty": "maestro",
          "type": "text",
          "questionKey": "t4_3_question",
          "answersKeys": ["t4_3_ans1", "t4_3_ans2", "t4_3_ans3", "t4_3_ans4"],
          "hintsKeys": ["t4_3_hint1", "t4_3_hint2", "t4_3_hint3"],
          "points": 250
        },
        {
          "id": "t5-1",
          "poi": "ermita-villavieja",
          "difficulty": "explorador",
          "type": "text",
          "questionKey": "t5_1_question",
          "answersKeys": ["t5_1_ans1", "t5_1_ans2", "t5_1_ans3", "t5_1_ans4"],
          "hintsKeys": ["t5_1_hint1", "t5_1_hint2", "t5_1_hint3"],
          "points": 150
        },
        {
          "id": "t5-2",
          "poi": "ermita-villavieja",
          "difficulty": "maestro",
          "type": "text",
          "questionKey": "t5_2_question",
          "answersKeys": ["t5_2_ans1", "t5_2_ans2"],
          "hintsKeys": ["t5_2_hint1", "t5_2_hint2", "t5_2_hint3"],
          "points": 250
        }
      ],
      "extraTests": [
        {
          "id": "extra-foto-castillo",
          "poi": "castillo-nalda",
          "type": "photo",
          "titleKey": "extra_foto_castillo_title",
          "descriptionKey": "extra_foto_castillo_description",
          "points": 50
        },
        {
          "id": "extra-escucha-mirador",
          "poi": "mirador-cameros",
          "type": "listen",
          "titleKey": "extra_escucha_mirador_title",
          "descriptionKey": "extra_escucha_mirador_description",
          "points": 50
        },
        {
          "id": "extra-brujula-mirador",
          "poi": "mirador-cameros",
          "type": "compass",
          "titleKey": "extra_brujula_mirador_title",
          "descriptionKey": "extra_brujula_mirador_description",
          "points": 50
        },
        {
          "id": "extra-ordena-camino",
          "poi": "castillo-nalda",
          "type": "order",
          "titleKey": "extra_ordena_camino_title",
          "descriptionKey": "extra_ordena_camino_description",
          "points": 50
        },
        {
          "id": "extra-escucha-cuevas",
          "poi": "cuevas-palomares",
          "type": "listen",
          "titleKey": "extra_escucha_cuevas_title",
          "descriptionKey": "extra_escucha_cuevas_description",
          "points": 50
        }
      ],
      "metaEnigma": {
        "titleKey": "meta_enigma_title",
        "descriptionKey": "meta_enigma_description",
        "fragments": ["N", "A", "L", "D", "A"]
      }
    }
  ]
};

// nalda-i18n.json texts
const naldaI18n = {
  "forest_nalda_name": {
    "es": "Nalda — El Guardián del Iregua",
    "fr": "Nalda — Le Gardien de l'Iregua",
    "en": "Nalda — The Guardian of the Iregua"
  },
  "forest_nalda_description": {
    "es": "Un bosque de historia, piedra y río en el Valle del Iregua.",
    "fr": "Une forêt d'histoire, de pierre et de rivière dans la vallée de l'Iregua.",
    "en": "A forest of history, stone and river in the Iregua Valley."
  },
  "poi_castillo_name": {
    "es": "Castillo de Nalda",
    "fr": "Château de Nalda",
    "en": "Nalda Castle"
  },
  "poi_arco_name": {
    "es": "Arco de la Villa",
    "fr": "Arche de la Villa",
    "en": "Village Arch"
  },
  "poi_mirador_name": {
    "es": "Mirador Puerta de Cameros",
    "fr": "Belvédère Porte de Cameros",
    "en": "Puerta de Cameros Viewpoint"
  },
  "poi_cuevas_name": {
    "es": "Cuevas de Los Palomares",
    "fr": "Grottes de Los Palomares",
    "en": "Los Palomares Caves"
  },
  "poi_ermita_name": {
    "es": "Ermita de Nuestra Señora de Villavieja",
    "fr": "Ermitage de Notre-Dame de Villavieja",
    "en": "Villavieja Hermitage"
  },
  "ar_castillo_description": {
    "es": "Reconstrucción 3D de la torre del homenaje superpuesta sobre las ruinas actuales.",
    "fr": "Reconstruction 3D de la tour du hommage superposée aux ruines actuelles.",
    "en": "3D reconstruction of the keep overlaid on the current ruins."
  },
  "ar_arco_description": {
    "es": "Al cruzar el arco, aparecen figuras de vigías medievales.",
    "fr": "En traversant l'arche, des figures de guetteurs médiévaux apparaissent.",
    "en": "Medieval watchmen appear when crossing the arch."
  },
  "ar_mirador_description": {
    "es": "Etiquetas flotantes de los pueblos del valle y la ruta romana.",
    "fr": "Étiquettes flottantes des villages de la vallée et de la voie romaine.",
    "en": "Floating labels of valley villages and the Roman road."
  },
  "ar_cuevas_description": {
    "es": "Paloma 3D animada que vuela hacia las hornacinas. Al tocarla, da una pista.",
    "fr": "Colombe 3D animée qui vole vers les niches. En la touchant, elle donne un indice.",
    "en": "Animated 3D dove flying to the niches. Touch it for a hint."
  },
  "ar_ermita_description": {
    "es": "Cesta de vendimia 3D con uvas de la Rioja. Al tocarla, reproduce audio de campanas.",
    "fr": "Panier de vendange 3D avec raisins de La Rioja. En le touchant, audio de cloches.",
    "en": "3D harvest basket with Rioja grapes. Touch it to play bell audio."
  },
  "story_guardian_title": {
    "es": "El Guardián del Iregua",
    "fr": "Le Gardien de l'Iregua",
    "en": "The Guardian of the Iregua"
  },
  "guide_cronicon_name": {
    "es": "El Cronicón",
    "fr": "Le Cronicón",
    "en": "The Cronicón"
  },
  "guide_cronicon_persona": {
    "es": "Monje copista del siglo XIV del Monasterio de San Millán de la Cogolla. Habla con respeto y usa refranes antiguos.",
    "fr": "Moine copiste du XIVe siècle du monastère de San Millán de la Cogolla. Parle avec respect et utilise de vieux proverbes.",
    "en": "14th-century monk copyist from San Millán de la Cogolla Monastery. Speaks respectfully and uses old proverbs."
  },
  "guide_cronicon_system_prompt": {
    "es": "Eres El Cronicón, un monje copista del siglo XIV del Monasterio de San Millán de la Cogolla. Hablas con respeto y usas refranes antiguos. Solo respondes sobre Nalda, su historia, naturaleza y el juego. Si te preguntan algo fuera de tema, redirige a la aventura.",
    "fr": "Tu es Le Cronicón, un moine copiste du XIVe siècle du monastère de San Millán de la Cogolla. Tu parles avec respect et utilises de vieux proverbes. Tu ne réponds que sur Nalda, son histoire, sa nature et le jeu. Si on te pose une question hors sujet, redirige vers l'aventure.",
    "en": "You are The Cronicón, a 14th-century monk copyist from San Millán de la Cogolla Monastery. You speak respectfully and use old proverbs. You only answer about Nalda, its history, nature and the game. If asked something off-topic, redirect to the adventure."
  },
  "guide_cronicon_greeting": {
    "es": "Bienvenido, aprendiz. Soy el Cronicón, y estas piedras guardan memoria.",
    "fr": "Bienvenue, apprenti. Je suis le Cronicón, et ces pierres gardent la mémoire.",
    "en": "Welcome, apprentice. I am the Cronicón, and these stones keep memory."
  },
  "duration_30min_description": {
    "es": "Paseo corto ideal para familias con niños pequeños.",
    "fr": "Courte promenade idéale pour les familles avec jeunes enfants.",
    "en": "Short walk ideal for families with young children."
  },
  "duration_1h_description": {
    "es": "Parejas o grupos con poco tiempo.",
    "fr": "Couples ou groupes pressés.",
    "en": "Couples or groups with little time."
  },
  "duration_1h30_description": {
    "es": "Familias y exploradores ocasionales.",
    "fr": "Familles et explorateurs occasionnels.",
    "en": "Families and casual explorers."
  },
  "duration_2h_description": {
    "es": "Senderistas, grupos escolares y expertos.",
    "fr": "Randonneurs, groupes scolaires et experts.",
    "en": "Hikers, school groups and experts."
  },
  "t1_1_question": {
    "es": "¿Quién fue el noble que estuvo prisionero aquí en 1299?",
    "fr": "Qui était le noble emprisonné ici en 1299 ?",
    "en": "Who was the noble imprisoned here in 1299?"
  },
  "t1_1_opt_a": { "es": "Ramírez de Arellano", "fr": "Ramírez de Arellano", "en": "Ramírez de Arellano" },
  "t1_1_opt_b": { "es": "Juan Núñez de Lara", "fr": "Juan Núñez de Lara", "en": "Juan Núñez de Lara" },
  "t1_1_opt_c": { "es": "Pedro I", "fr": "Pedro I", "en": "Pedro I" },
  "t1_1_opt_d": { "es": "Enrique II", "fr": "Enrique II", "en": "Enrique II" },
  "t1_1_hint1": {
    "es": "Perdió una batalla entre Araciel y Alfaro.",
    "fr": "Il a perdu une bataille entre Araciel et Alfaro.",
    "en": "He lost a battle between Araciel and Alfaro."
  },
  "t1_1_hint2": {
    "es": "Atacó tierras del obispado de Calahorra.",
    "fr": "Il a attaqué les terres de l'évêché de Calahorra.",
    "en": "He attacked lands of the Calahorra bishopric."
  },
  "t1_1_hint3": {
    "es": "Su apellido empieza por Núñez.",
    "fr": "Son nom commence par Núñez.",
    "en": "His surname starts with Núñez."
  },
  "t1_2_question": {
    "es": "El castillo tenía un sistema de aljibes. ¿Qué función cumplían en caso de asedio?",
    "fr": "Le château avait un système de citernes. Quelle fonction avaient-elles en cas de siège ?",
    "en": "The castle had a cistern system. What was their function during a siege?"
  },
  "t1_2_ans1": { "es": "almacenar agua", "fr": "stocker de l'eau", "en": "store water" },
  "t1_2_ans2": { "es": "abastecer de agua", "fr": "alimenter en eau", "en": "supply water" },
  "t1_2_ans3": { "es": "guardar agua", "fr": "garder de l'eau", "en": "keep water" },
  "t1_2_hint1": {
    "es": "Piensa en lo que necesitas para sobrevivir.",
    "fr": "Pensez à ce dont vous avez besoin pour survivre.",
    "en": "Think about what you need to survive."
  },
  "t1_2_hint2": {
    "es": "Sin agua, no hay resistencia.",
    "fr": "Sans eau, pas de résistance.",
    "en": "Without water, no resistance."
  },
  "t1_2_hint3": {
    "es": "Se llenaban con agua de lluvia.",
    "fr": "Ils se remplissaient d'eau de pluie.",
    "en": "They were filled with rainwater."
  },
  "t1_3_question": {
    "es": "¿Qué rey mató a su hermanastro con un puñal tras la batalla de Montiel?",
    "fr": "Quel roi a tué son demi-frère avec un poignard après la bataille de Montiel ?",
    "en": "Which king killed his half-brother with a dagger after the Battle of Montiel?"
  },
  "t1_3_ans1": { "es": "Enrique II", "fr": "Enrique II", "en": "Enrique II" },
  "t1_3_ans2": { "es": "Enrique de Trastámara", "fr": "Enrique de Trastámara", "en": "Enrique de Trastámara" },
  "t1_3_ans3": { "es": "Enrique II de Trastámara", "fr": "Enrique II de Trastámara", "en": "Enrique II of Trastámara" },
  "t1_3_hint1": { "es": "Fue en 1369.", "fr": "C'était en 1369.", "en": "It was in 1369." },
  "t1_3_hint2": {
    "es": "El muerto era Pedro I el Cruel.",
    "fr": "Le mort était Pedro I le Cruel.",
    "en": "The dead man was Pedro I the Cruel."
  },
  "t1_3_hint3": {
    "es": "El asesino fundó la dinastía Trastámara.",
    "fr": "L'assassin a fondé la dynastie Trastámara.",
    "en": "The killer founded the Trastámara dynasty."
  },
  "t2_1_question": {
    "es": "¿Qué delimitaba el Arco de la Villa?",
    "fr": "Que délimitait l'Arche de la Villa ?",
    "en": "What did the Village Arch delimit?"
  },
  "t2_1_opt_a": { "es": "El bosque", "fr": "La forêt", "en": "The forest" },
  "t2_1_opt_b": { "es": "La entrada al recinto amurallado", "fr": "L'entrée de l'enceinte fortifiée", "en": "The entrance to the walled enclosure" },
  "t2_1_opt_c": { "es": "La frontera con Navarra", "fr": "La frontière avec la Navarre", "en": "The border with Navarre" },
  "t2_1_opt_d": { "es": "El inicio del Camino de Santiago", "fr": "Le début du chemin de Saint-Jacques", "en": "The start of the Camino de Santiago" },
  "t2_1_hint1": { "es": "Era una puerta de acceso.", "fr": "C'était une porte d'accès.", "en": "It was an access gate." },
  "t2_1_hint2": { "es": "Protegía la villa.", "fr": "Elle protégeait le village.", "en": "It protected the village." },
  "t2_1_hint3": { "es": "Había murallas alrededor.", "fr": "Il y avait des remparts autour.", "en": "There were walls around." },
  "t2_2_question": {
    "es": "¿Qué familia noble fue señora de Cameros y Nalda desde el siglo XIV?",
    "fr": "Quelle famille noble était seigneure de Cameros et Nalda depuis le XIVe siècle ?",
    "en": "Which noble family was lady of Cameros and Nalda since the 14th century?"
  },
  "t2_2_ans1": { "es": "Ramírez de Arellano", "fr": "Ramírez de Arellano", "en": "Ramírez de Arellano" },
  "t2_2_ans2": { "es": "Arellano", "fr": "Arellano", "en": "Arellano" },
  "t2_2_ans3": { "es": "los Arellano", "fr": "les Arellano", "en": "the Arellano" },
  "t2_2_hint1": {
    "es": "Su nombre aparece en documentos del castillo.",
    "fr": "Leur nom apparaît dans les documents du château.",
    "en": "Their name appears in castle documents."
  },
  "t2_2_hint2": { "es": "Empieza por Ramírez.", "fr": "Commence par Ramírez.", "en": "Starts with Ramírez." },
  "t2_2_hint3": {
    "es": "Fueron señores de un territorio que llegaba hasta Soria.",
    "fr": "Ils étaient seigneurs d'un territoire allant jusqu'à Soria.",
    "en": "They ruled a territory reaching Soria."
  },
  "t2_3_question": {
    "es": "Anagrama: R A L O M P A → ordena para formar el nombre de las cuevas que visitarás después.",
    "fr": "Anagramme : R A L O M P A → réorganisez pour former le nom des grottes que vous visiterez ensuite.",
    "en": "Anagram: R A L O M P A → rearrange to form the name of the caves you'll visit next."
  },
  "t2_3_ans1": { "es": "PALOMAR", "fr": "PALOMAR", "en": "PALOMAR" },
  "t2_3_ans2": { "es": "palomar", "fr": "palomar", "en": "palomar" },
  "t2_3_hint1": {
    "es": "Es el nombre de un lugar con palomas.",
    "fr": "C'est le nom d'un lieu avec des colombes.",
    "en": "It's the name of a place with doves."
  },
  "t2_3_hint2": { "es": "Empieza por P.", "fr": "Commence par P.", "en": "Starts with P." },
  "t2_3_hint3": { "es": "Tiene 7 letras.", "fr": "Il a 7 lettres.", "en": "It has 7 letters." },
  "t3_1_question": {
    "es": "¿Cómo se llama el río que atraviesa este valle?",
    "fr": "Comment s'appelle la rivière qui traverse cette vallée ?",
    "en": "What is the name of the river crossing this valley?"
  },
  "t3_1_opt_a": { "es": "Ebro", "fr": "Ebro", "en": "Ebro" },
  "t3_1_opt_b": { "es": "Iregua", "fr": "Iregua", "en": "Iregua" },
  "t3_1_opt_c": { "es": "Leza", "fr": "Leza", "en": "Leza" },
  "t3_1_opt_d": { "es": "Cidacos", "fr": "Cidacos", "en": "Cidacos" },
  "t3_1_hint1": {
    "es": "Nace en la Sierra de Cebollera.",
    "fr": "Il naît dans la Sierra de Cebollera.",
    "en": "It is born in the Sierra de Cebollera."
  },
  "t3_1_hint2": { "es": "Es afluente del Ebro.", "fr": "C'est un affluent de l'Ebre.", "en": "It is a tributary of the Ebro." },
  "t3_1_hint3": { "es": "Su nombre tiene 6 letras.", "fr": "Son nom a 6 lettres.", "en": "Its name has 6 letters." },
  "t3_2_question": {
    "es": "Si el caudal medio es de 6,35 m³/s, ¿cuántos m³ pasan en 1 minuto?",
    "fr": "Si le débit moyen est de 6,35 m³/s, combien de m³ passent en 1 minute ?",
    "en": "If the average flow is 6.35 m³/s, how many m³ pass in 1 minute?"
  },
  "t3_2_ans1": { "es": "381", "fr": "381", "en": "381" },
  "t3_2_ans2": { "es": "381 m3", "fr": "381 m3", "en": "381 m3" },
  "t3_2_ans3": { "es": "381 metros cubicos", "fr": "381 mètres cubes", "en": "381 cubic meters" },
  "t3_2_hint1": { "es": "Un minuto = 60 segundos.", "fr": "Une minute = 60 secondes.", "en": "One minute = 60 seconds." },
  "t3_2_hint2": { "es": "Multiplica.", "fr": "Multipliez.", "en": "Multiply." },
  "t3_2_hint3": {
    "es": "El resultado está entre 380 y 382.",
    "fr": "Le résultat est entre 380 et 382.",
    "en": "The result is between 380 and 382."
  },
  "t3_3_question": {
    "es": "¿A qué región histórica daba acceso esta 'puerta'?",
    "fr": "À quelle région historique cette 'porte' donnait-elle accès ?",
    "en": "To which historical region did this 'gate' give access?"
  },
  "t3_3_ans1": { "es": "Cameros", "fr": "Cameros", "en": "Cameros" },
  "t3_3_ans2": { "es": "Señorío de Cameros", "fr": "Seigneurie de Cameros", "en": "Lordship of Cameros" },
  "t3_3_ans3": { "es": "Tierra de Cameros", "fr": "Terre de Cameros", "en": "Land of Cameros" },
  "t3_3_hint1": {
    "es": "El nombre del mirador lo dice.",
    "fr": "Le nom du belvédère le dit.",
    "en": "The viewpoint name says it."
  },
  "t3_3_hint2": { "es": "Era un señorío.", "fr": "C'était une seigneurie.", "en": "It was a lordship." },
  "t3_3_hint3": { "es": "Empieza por C.", "fr": "Commence par C.", "en": "Starts with C." },
  "t4_1_question": {
    "es": "¿Cuál era el uso principal de estas cuevas en los siglos XIV-XV?",
    "fr": "Quel était l'usage principal de ces grottes aux XIVe-XVe siècles ?",
    "en": "What was the main use of these caves in the 14th-15th centuries?"
  },
  "t4_1_opt_a": { "es": "Vivienda de ermitaños", "fr": "Habitat d'ermites", "en": "Hermit dwelling" },
  "t4_1_opt_b": { "es": "Criadero de palomas", "fr": "Élevage de colombes", "en": "Dove breeding" },
  "t4_1_opt_c": { "es": "Bodega", "fr": "Cave à vin", "en": "Wine cellar" },
  "t4_1_opt_d": { "es": "Refugio de bandoleros", "fr": "Refuge de bandits", "en": "Bandit refuge" },
  "t4_1_hint1": {
    "es": "El nombre de las cuevas te lo dice.",
    "fr": "Le nom des grottes vous le dit.",
    "en": "The cave name tells you."
  },
  "t4_1_hint2": {
    "es": "Las hornacinas servían para anidar.",
    "fr": "Les niches servaient à nicher.",
    "en": "The niches were for nesting."
  },
  "t4_1_hint3": {
    "es": "Las palomas eran fuente de alimento.",
    "fr": "Les colombes étaient une source de nourriture.",
    "en": "Doves were a food source."
  },
  "t4_2_question": {
    "es": "Las cuevas tienen varios niveles conectados por escaleras talladas en la roca. ¿Qué material usaron los excavadores para tallar estas cuevas?",
    "fr": "Les grottes ont plusieurs niveaux reliés par des escaliers taillés dans la roche. Quel matériau ont utilisé les excavateurs ?",
    "en": "The caves have several levels connected by stairs carved into the rock. What material did the diggers use?"
  },
  "t4_2_ans1": { "es": "piedra", "fr": "pierre", "en": "stone" },
  "t4_2_ans2": { "es": "roca", "fr": "roche", "en": "rock" },
  "t4_2_ans3": { "es": "arenisca", "fr": "grès", "en": "sandstone" },
  "t4_2_ans4": { "es": "piedra caliza", "fr": "calcaire", "en": "limestone" },
  "t4_2_hint1": {
    "es": "Es el material del que están hechas.",
    "fr": "C'est le matériau dont elles sont faites.",
    "en": "It's the material they're made of."
  },
  "t4_2_hint2": { "es": "Se extrae de canteras.", "fr": "Il est extrait de carrières.", "en": "It's extracted from quarries." },
  "t4_2_hint3": {
    "es": "Las paredes son del mismo material.",
    "fr": "Les murs sont du même matériau.",
    "en": "The walls are the same material."
  },
  "t4_3_question": {
    "es": "Las palomas mensajeras llevaban mensajes en un tubo atado a la pata. ¿Cómo se llama ese tubo en español?",
    "fr": "Les pigeons voyageurs portaient des messages dans un tube attaché à la patte. Comment s'appelle ce tube en espagnol ?",
    "en": "Carrier pigeons carried messages in a tube tied to the leg. What is that tube called in Spanish?"
  },
  "t4_3_ans1": { "es": "cápsula", "fr": "capsule", "en": "capsule" },
  "t4_3_ans2": { "es": "tubo portamensajes", "fr": "tube porte-messages", "en": "message tube" },
  "t4_3_ans3": { "es": "canuto", "fr": "canule", "en": "canule" },
  "t4_3_ans4": { "es": "capsula", "fr": "capsula", "en": "capsula" },
  "t4_3_hint1": { "es": "Es pequeño y hueco.", "fr": "Il est petit et creux.", "en": "It is small and hollow." },
  "t4_3_hint2": { "es": "Se ata con un hilo.", "fr": "Il s'attache avec un fil.", "en": "It is tied with a thread." },
  "t4_3_hint3": { "es": "Empieza por c o t.", "fr": "Commence par c ou t.", "en": "Starts with c or t." },
  "t5_1_question": {
    "es": "Nalda es tierra de viñedos (Rioja). ¿En qué mes se vendimia tradicionalmente?",
    "fr": "Nalda est une terre de vignobles (Rioja). En quel mois vendange-t-on traditionnellement ?",
    "en": "Nalda is vineyard land (Rioja). In which month is the grape harvest traditionally?"
  },
  "t5_1_ans1": { "es": "septiembre", "fr": "septembre", "en": "September" },
  "t5_1_ans2": { "es": "setiembre", "fr": "setiembre", "en": "setiembre" },
  "t5_1_ans3": { "es": "finales de septiembre", "fr": "fin septembre", "en": "late September" },
  "t5_1_ans4": { "es": "septiembre-octubre", "fr": "septembre-octobre", "en": "September-October" },
  "t5_1_hint1": { "es": "Después del verano.", "fr": "Après l'été.", "en": "After summer." },
  "t5_1_hint2": {
    "es": "Coincide con la Fiesta de la Ciruela Reina Claudia.",
    "fr": "Coïncide avec la Fête de la Prune Reine Claude.",
    "en": "Coincides with the Reina Claudia Plum Festival."
  },
  "t5_1_hint3": { "es": "Es el noveno mes.", "fr": "C'est le neuvième mois.", "en": "It's the ninth month." },
  "t5_2_question": {
    "es": "Has recogido fragmentos en cada POI. Ordénalos para formar la frase final del Cronicón: 'El Iregua guarda la memoria de N A L D A'. Escribe la palabra que falta.",
    "fr": "Vous avez collecté des fragments à chaque POI. Réorganisez-les pour former la phrase finale du Cronicón : 'L'Iregua garde la mémoire de N A L D A'. Écrivez le mot manquant.",
    "en": "You collected fragments at each POI. Rearrange them to form the Cronicón's final phrase: 'The Iregua keeps the memory of N A L D A'. Write the missing word."
  },
  "t5_2_ans1": { "es": "NALDA", "fr": "NALDA", "en": "NALDA" },
  "t5_2_ans2": { "es": "Nalda", "fr": "Nalda", "en": "Nalda" },
  "t5_2_hint1": { "es": "Es el nombre del pueblo.", "fr": "C'est le nom du village.", "en": "It's the village name." },
  "t5_2_hint2": { "es": "Tiene 5 letras.", "fr": "Il a 5 lettres.", "en": "It has 5 letters." },
  "t5_2_hint3": { "es": "Empieza por N.", "fr": "Commence par N.", "en": "Starts with N." },
  "extra_foto_castillo_title": {
    "es": "El Tesoro del Castillo",
    "fr": "Le Trésor du Château",
    "en": "The Castle Treasure"
  },
  "extra_foto_castillo_description": {
    "es": "Fotografía una piedra con marca de cantero sin tocar nada.",
    "fr": "Photographiez une pierre avec marque de tailleur sans rien toucher.",
    "en": "Photograph a stone with a mason's mark without touching anything."
  },
  "extra_escucha_mirador_title": {
    "es": "El Concierto del Iregua",
    "fr": "Le Concert de l'Iregua",
    "en": "The Iregua Concert"
  },
  "extra_escucha_mirador_description": {
    "es": "30 segundos en silencio. Marca los sonidos que oyes.",
    "fr": "30 secondes de silence. Cochez les sons que vous entendez.",
    "en": "30 seconds of silence. Check the sounds you hear."
  },
  "extra_brujula_mirador_title": {
    "es": "Apunta al Norte",
    "fr": "Pointez le Nord",
    "en": "Point North"
  },
  "extra_brujula_mirador_description": {
    "es": "Mantén el móvil orientado al Norte 3 s (±15°).",
    "fr": "Maintenez le téléphone orienté au Nord 3 s (±15°).",
    "en": "Hold the phone facing North for 3 s (±15°)."
  },
  "extra_ordena_camino_title": {
    "es": "El Orden del Camino",
    "fr": "L'Ordre du Chemin",
    "en": "The Order of the Way"
  },
  "extra_ordena_camino_description": {
    "es": "Ordena: Vareia → Nalda → Viguera → Torrecilla → Puerto de Piqueras",
    "fr": "Ordre : Vareia → Nalda → Viguera → Torrecilla → Puerto de Piqueras",
    "en": "Order: Vareia → Nalda → Viguera → Torrecilla → Puerto de Piqueras"
  },
  "extra_escucha_cuevas_title": {
    "es": "El Silencio de las Cuevas",
    "fr": "Le Silence des Grottes",
    "en": "The Silence of the Caves"
  },
  "extra_escucha_cuevas_description": {
    "es": "30 s en silencio dentro de las cuevas. ¿Qué oyes?",
    "fr": "30 s de silence dans les grottes. Qu'entendez-vous ?",
    "en": "30 s of silence inside the caves. What do you hear?"
  },
  "meta_enigma_title": {
    "es": "El Sello del Cronicón",
    "fr": "Le Sceau du Cronicón",
    "en": "The Cronicón's Seal"
  },
  "meta_enigma_description": {
    "es": "Al completar todos los POIs, recibes un sello digital con la frase: 'El Iregua guarda la memoria de NALDA'. Se puede compartir en redes.",
    "fr": "En complétant tous les POIs, vous recevez un sceau numérique avec la phrase : 'L'Iregua garde la mémoire de NALDA'. Partageable sur les réseaux.",
    "en": "Completing all POIs gives you a digital seal with the phrase: 'The Iregua keeps the memory of NALDA'. Shareable on social media."
  }
};

// Check if Fray Botijo is already in forests or existing pack
const existingFrayPack = forests.find(f => f.id === 'nalda-fraybotijo' || f.id === 'nalda');
const frayStory = existingFrayPack?.stories.find(s => s.id === 'fraile-botijo');
const frayRiddles = existingFrayPack?.riddles.filter(r => r.storyId === 'fraile-botijo') || [];

// Create unified POIs
const pois = naldaPackSeed.pois.map(p => {
  const nameTrans = naldaI18n[p.nameKey]?.es || p.nameKey;
  const arTrans = naldaI18n[p.ar.descriptionKey]?.es || p.ar.descriptionKey;
  return {
    id: p.id,
    name: nameTrans,
    description: arTrans,
    lat: p.coords.lat,
    lng: p.coords.lng,
    emoji: p.emoji,
    clueSnippet: `Observa con atención el entorno de ${nameTrans} y escucha la voz del guía.`,
    arAsset: {
      preset: p.id.includes('castillo') ? 'torre_homenaje' :
              p.id.includes('arco') ? 'portal_temporal' :
              p.id.includes('mirador') ? 'etiquetas_valle' :
              p.id.includes('cuevas') ? 'paloma_3d' : 'cesta_vendimia',
      type: p.ar.type,
      label: `Realidad Aumentada en ${nameTrans}`,
      title: `Reliquia de ${nameTrans}`,
      modelUrl: p.ar.model,
      model: p.ar.model,
      scale: 1.3,
      heightOffsetMeters: 1.1,
      revealTrigger: 'onArrival',
      trigger: p.ar.trigger,
      description: arTrans,
      descriptionKey: p.ar.descriptionKey
    }
  };
});

// Story 1: El Guardián del Iregua
const storyGuardianDef = naldaPackSeed.stories[0];
const storyGuardian = {
  id: storyGuardianDef.id,
  title: naldaI18n[storyGuardianDef.titleKey]?.es || "El Guardián del Iregua",
  icon: "📜",
  summary: naldaI18n.forest_nalda_description.es,
  narrative: naldaI18n[storyGuardianDef.guide.greetingKey]?.es,
  mission: "Recorrer Nalda junto al sabio Cronicón, descifrar los enigmas medievales de cada hito y recomponer el sello sagrado NALDA.",
  narratorName: naldaI18n[storyGuardianDef.guide.nameKey]?.es || "El Cronicón",
  narratorRole: "Monje copista del siglo XIV (San Millán de la Cogolla)",
  narratorTone: "Respetuoso, sabio, sereno y amante de refranes antiguos",
  narratorAvatar: "📜",
  voiceName: "Fenrir",
  characterBio: naldaI18n[storyGuardianDef.guide.personaKey]?.es,
  characterGreeting: naldaI18n[storyGuardianDef.guide.greetingKey]?.es,
  guide: storyGuardianDef.guide,
  durations: storyGuardianDef.durations,
  difficulties: storyGuardianDef.difficulties
};

// Guardian riddles
const guardianRiddles = [];
storyGuardianDef.tests.forEach((t, idx) => {
  const qText = naldaI18n[t.questionKey]?.es || t.questionKey;
  const hints = (t.hintsKeys || []).map(hk => naldaI18n[hk]?.es || hk);
  
  let options = undefined;
  let answer = undefined;
  let acceptedAnswers = undefined;

  if (t.optionsKeys && t.optionsKeys.length > 0) {
    options = t.optionsKeys.map(ok => naldaI18n[ok]?.es || ok);
    answer = options[t.correctIndex || 0];
  } else if (t.answersKeys && t.answersKeys.length > 0) {
    acceptedAnswers = t.answersKeys.map(ak => naldaI18n[ak]?.es || ak);
    answer = acceptedAnswers[0];
  }

  const fragmentLetter = ["N", "A", "L", "D", "A"][idx % 5];

  guardianRiddles.push({
    id: t.id,
    poiId: t.poi,
    storyId: storyGuardianDef.id,
    name: `Crónica de Nalda #${idx + 1}`,
    difficulty: t.difficulty,
    question: qText,
    type: t.type === 'test' ? 'multiple_choice' : (t.type === 'text' ? 'open_text' : t.type),
    options,
    answer,
    acceptedAnswers,
    hints,
    staticHints: [hints[0] || 'Atiende al entorno', hints[1] || 'Recuerda los textos', hints[2] || answer || ''],
    points: t.points,
    correctIndex: t.correctIndex,
    questionKey: t.questionKey,
    optionsKeys: t.optionsKeys,
    hintsKeys: t.hintsKeys,
    answersKeys: t.answersKeys,
    metaRune: fragmentLetter,
    metaRuneClue: `Letra '${fragmentLetter}' del Cronicón`
  });
});

// Guardian extra tests
storyGuardianDef.extraTests.forEach(et => {
  const title = naldaI18n[et.titleKey]?.es || et.titleKey;
  const desc = naldaI18n[et.descriptionKey]?.es || et.descriptionKey;
  guardianRiddles.push({
    id: et.id,
    poiId: et.poi,
    storyId: storyGuardianDef.id,
    name: title,
    difficulty: '*',
    question: desc,
    type: et.type,
    points: et.points,
    optional: true,
    isBonus: true,
    bonusPoints: et.points,
    titleKey: et.titleKey,
    descriptionKey: et.descriptionKey,
    // order specifics if order type
    options: et.type === 'order' ? ['Vareia', 'Nalda', 'Viguera', 'Torrecilla', 'Puerto de Piqueras'] : undefined,
    answer: et.type === 'order' ? 'Vareia, Nalda, Viguera, Torrecilla, Puerto de Piqueras' : undefined
  });
});

// Update POI references in Fray Botijo's riddles to point to shared POI IDs if needed
const updatedFrayRiddles = frayRiddles.map(r => {
  let mappedPoi = r.poiId;
  if (mappedPoi.endsWith('-f')) {
    mappedPoi = mappedPoi.replace('-f', '');
  }
  return {
    ...r,
    poiId: mappedPoi
  };
});

const allStories = [storyGuardian];
if (frayStory) {
  allStories.push(frayStory);
}

const allRiddles = [...guardianRiddles, ...updatedFrayRiddles];

const unifiedNaldaPack = {
  id: "nalda",
  name: "Nalda — El Guardián del Iregua",
  country: "España (La Rioja)",
  region: "La Rioja, España",
  description: "Un bosque de historia, piedra y río en el Valle del Iregua. Recorre el castillo medieval, las cuevas rupestres de Los Palomares y la Ermita de Villavieja.",
  centerLat: 42.3351,
  centerLng: -2.4883,
  coverImageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  attribution: "Basado en la historia real y patrimonio de Nalda (La Rioja). Textos históricos y personajes narrativos integrados.",
  credits: "Basado en la historia real y patrimonio de Nalda (La Rioja). Textos históricos y personajes narrativos integrados.",
  defaultLanguage: "es",
  languages: ["es", "fr", "en"],
  isPublished: true,
  pois,
  routePresets: {
    "30min": ["castillo-nalda", "arco-villa"],
    "1h": ["castillo-nalda", "arco-villa", "mirador-cameros"],
    "1.5h": ["castillo-nalda", "arco-villa", "mirador-cameros", "cuevas-palomares"],
    "1h30": ["castillo-nalda", "arco-villa", "mirador-cameros", "cuevas-palomares"],
    "2h": ["castillo-nalda", "arco-villa", "mirador-cameros", "cuevas-palomares", "ermita-villavieja"]
  },
  stories: allStories,
  riddles: allRiddles,
  sceneNarratives: {
    "guardian-iregua_castillo-nalda": "El Cronicón contempla las piedras del castillo y te invita a recordar la memoria del siglo XIII.",
    "guardian-iregua_arco-villa": "El arco delimitaba la frontera de protección de la villa medieval frente a incursiones.",
    "guardian-iregua_mirador-cameros": "El sonido cantarín del Iregua asciende desde el cañón mientras contemplas la entrada a Cameros.",
    "guardian-iregua_cuevas-palomares": "El rumor de las palomas y el eremitorio excavado guardan siglos de recogimiento en la roca.",
    "guardian-iregua_ermita-villavieja": "Frente a la ermita, los viñedos de la Rioja susurran la historia de la vendimia y la tradición."
  },
  bridgePhrases: {
    "castillo-nalda_to_arco-villa": "Desciende las calles empedradas hacia la puerta amurallada del Arco de la Villa.",
    "arco-villa_to_mirador-cameros": "Prosigue la senda ascendente hacia el Mirador Puerta de Cameros.",
    "mirador-cameros_to_cuevas-palomares": "Baja en dirección a la pared vertical donde se abren las Cuevas de Los Palomares.",
    "cuevas-palomares_to_ermita-villavieja": "Sigue el camino fluvial entre frutales y viñedos hasta la Ermita de Villavieja."
  },
  metaEnigma: {
    keyword: "NALDA",
    title: naldaI18n.meta_enigma_title.es,
    description: naldaI18n.meta_enigma_description.es,
    hint: "El nombre de esta ilustre villa riojana a orillas del Iregua.",
    successNarrative: "¡Enhorabuena, aprendiz! El Cronicón asiente con solemnidad. Has completado la senda y recogido el sello sagrado: 'El Iregua guarda la memoria de NALDA'.",
    titleKey: "meta_enigma_title",
    descriptionKey: "meta_enigma_description",
    fragments: ["N", "A", "L", "D", "A"]
  }
};

// Also keep nalda-fraybotijo alias pack pointing to same or standalone for backward compatibility
const frayStandalonePack = {
  ...unifiedNaldaPack,
  id: "nalda-fraybotijo",
  name: "Nalda — El Fraile que Bebió Demasiado",
  description: "Recorre Nalda junto al irreverente fantasma de Fray Botijo desvelando ruinas medievales y cuevas entre chistes y datos reales.",
  contentRating: "adult",
  contentWarning: "Contenido picante con humor irreverente. No apto para niños ni para gente sin sentido del humor."
};

// Update forests list: remove existing nalda entries and add updated
const filteredForests = forests.filter(f => f.id !== 'nalda' && f.id !== 'nalda-fraybotijo');
filteredForests.push(unifiedNaldaPack);
filteredForests.push(frayStandalonePack);

// Save to data/forests.json and forest-packs-seed.json
fs.writeFileSync(forestsPath, JSON.stringify(filteredForests, null, 2), 'utf-8');
fs.writeFileSync(path.resolve('forest-packs-seed.json'), JSON.stringify(filteredForests, null, 2), 'utf-8');
fs.writeFileSync(path.resolve('data/forest-packs-seed.json'), JSON.stringify(filteredForests, null, 2), 'utf-8');
console.log('Saved updated forest packs with both Nalda stories.');

// Update i18n
function mergeNaldaI18n(filePath) {
  const i18n = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!i18n.ui) i18n.ui = { es: {}, fr: {}, en: {} };
  if (!i18n.keys) i18n.keys = {};

  Object.entries(naldaI18n).forEach(([key, val]) => {
    // UI dictionaries
    i18n.ui.es[key] = val.es;
    i18n.ui.fr[key] = val.fr;
    i18n.ui.en[key] = val.en;

    // Keys dictionary
    i18n.keys[key] = val;
  });

  // Forests registry
  if (!i18n.forests) i18n.forests = {};
  i18n.forests['nalda'] = {
    es: {
      name: naldaI18n.forest_nalda_name.es,
      country: "España (La Rioja)",
      description: naldaI18n.forest_nalda_description.es
    },
    fr: {
      name: naldaI18n.forest_nalda_name.fr,
      country: "Espagne (La Rioja)",
      description: naldaI18n.forest_nalda_description.fr
    },
    en: {
      name: naldaI18n.forest_nalda_name.en,
      country: "Spain (La Rioja)",
      description: naldaI18n.forest_nalda_description.en
    }
  };

  fs.writeFileSync(filePath, JSON.stringify(i18n, null, 2), 'utf-8');
  console.log('Merged nalda-i18n into ' + filePath);
}

mergeNaldaI18n(path.resolve('src/data/i18n.json'));
mergeNaldaI18n(path.resolve('i18n.json'));

console.log('Complete Nalda integration finished successfully!');
