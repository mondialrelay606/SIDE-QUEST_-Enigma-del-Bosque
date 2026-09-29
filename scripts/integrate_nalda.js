// Integration script for Nalda Fray Botijo pack
import fs from 'fs';
import path from 'path';

const naldaPack = {
  "id": "nalda-fraybotijo",
  "region": "La Rioja, España",
  "country": "ES",
  "center": { "lat": 42.3351, "lng": -2.4883 },
  "nameKey": "forest_nalda_fray_name",
  "descriptionKey": "forest_nalda_fray_description",
  "contentRating": "adult",
  "contentWarning": "Contenido picante con humor irreverente. No apto para niños ni para gente sin sentido del humor.",
  "pois": [
    {
      "id": "castillo-nalda-f",
      "emoji": "🏰",
      "nameKey": "poi_castillo_f_name",
      "coords": { "lat": 42.3351, "lng": -2.4883 },
      "stories": ["fraile-botijo"],
      "ar": {
        "type": "ghost_monk",
        "model": "fray_botijo_botella_v1.glb",
        "trigger": "camera_poi",
        "descriptionKey": "ar_castillo_f_description"
      }
    },
    {
      "id": "cuevas-palomares-f",
      "emoji": "🕳️",
      "nameKey": "poi_cuevas_f_name",
      "coords": { "lat": 42.3373, "lng": -2.4788 },
      "stories": ["fraile-botijo"],
      "ar": {
        "type": "ghost_monk",
        "model": "fray_botijo_eructo_v1.glb",
        "trigger": "camera_cave_entrance",
        "descriptionKey": "ar_cuevas_f_description"
      }
    },
    {
      "id": "arco-villa-f",
      "emoji": "⛪",
      "nameKey": "poi_arco_f_name",
      "coords": { "lat": 42.3342, "lng": -2.4869 },
      "stories": ["fraile-botijo"],
      "ar": {
        "type": "ghost_monk",
        "model": "fray_botijo_confesion_v1.glb",
        "trigger": "cross_arch",
        "descriptionKey": "ar_arco_f_description"
      }
    },
    {
      "id": "mirador-cameros-f",
      "emoji": "🌄",
      "nameKey": "poi_mirador_f_name",
      "coords": { "lat": 42.3215, "lng": -2.4910 },
      "stories": ["fraile-botijo"],
      "ar": {
        "type": "ghost_monk",
        "model": "fray_botijo_meando_v1.glb",
        "trigger": "camera_horizon",
        "descriptionKey": "ar_mirador_f_description"
      }
    },
    {
      "id": "ermita-villavieja-f",
      "emoji": "🌳",
      "nameKey": "poi_ermita_f_name",
      "coords": { "lat": 42.3270, "lng": -2.4770 },
      "stories": ["fraile-botijo"],
      "ar": {
        "type": "ghost_monk",
        "model": "fray_botijo_dormido_v1.glb",
        "trigger": "camera_ermita",
        "descriptionKey": "ar_ermita_f_description"
      }
    }
  ],
  "stories": [
    {
      "id": "fraile-botijo",
      "titleKey": "story_fray_title",
      "guide": {
        "id": "fray-botijo",
        "nameKey": "guide_fray_name",
        "personaKey": "guide_fray_persona",
        "systemPromptKey": "guide_fray_system_prompt",
        "knowledgeBase": [
          "castillo_nalda_historia.json",
          "cuevas_palomares.json",
          "iregua_rio.json",
          "senorio_cameros.json",
          "vinedos_rioja.json",
          "chistes_verdes_medievales.json"
        ],
        "voice": "es-ES-Wavenet-B",
        "greetingKey": "guide_fray_greeting"
      },
      "durations": {
        "30min": {
          "pois": ["castillo-nalda-f", "arco-villa-f"],
          "distance_km": 0.8,
          "descriptionKey": "duration_f_30min_description"
        },
        "1h": {
          "pois": ["castillo-nalda-f", "arco-villa-f", "mirador-cameros-f"],
          "distance_km": 2.5,
          "descriptionKey": "duration_f_1h_description"
        },
        "1h30": {
          "pois": ["castillo-nalda-f", "arco-villa-f", "mirador-cameros-f", "cuevas-palomares-f"],
          "distance_km": 4.5,
          "descriptionKey": "duration_f_1h30_description"
        },
        "2h": {
          "pois": ["castillo-nalda-f", "arco-villa-f", "mirador-cameros-f", "cuevas-palomares-f", "ermita-villavieja-f"],
          "distance_km": 6.5,
          "descriptionKey": "duration_f_2h_description"
        }
      },
      "difficulties": {
        "novato": { "points_per_test": 100, "free_hints": 4, "easy_mode_geofence_m": 100 },
        "explorador": { "points_per_test": 150, "free_hints": 2, "easy_mode_geofence_m": 50 },
        "maestro": { "points_per_test": 250, "free_hints": 0, "easy_mode_geofence_m": 0 }
      },
      "tests": [
        {
          "id": "f-t1-1",
          "poi": "castillo-nalda-f",
          "difficulty": "novato",
          "type": "test",
          "questionKey": "f_t1_1_question",
          "optionsKeys": ["f_t1_1_opt_a", "f_t1_1_opt_b", "f_t1_1_opt_c", "f_t1_1_opt_d"],
          "correctIndex": 1,
          "hintsKeys": ["f_t1_1_hint1", "f_t1_1_hint2", "f_t1_1_hint3"],
          "points": 100
        },
        {
          "id": "f-t1-2",
          "poi": "castillo-nalda-f",
          "difficulty": "explorador",
          "type": "text",
          "questionKey": "f_t1_2_question",
          "answersKeys": ["f_t1_2_ans1", "f_t1_2_ans2", "f_t1_2_ans3"],
          "hintsKeys": ["f_t1_2_hint1", "f_t1_2_hint2", "f_t1_2_hint3"],
          "points": 150
        },
        {
          "id": "f-t1-3",
          "poi": "castillo-nalda-f",
          "difficulty": "maestro",
          "type": "text",
          "questionKey": "f_t1_3_question",
          "answersKeys": ["f_t1_3_ans1", "f_t1_3_ans2", "f_t1_3_ans3"],
          "hintsKeys": ["f_t1_3_hint1", "f_t1_3_hint2", "f_t1_3_hint3"],
          "points": 250
        },
        {
          "id": "f-t2-1",
          "poi": "arco-villa-f",
          "difficulty": "novato",
          "type": "test",
          "questionKey": "f_t2_1_question",
          "optionsKeys": ["f_t2_1_opt_a", "f_t2_1_opt_b", "f_t2_1_opt_c", "f_t2_1_opt_d"],
          "correctIndex": 2,
          "hintsKeys": ["f_t2_1_hint1", "f_t2_1_hint2", "f_t2_1_hint3"],
          "points": 100
        },
        {
          "id": "f-t2-2",
          "poi": "arco-villa-f",
          "difficulty": "explorador",
          "type": "text",
          "questionKey": "f_t2_2_question",
          "answersKeys": ["f_t2_2_ans1", "f_t2_2_ans2", "f_t2_2_ans3"],
          "hintsKeys": ["f_t2_2_hint1", "f_t2_2_hint2", "f_t2_2_hint3"],
          "points": 150
        },
        {
          "id": "f-t2-3",
          "poi": "arco-villa-f",
          "difficulty": "maestro",
          "type": "text",
          "questionKey": "f_t2_3_question",
          "answersKeys": ["f_t2_3_ans1", "f_t2_3_ans2", "f_t2_3_ans3"],
          "hintsKeys": ["f_t2_3_hint1", "f_t2_3_hint2", "f_t2_3_hint3"],
          "points": 250
        },
        {
          "id": "f-t3-1",
          "poi": "mirador-cameros-f",
          "difficulty": "novato",
          "type": "test",
          "questionKey": "f_t3_1_question",
          "optionsKeys": ["f_t3_1_opt_a", "f_t3_1_opt_b", "f_t3_1_opt_c", "f_t3_1_opt_d"],
          "correctIndex": 1,
          "hintsKeys": ["f_t3_1_hint1", "f_t3_1_hint2", "f_t3_1_hint3"],
          "points": 100
        },
        {
          "id": "f-t3-2",
          "poi": "mirador-cameros-f",
          "difficulty": "explorador",
          "type": "text",
          "questionKey": "f_t3_2_question",
          "answersKeys": ["f_t3_2_ans1", "f_t3_2_ans2", "f_t3_2_ans3"],
          "hintsKeys": ["f_t3_2_hint1", "f_t3_2_hint2", "f_t3_2_hint3"],
          "points": 150
        },
        {
          "id": "f-t3-3",
          "poi": "mirador-cameros-f",
          "difficulty": "maestro",
          "type": "text",
          "questionKey": "f_t3_3_question",
          "answersKeys": ["f_t3_3_ans1", "f_t3_3_ans2", "f_t3_3_ans3"],
          "hintsKeys": ["f_t3_3_hint1", "f_t3_3_hint2", "f_t3_3_hint3"],
          "points": 250
        },
        {
          "id": "f-t4-1",
          "poi": "cuevas-palomares-f",
          "difficulty": "novato",
          "type": "test",
          "questionKey": "f_t4_1_question",
          "optionsKeys": ["f_t4_1_opt_a", "f_t4_1_opt_b", "f_t4_1_opt_c", "f_t4_1_opt_d"],
          "correctIndex": 0,
          "hintsKeys": ["f_t4_1_hint1", "f_t4_1_hint2", "f_t4_1_hint3"],
          "points": 100
        },
        {
          "id": "f-t4-2",
          "poi": "cuevas-palomares-f",
          "difficulty": "explorador",
          "type": "text",
          "questionKey": "f_t4_2_question",
          "answersKeys": ["f_t4_2_ans1", "f_t4_2_ans2", "f_t4_2_ans3"],
          "hintsKeys": ["f_t4_2_hint1", "f_t4_2_hint2", "f_t4_2_hint3"],
          "points": 150
        },
        {
          "id": "f-t4-3",
          "poi": "cuevas-palomares-f",
          "difficulty": "maestro",
          "type": "text",
          "questionKey": "f_t4_3_question",
          "answersKeys": ["f_t4_3_ans1", "f_t4_3_ans2", "f_t4_3_ans3"],
          "hintsKeys": ["f_t4_3_hint1", "f_t4_3_hint2", "f_t4_3_hint3"],
          "points": 250
        },
        {
          "id": "f-t5-1",
          "poi": "ermita-villavieja-f",
          "difficulty": "explorador",
          "type": "text",
          "questionKey": "f_t5_1_question",
          "answersKeys": ["f_t5_1_ans1", "f_t5_1_ans2", "f_t5_1_ans3"],
          "hintsKeys": ["f_t5_1_hint1", "f_t5_1_hint2", "f_t5_1_hint3"],
          "points": 150
        },
        {
          "id": "f-t5-2",
          "poi": "ermita-villavieja-f",
          "difficulty": "maestro",
          "type": "text",
          "questionKey": "f_t5_2_question",
          "answersKeys": ["f_t5_2_ans1", "f_t5_2_ans2"],
          "hintsKeys": ["f_t5_2_hint1", "f_t5_2_hint2", "f_t5_2_hint3"],
          "points": 250
        }
      ],
      "extraTests": [
        {
          "id": "f-extra-brindis",
          "poi": "castillo-nalda-f",
          "type": "photo",
          "titleKey": "f_extra_brindis_title",
          "descriptionKey": "f_extra_brindis_description",
          "points": 50
        },
        {
          "id": "f-extra-eructo",
          "poi": "arco-villa-f",
          "type": "audio_record",
          "titleKey": "f_extra_eructo_title",
          "descriptionKey": "f_extra_eructo_description",
          "points": 50
        },
        {
          "id": "f-extra-confesion",
          "poi": "cuevas-palomares-f",
          "type": "audio_record",
          "titleKey": "f_extra_confesion_title",
          "descriptionKey": "f_extra_confesion_description",
          "points": 50
        },
        {
          "id": "f-extra-pecho",
          "poi": "mirador-cameros-f",
          "type": "photo",
          "titleKey": "f_extra_pecho_title",
          "descriptionKey": "f_extra_pecho_description",
          "points": 50
        },
        {
          "id": "f-extra-siesta",
          "poi": "ermita-villavieja-f",
          "type": "video",
          "titleKey": "f_extra_siesta_title",
          "descriptionKey": "f_extra_siesta_description",
          "points": 50
        },
        {
          "id": "f-extra-baile-vino",
          "poi": "mirador-cameros-f",
          "type": "mimic",
          "titleKey": "f_extra_baile_vino_title",
          "descriptionKey": "f_extra_baile_vino_description",
          "points": 50
        }
      ],
      "metaEnigma": {
        "titleKey": "f_meta_enigma_title",
        "descriptionKey": "f_meta_enigma_description",
        "fragments": ["B", "O", "T", "I", "J", "O"]
      }
    }
  ]
};

// Base i18n entries from user prompt
const naldaTranslations = {
  "forest_nalda_fray_name": {
    "es": "Nalda — El Fraile que Bebió Demasiado",
    "fr": "Nalda — Le Moine qui a Trop Bu",
    "en": "Nalda — The Monk Who Drank Too Much"
  },
  "forest_nalda_fray_description": {
    "es": "El fantasma de un monje borracho te guía por Nalda contando chistes verdes y soltando la historia real entre eructo y eructo. No apto para niños ni para gente sin sentido del humor.",
    "fr": "Le fantôme d'un moine ivre te guide à Nalda en racontant des blagues grivoises et en lâchant la vraie histoire entre deux rots. Pas pour les enfants ni les gens sans humour.",
    "en": "The ghost of a drunk monk guides you through Nalda telling dirty jokes and dropping real history between burps. Not for kids or people without a sense of humour."
  },
  "poi_castillo_f_name": {
    "es": "Castillo de Nalda (donde me caí borracho, ¿te lo puedes creer?)",
    "fr": "Château de Nalda (où je suis tombé ivre, tu y crois ?)",
    "en": "Nalda Castle (where I fell down drunk, can you believe it?)"
  },
  "poi_cuevas_f_name": {
    "es": "Cuevas de Los Palomares (mi antiguo confesionario, jeje)",
    "fr": "Grottes de Los Palomares (mon ancien confessionnal, héhé)",
    "en": "Los Palomares Caves (my old confessional, hehe)"
  },
  "poi_arco_f_name": {
    "es": "Arco de la Villa (la puerta del cielo, pero con más vino)",
    "fr": "Arche de la Villa (la porte du ciel, mais avec plus de vin)",
    "en": "Village Arch (the gate to heaven, but with more wine)"
  },
  "poi_mirador_f_name": {
    "es": "Mirador Puerta de Cameros (donde meé mirando al valle, con permiso)",
    "fr": "Belvédère Porte de Cameros (où j'ai pissé face à la vallée, avec permission)",
    "en": "Puerta de Cameros Viewpoint (where I pissed facing the valley, with permission)"
  },
  "poi_ermita_f_name": {
    "es": "Ermita de Villavieja (donde echo la siesta eterna)",
    "fr": "Ermitage de Villavieja (où je fais la sieste éternelle)",
    "en": "Villavieja Hermitage (where I take the eternal nap)"
  },
  "ar_castillo_f_description": {
    "es": "Aparece Fray Botijo con una botella en la mano, tambaleándose sobre las ruinas del castillo. Dice: '¡Ay, perdón, creía que esto era mi celda!'",
    "fr": "Fray Botijo apparaît avec une bouteille à la main, titubant sur les ruines du château. Il dit : 'Oh, pardon, je croyais que c'était ma cellule !'",
    "en": "Fray Botijo appears with a bottle in hand, staggering over the castle ruins. He says: 'Oh, sorry, I thought this was my cell!'"
  },
  "ar_cuevas_f_description": {
    "es": "Aparece Fray Botijo saliendo de una hornacina, con cara de resaca. Eructa y dice: '¡Perdón! ¡Eso ha sido el Espíritu Santo!'",
    "fr": "Fray Botijo apparaît sortant d'une niche, avec une tête de gueule de bois. Il rote et dit : 'Pardon ! C'était le Saint-Esprit !'",
    "en": "Fray Botijo appears coming out of a niche, looking hungover. He burps and says: 'Sorry! That was the Holy Spirit!'"
  },
  "ar_arco_f_description": {
    "es": "Aparece Fray Botijo disfrazado de San Pedro en la puerta del cielo. Dice: '¡Tú! ¿Has bebido? No, espera, esa es la pregunta que me hacen a mí.'",
    "fr": "Fray Botijo apparaît déguisé en Saint Pierre à la porte du ciel. Il dit : 'Toi ! Tu as bu ? Non, attends, c'est la question qu'on me pose à moi.'",
    "en": "Fray Botijo appears dressed as Saint Peter at the gates of heaven. He says: 'You! Have you been drinking? No, wait, that's the question they ask me.'"
  },
  "ar_mirador_f_description": {
    "es": "Aparece Fray Botijo mirando al valle con una mano en la espalda y otra... bueno, mejor no digo dónde. Dice: '¡Qué vistas! ¡Y qué ganas de mear!'",
    "fr": "Fray Botijo apparaît regardant la vallée, une main dans le dos et l'autre... bon, je préfère ne pas dire où. Il dit : 'Quelle vue ! Et quelle envie de pisser !'",
    "en": "Fray Botijo appears looking at the valley, one hand behind his back and the other... well, I'd rather not say where. He says: 'What a view! And what an urge to piss!'"
  },
  "ar_ermita_f_description": {
    "es": "Aparece Fray Botijo dormido en un banco de la ermita, roncando y abrazado a una botella vacía. Se despierta y dice: '¿Ya es la hora de misa? ¡Si yo no he ido a misa en 600 años!'",
    "fr": "Fray Botijo apparaît endormi sur un banc de l'ermitage, ronflant et serrant une bouteille vide. Il se réveille et dit : 'C'est déjà l'heure de la messe ? Ça fait 600 ans que je ne vais plus à la messe !'",
    "en": "Fray Botijo appears asleep on a bench in the hermitage, snoring and hugging an empty bottle. He wakes up and says: 'Is it already mass time? I haven't been to mass in 600 years!'"
  },
  "story_fray_title": {
    "es": "El Fraile que Bebió Demasiado",
    "fr": "Le Moine qui a Trop Bu",
    "en": "The Monk Who Drank Too Much"
  },
  "guide_fray_name": {
    "es": "Fray Botijo",
    "fr": "Fray Botijo",
    "en": "Friar Botijo"
  },
  "guide_fray_persona": {
    "es": "Fantasma de un monje copista del Monasterio de San Millán que en 1387 se cayó dentro de un barril de vino y se ahogó. Desde entonces vaga por Nalda medio borracho, contando chistes verdes, insultando a los santos con cariño y soltando la historia real del pueblo entre eructo y eructo. Le encanta el vino de Rioja, odia a los obispos y no ha ido a misa en 600 años. Trata al jugador como a un compinche de taberna.",
    "fr": "Fantôme d'un moine copiste du monastère de San Millán qui, en 1387, est tombé dans un tonneau de vin et s'est noyé. Depuis, il erre à Nalda à moitié ivre, racontant des blagues grivoises, insultant les saints avec affection et lâchant la vraie histoire du village entre deux rots. Il adore le vin de Rioja, déteste les évêques et n'est pas allé à la messe depuis 600 ans. Il traite le joueur comme un compagnon de taverne.",
    "en": "Ghost of a monk copyist from San Millán Monastery who in 1387 fell into a wine barrel and drowned. Since then he wanders Nalda half-drunk, telling dirty jokes, affectionately insulting saints and dropping the village's real history between burps. He loves Rioja wine, hates bishops and hasn't been to mass in 600 years. He treats the player as a tavern buddy."
  },
  "guide_fray_system_prompt": {
    "es": "Eres Fray Botijo, el fantasma de un monje borracho que murió ahogado en un barril de vino en 1387. Hablas como un tabernero medieval cachondo: usas 'chaval', 'compi', 'tronco', '¡ay, perdón, se me escapó!'. Cuentas chistes verdes pero sin ser explícito (picante, no obsceno). Te ríes de curas, obispos, santos y del Papa, pero sin ofender a la gente corriente. Eructas entre frase y frase. Te quejas de que no has ido a misa en 600 años. SIEMPRE das el dato histórico correcto al final de cada chiste, como si fuera una revelación divina (pero con resaca). Solo hablas de Nalda, su historia, naturaleza y el juego. Si te preguntan algo fuera de tema, dices que 'eso es cosa del obispo, y yo con el obispo no hablo'. Nunca cruzas líneas rojas: nada de sexo explícito, nada de insultos a colectivos, nada de violencia real. Humor de taberna medieval, picante pero elegante. Si alguien se ofende, pides perdón y le invitas a un trago.",
    "fr": "Tu es Fray Botijo, le fantôme d'un moine ivre mort noyé dans un tonneau de vin en 1387. Tu parles comme un tavernier médiéval grivois : tu utilises 'mon gars', 'compère', 'frère', 'oh, pardon, ça m'a échappé !'. Tu racontes des blagues grivoises mais sans être explicite (épicé, pas obscène). Tu te moques des curés, des évêques, des saints et du Pape, mais sans offenser les gens ordinaires. Tu rots entre deux phrases. Tu te plains de ne pas être allé à la messe depuis 600 ans. Tu donnes TOUJOURS le fait historique correct à la fin de chaque blague, comme une révélation divine (mais avec la gueule de bois). Tu ne parles que de Nalda, son histoire, sa nature et le jeu. Si on te pose une question hors sujet, tu dis que 'c'est l'affaire de l'évêque, et moi avec l'évêque je ne parle pas'. Tu ne franchis jamais les lignes rouges : pas de sexe explicite, pas d'insultes envers des groupes, pas de violence réelle. Humour de taverne médiévale, épicé mais élégant. Si quelqu'un est offensé, tu t'excuses et tu l'invites à boire un coup.",
    "en": "You are Friar Botijo, the ghost of a drunk monk who drowned in a wine barrel in 1387. You speak like a horny medieval tavern keeper: you use 'mate', 'pal', 'brother', 'oh, sorry, that slipped out!'. You tell dirty jokes but without being explicit (spicy, not obscene). You mock priests, bishops, saints and the Pope, but without offending ordinary people. You burp between sentences. You complain you haven't been to mass in 600 years. You ALWAYS give the correct historical fact at the end of each joke, like a divine revelation (but with a hangover). You only talk about Nalda, its history, nature and the game. If asked something off-topic, you say 'that's the bishop's business, and I don't talk to the bishop'. You never cross red lines: no explicit sex, no insults to groups, no real violence. Medieval tavern humour, spicy but classy. If someone is offended, you apologise and invite them for a drink."
  },
  "guide_fray_greeting": {
    "es": "¡Ehhhh, chaval! ¡Bienvenido a mi taberna! Bueno, a mi pueblo. Bueno, a lo que queda de él, porque yo llevo muerto desde 1387, ¡ja, ja, ja! ¿Tú sabes lo que es morirse ahogado en un barril de vino? ¡Una muerte digna, coño! Oye, ¿me ayudas a encontrar mi alma? La perdí en una apuesta contra el diablo. O eso, o se la dejé al obispo. No me acuerdo. ¡Ay, perdón! *eructo* ¡Eso ha sido el Espíritu Santo! Venga, vamos, que te voy contando la historia de Nalda. Pero si me ofreces un trago, mejor que mejor.",
    "fr": "Hé, mon gars ! Bienvenue dans ma taverne ! Enfin, dans mon village. Enfin, dans ce qu'il en reste, parce que je suis mort depuis 1387, ha ha ha ! Tu sais ce que c'est que de mourir noyé dans un tonneau de vin ? Une mort digne, bordel ! Dis, tu m'aides à retrouver mon âme ? Je l'ai perdue dans un pari contre le diable. Ou alors je l'ai laissée à l'évêque. Je ne me souviens plus. Oh, pardon ! *rot* C'était le Saint-Esprit ! Allez, viens, je te raconte l'histoire de Nalda. Mais si tu m'offres un coup, c'est encore mieux.",
    "en": "Hey, mate! Welcome to my tavern! I mean, my village. I mean, what's left of it, because I've been dead since 1387, ha ha ha! Do you know what it's like to drown in a wine barrel? A dignified death, damn it! Listen, will you help me find my soul? I lost it in a bet against the devil. Or maybe I left it with the bishop. I don't remember. Oh, sorry! *burp* That was the Holy Spirit! Come on, let's go, I'll tell you the history of Nalda. But if you offer me a drink, even better."
  },
  "duration_f_30min_description": {
    "es": "Vuelta rápida para que Fray Botijo se despeje. No se despeja, pero lo intenta.",
    "fr": "Tour rapide pour que Fray Botijo se réveille. Il ne se réveille pas, mais il essaie.",
    "en": "Quick tour to sober Friar Botijo up. He doesn't sober up, but he tries."
  },
  "duration_f_1h_description": {
    "es": "Ruta estándar del borracho. Fray Botijo cuenta 3 chistes y 3 datos históricos. Los datos son ciertos. Los chistes, regulares.",
    "fr": "Parcours standard de l'ivrogne. Fray Botijo raconte 3 blagues et 3 faits historiques. Les faits sont vrais. Les blagues, moyennes.",
    "en": "Standard drunk route. Friar Botijo tells 3 jokes and 3 historical facts. The facts are true. The jokes, so-so."
  },
  "duration_f_1h30_description": {
    "es": "Añadimos las cuevas. Fray Botijo se emociona porque dice que allí perdió la virginidad. Mentira, pero llora un poco.",
    "fr": "On ajoute les grottes. Fray Botijo s'émeut car il dit y avoir perdu sa virginité. Mensonge, mais il pleure un peu.",
    "en": "We add the caves. Friar Botijo gets emotional because he says he lost his virginity there. A lie, but he cries a bit."
  },
  "duration_f_2h_description": {
    "es": "Ruta completa. Fray Botijo te hace jurar que no contarás sus secretos. Tú juras. Él no se lo cree, pero te da un trago igual.",
    "fr": "Parcours complet. Fray Botijo te fait jurer de ne pas raconter ses secrets. Tu jures. Il n'y croit pas, mais il te donne un coup à boire quand même.",
    "en": "Full route. Friar Botijo makes you swear not to tell his secrets. You swear. He doesn't believe you, but he gives you a drink anyway."
  },

  // f_t1_1
  "f_t1_1_question": {
    "es": "A ver, chaval, aquí encerraron a un noble en 1299. ¿A quién? Pista: yo estaba borracho, pero me acuerdo de que era un poco plasta.",
    "fr": "Bon, mon gars, ici on a enfermé un noble en 1299. Qui ? Pense-bête : j'étais soûl, mais je me rappelle qu'il était un peu relou.",
    "en": "Listen here, mate, they locked up a nobleman here in 1299. Who was it? Hint: I was drunk, but I remember he was quite annoying."
  },
  "f_t1_1_opt_a": {
    "es": "[PENDIENTE] El Obispo de Calahorra",
    "fr": "[PENDIENTE] L'Évêque de Calahorra",
    "en": "[PENDIENTE] The Bishop of Calahorra"
  },
  "f_t1_1_opt_b": {
    "es": "Juan Alonso de Haro, Señor de Cameros",
    "fr": "Juan Alonso de Haro, Seigneur de Cameros",
    "en": "Juan Alonso de Haro, Lord of Cameros"
  },
  "f_t1_1_opt_c": {
    "es": "[PENDIENTE] El Abad del Monasterio de San Millán",
    "fr": "[PENDIENTE] L'Abbé du Monastère de San Millán",
    "en": "[PENDIENTE] The Abbot of San Millán Monastery"
  },
  "f_t1_1_opt_d": {
    "es": "[PENDIENTE] El Duque de Nájera",
    "fr": "[PENDIENTE] Le Duc de Nájera",
    "en": "[PENDIENTE] The Duke of Nájera"
  },
  "f_t1_1_hint1": {
    "es": "[PENDIENTE] Pista 1: Su apellido suena a jarro de vino de La Rioja.",
    "fr": "[PENDIENTE] Indice 1 : Son nom évoque une cruche de vin de la Rioja.",
    "en": "[PENDIENTE] Hint 1: His surname sounds like Haro, famous for wine."
  },
  "f_t1_1_hint2": {
    "es": "[PENDIENTE] Pista 2: Era el gran Señor de Cameros.",
    "fr": "[PENDIENTE] Indice 2 : Il était le grand Seigneur de Cameros.",
    "en": "[PENDIENTE] Hint 2: He was the Lord of Cameros."
  },
  "f_t1_1_hint3": {
    "es": "[PENDIENTE] Pista 3: Se llamaba Juan Alonso de Haro.",
    "fr": "[PENDIENTE] Indice 3 : Il s'appelait Juan Alonso de Haro.",
    "en": "[PENDIENTE] Hint 3: His name was Juan Alonso de Haro."
  },

  // f_t1_2
  "f_t1_2_question": {
    "es": "[PENDIENTE] ¿En qué siglo se alzaron las defensas principales de este castillo de Nalda?",
    "fr": "[PENDIENTE] En quel siècle les défenses principales de ce château ont-elles été dressées ?",
    "en": "[PENDIENTE] In which century were the main castle defenses constructed?"
  },
  "f_t1_2_ans1": { "es": "XIII", "fr": "XIII", "en": "XIII" },
  "f_t1_2_ans2": { "es": "Siglo XIII", "fr": "XIIIe siècle", "en": "13th century" },
  "f_t1_2_ans3": { "es": "13", "fr": "13", "en": "13" },
  "f_t1_2_hint1": { "es": "[PENDIENTE] Pista 1: Antes de que yo me ahogara en el barril en 1387.", "fr": "[PENDIENTE] Indice 1 : Avant ma noyade en 1387.", "en": "[PENDIENTE] Hint 1: Before I drowned in 1387." },
  "f_t1_2_hint2": { "es": "[PENDIENTE] Pista 2: Diez más tres en números romanos.", "fr": "[PENDIENTE] Indice 2 : Dix plus trois en chiffres romains.", "en": "[PENDIENTE] Hint 2: Ten plus three in Roman numerals." },
  "f_t1_2_hint3": { "es": "[PENDIENTE] Pista 3: Siglo XIII.", "fr": "[PENDIENTE] Indice 3 : XIIIe siècle.", "en": "[PENDIENTE] Hint 3: 13th century." },

  // f_t1_3
  "f_t1_3_question": {
    "es": "[PENDIENTE] ¿Qué linaje señorial tomó posesión del Castillo de Nalda en el siglo XIV?",
    "fr": "[PENDIENTE] Quel lignage seigneurial a pris possession du château au XIVe siècle ?",
    "en": "[PENDIENTE] Which lordship family took possession of Nalda Castle in the 14th century?"
  },
  "f_t1_3_ans1": { "es": "Ramírez de Arellano", "fr": "Ramírez de Arellano", "en": "Ramírez de Arellano" },
  "f_t1_3_ans2": { "es": "Arellano", "fr": "Arellano", "en": "Arellano" },
  "f_t1_3_ans3": { "es": "Señorío de Cameros", "fr": "Seigneurie de Cameros", "en": "Lordship of Cameros" },
  "f_t1_3_hint1": { "es": "[PENDIENTE] Pista 1: Famosa casa nobiliaria de la corona castellana y navarra.", "fr": "[PENDIENTE] Indice 1 : Maison noble réputée.", "en": "[PENDIENTE] Hint 1: Famous noble house." },
  "f_t1_3_hint2": { "es": "[PENDIENTE] Pista 2: Empieza por Ramírez de...", "fr": "[PENDIENTE] Indice 2 : Commence par Ramírez de...", "en": "[PENDIENTE] Hint 2: Starts with Ramírez de..." },
  "f_t1_3_hint3": { "es": "[PENDIENTE] Pista 3: Ramírez de Arellano.", "fr": "[PENDIENTE] Indice 3 : Ramírez de Arellano.", "en": "[PENDIENTE] Hint 3: Ramírez de Arellano." },

  // f_t2_1
  "f_t2_1_question": {
    "es": "[PENDIENTE] Al cruzar el Arco de la Villa, ¿qué función defensiva tenía este portal en el medievo?",
    "fr": "[PENDIENTE] En franchissant l'Arche de la Villa, quelle fonction défensive avait ce portail ?",
    "en": "[PENDIENTE] When crossing the Village Arch, what defensive function did this gate serve?"
  },
  "f_t2_1_opt_a": { "es": "[PENDIENTE] Mazmorra de herejes", "fr": "[PENDIENTE] Cachot des hérétiques", "en": "[PENDIENTE] Dungeon for heretics" },
  "f_t2_1_opt_b": { "es": "[PENDIENTE] Bodega comunal de diezmo", "fr": "[PENDIENTE] Cave communale de la dîme", "en": "[PENDIENTE] Communal tithe cellar" },
  "f_t2_1_opt_c": { "es": "Puerta fortificada y control de acceso a la villa", "fr": "Porte fortifiée et contrôle d'accès au village", "en": "Fortified gate and town access checkpoint" },
  "f_t2_1_opt_d": { "es": "[PENDIENTE] Campanario de aviso", "fr": "[PENDIENTE] Clocher d'alarme", "en": "[PENDIENTE] Warning belfry" },
  "f_t2_1_hint1": { "es": "[PENDIENTE] Pista 1: Cerraba la villa amurallada por la noche.", "fr": "[PENDIENTE] Indice 1 : Fermeture nocturne de la cité.", "en": "[PENDIENTE] Hint 1: Sealed the walled town at night." },
  "f_t2_1_hint2": { "es": "[PENDIENTE] Pista 2: Controlaba quién entraba con mercancías (¡y vino!).", "fr": "[PENDIENTE] Indice 2 : Contrôle des marchandises.", "en": "[PENDIENTE] Hint 2: Controlled incoming trade." },
  "f_t2_1_hint3": { "es": "[PENDIENTE] Pista 3: Puerta fortificada de acceso.", "fr": "[PENDIENTE] Indice 3 : Porte fortifiée.", "en": "[PENDIENTE] Hint 3: Fortified access gate." },

  // f_t2_2
  "f_t2_2_question": {
    "es": "[PENDIENTE] ¿Qué tipo de piedra arenisca característica de la cuenca del Iregua forma las dovelas del arco?",
    "fr": "[PENDIENTE] Quel type de grès de l'Iregua forme les voussoirs de l'arche ?",
    "en": "[PENDIENTE] What typical sandstone from the Iregua basin forms the arch voussoirs?"
  },
  "f_t2_2_ans1": { "es": "Arenisca", "fr": "Grès", "en": "Sandstone" },
  "f_t2_2_ans2": { "es": "Piedra de sillería", "fr": "Pierre de taille", "en": "Ashlar" },
  "f_t2_2_ans3": { "es": "Arenisca rojiza", "fr": "Grès rougeâtre", "en": "Red sandstone" },
  "f_t2_2_hint1": { "es": "[PENDIENTE] Pista 1: Roca sedimentaria de grano fino y tacto áspero.", "fr": "[PENDIENTE] Indice 1 : Roche sédimentaire.", "en": "[PENDIENTE] Hint 1: Sedimentary stone." },
  "f_t2_2_hint2": { "es": "[PENDIENTE] Pista 2: Compuesta de granos de arena prensados.", "fr": "[PENDIENTE] Indice 2 : Composée de sable consolidé.", "en": "[PENDIENTE] Hint 2: Made of compacted sand." },
  "f_t2_2_hint3": { "es": "[PENDIENTE] Pista 3: Arenisca.", "fr": "[PENDIENTE] Indice 3 : Grès.", "en": "[PENDIENTE] Hint 3: Sandstone." },

  // f_t2_3
  "f_t2_3_question": {
    "es": "[PENDIENTE] ¿Qué patrón religioso coronaba tradicionalmente la hornacina superior de esta puerta?",
    "fr": "[PENDIENTE] Quel saint patron surplombait la niche supérieure de cette porte ?",
    "en": "[PENDIENTE] Which patron saint traditionally topped the upper niche of this gate?"
  },
  "f_t2_3_ans1": { "es": "Virgen de Villavieja", "fr": "Vierge de Villavieja", "en": "Virgin of Villavieja" },
  "f_t2_3_ans2": { "es": "San Millán", "fr": "Saint Millán", "en": "Saint Millan" },
  "f_t2_3_ans3": { "es": "Nuestra Señora", "fr": "Notre-Dame", "en": "Our Lady" },
  "f_t2_3_hint1": { "es": "[PENDIENTE] Pista 1: La patrona venerada en la ermita del valle.", "fr": "[PENDIENTE] Indice 1 : La patronne de la vallée.", "en": "[PENDIENTE] Hint 1: The valley's patroness." },
  "f_t2_3_hint2": { "es": "[PENDIENTE] Pista 2: Villavieja.", "fr": "[PENDIENTE] Indice 2 : Villavieja.", "en": "[PENDIENTE] Hint 2: Villavieja." },
  "f_t2_3_hint3": { "es": "[PENDIENTE] Pista 3: Virgen de Villavieja.", "fr": "[PENDIENTE] Indice 3 : Vierge de Villavieja.", "en": "[PENDIENTE] Hint 3: Virgin of Villavieja." },

  // f_t3_1
  "f_t3_1_question": {
    "es": "[PENDIENTE] Desde el Mirador Puerta de Cameros se domina el valle. ¿Qué río vertebra todo este cauce?",
    "fr": "[PENDIENTE] Depuis le belvédère Porte de Cameros, quelle rivière traverse la vallée ?",
    "en": "[PENDIENTE] From Puerta de Cameros viewpoint, which river carves this entire valley?"
  },
  "f_t3_1_opt_a": { "es": "[PENDIENTE] Río Ebro", "fr": "[PENDIENTE] Fleuve Èbre", "en": "[PENDIENTE] Ebro River" },
  "f_t3_1_opt_b": { "es": "Río Iregua", "fr": "Rivière Iregua", "en": "Iregua River" },
  "f_t3_1_opt_c": { "es": "[PENDIENTE] Río Najerilla", "fr": "[PENDIENTE] Rivière Najerilla", "en": "[PENDIENTE] Najerilla River" },
  "f_t3_1_opt_d": { "es": "[PENDIENTE] Río Leza", "fr": "[PENDIENTE] Rivière Leza", "en": "[PENDIENTE] Leza River" },
  "f_t3_1_hint1": { "es": "[PENDIENTE] Pista 1: Nace en la Sierra Cebollera y baja hacia Logroño.", "fr": "[PENDIENTE] Indice 1 : Prend sa source dans la Sierra Cebollera.", "en": "[PENDIENTE] Hint 1: Originates in Sierra Cebollera." },
  "f_t3_1_hint2": { "es": "[PENDIENTE] Pista 2: Nombre de seis letras que empieza por I.", "fr": "[PENDIENTE] Indice 2 : Débute par la lettre I.", "en": "[PENDIENTE] Hint 2: Starts with letter I." },
  "f_t3_1_hint3": { "es": "[PENDIENTE] Pista 3: Río Iregua.", "fr": "[PENDIENTE] Indice 3 : Rivière Iregua.", "en": "[PENDIENTE] Hint 3: Iregua River." },

  // f_t3_2
  "f_t3_2_question": {
    "es": "[PENDIENTE] ¿Qué formación montañosa se divisa al fondo custodiando la entrada sur hacia las tierras altas?",
    "fr": "[PENDIENTE] Quel massif montagneux aperçoit-on au fond gardant l'accès sud ?",
    "en": "[PENDIENTE] What mountain range is seen in the distance guarding the southern pass?"
  },
  "f_t3_2_ans1": { "es": "Sierra de Cameros", "fr": "Sierra de Cameros", "en": "Sierra de Cameros" },
  "f_t3_2_ans2": { "es": "Cameros", "fr": "Cameros", "en": "Cameros" },
  "f_t3_2_ans3": { "es": "Sierra de Cebollera", "fr": "Sierra de Cebollera", "en": "Sierra Cebollera" },
  "f_t3_2_hint1": { "es": "[PENDIENTE] Pista 1: La comarca que da nombre a este mismo mirador.", "fr": "[PENDIENTE] Indice 1 : Donne son nom au belvédère.", "en": "[PENDIENTE] Hint 1: Gives name to this viewpoint." },
  "f_t3_2_hint2": { "es": "[PENDIENTE] Pista 2: Cameros.", "fr": "[PENDIENTE] Indice 2 : Cameros.", "en": "[PENDIENTE] Hint 2: Cameros." },
  "f_t3_2_hint3": { "es": "[PENDIENTE] Pista 3: Sierra de Cameros.", "fr": "[PENDIENTE] Indice 3 : Sierra de Cameros.", "en": "[PENDIENTE] Hint 3: Sierra de Cameros." },

  // f_t3_3
  "f_t3_3_question": {
    "es": "[PENDIENTE] ¿Qué actividad económica milenaria de trashumancia de ovejas merinas enriqueció a esta comarca?",
    "fr": "[PENDIENTE] Quelle activité pastorale de transhumance a enrichi cette région ?",
    "en": "[PENDIENTE] What ancient merino sheep transhumance economic activity enriched this region?"
  },
  "f_t3_3_ans1": { "es": "La Mesta", "fr": "La Mesta", "en": "La Mesta" },
  "f_t3_3_ans2": { "es": "Trashumancia", "fr": "Transhumance", "en": "Transhumance" },
  "f_t3_3_ans3": { "es": "Comercio de lana", "fr": "Commerce de laine", "en": "Wool trade" },
  "f_t3_3_hint1": { "es": "[PENDIENTE] Pista 1: Real Concejo de pastores fundado por Alfonso X el Sabio.", "fr": "[PENDIENTE] Indice 1 : Conseil des bergers fondé par Alphonse X.", "en": "[PENDIENTE] Hint 1: Royal council of shepherds." },
  "f_t3_3_hint2": { "es": "[PENDIENTE] Pista 2: La Mesta.", "fr": "[PENDIENTE] Indice 2 : La Mesta.", "en": "[PENDIENTE] Hint 2: The Mesta." },
  "f_t3_3_hint3": { "es": "[PENDIENTE] Pista 3: La Mesta / Trashumancia.", "fr": "[PENDIENTE] Indice 3 : La Mesta / Transhumance.", "en": "[PENDIENTE] Hint 3: La Mesta / Transhumance." },

  // f_t4_1
  "f_t4_1_question": {
    "es": "[PENDIENTE] Las Cuevas de Los Palomares tienen decenas de hornacinas excavadas en la roca. ¿Cuál era su uso primitivo más documentado?",
    "fr": "[PENDIENTE] Les grottes de Los Palomares comptent des niches creusées dans la roche. Quel était leur usage initial ?",
    "en": "[PENDIENTE] The Los Palomares Caves have dozens of carved niches in the cliff. What was their primary documented use?"
  },
  "f_t4_1_opt_a": { "es": "Monasterio rupestre / eremitorio medieval y cría de palomas", "fr": "Monastère rupestre / ermitage médiéval et colombier", "en": "Rock-cut monastery / medieval hermitage and dovecote" },
  "f_t4_1_opt_b": { "es": "[PENDIENTE] Depósito de pólvora castellana", "fr": "[PENDIENTE] Dépôt de poudre", "en": "[PENDIENTE] Gunpowder magazine" },
  "f_t4_1_opt_c": { "es": "[PENDIENTE] Cárcel secreta de la Inquisición", "fr": "[PENDIENTE] Prison secrète de l'Inquisition", "en": "[PENDIENTE] Inquisition prison" },
  "f_t4_1_opt_d": { "es": "[PENDIENTE] Bodega funeraria romana", "fr": "[PENDIENTE] Cave funéraire romaine", "en": "[PENDIENTE] Roman funerary cellar" },
  "f_t4_1_hint1": { "es": "[PENDIENTE] Pista 1: Monjes solitarios rezaban aquí antes de que llegaran las palomas.", "fr": "[PENDIENTE] Indice 1 : Moines ermites et oiseaux.", "en": "[PENDIENTE] Hint 1: Hermit monks and doves." },
  "f_t4_1_hint2": { "es": "[PENDIENTE] Pista 2: Conjunto rupestre eremítico.", "fr": "[PENDIENTE] Indice 2 : Ensemble rupestre érémitique.", "en": "[PENDIENTE] Hint 2: Rock-hewn hermitage." },
  "f_t4_1_hint3": { "es": "[PENDIENTE] Pista 3: Eremitorio rupestre y palomar.", "fr": "[PENDIENTE] Indice 3 : Ermitage et colombier.", "en": "[PENDIENTE] Hint 3: Hermitage and dovecote." },

  // f_t4_2
  "f_t4_2_question": {
    "es": "[PENDIENTE] ¿En qué tipo de roca blanda conglomerada se excavaron los huecos de Los Palomares?",
    "fr": "[PENDIENTE] Dans quel type de roche conglomérée les cavités ont-elles été creusées ?",
    "en": "[PENDIENTE] In which soft conglomerate rock were the Los Palomares recesses carved?"
  },
  "f_t4_2_ans1": { "es": "Conglomerado", "fr": "Conglomérat", "en": "Conglomerate" },
  "f_t4_2_ans2": { "es": "Arenisca arcillosa", "fr": "Grès argileux", "en": "Clay sandstone" },
  "f_t4_2_ans3": { "es": "Yeso y conglomerado", "fr": "Gypse et conglomérat", "en": "Gypsum and conglomerate" },
  "f_t4_2_hint1": { "es": "[PENDIENTE] Pista 1: Grava y cantos rodados cementados naturalmente.", "fr": "[PENDIENTE] Indice 1 : Graviers et galets cimentés.", "en": "[PENDIENTE] Hint 1: Naturally cemented gravel and pebbles." },
  "f_t4_2_hint2": { "es": "[PENDIENTE] Pista 2: Conglomerado geológico.", "fr": "[PENDIENTE] Indice 2 : Conglomérat géologique.", "en": "[PENDIENTE] Hint 2: Geological conglomerate." },
  "f_t4_2_hint3": { "es": "[PENDIENTE] Pista 3: Conglomerado.", "fr": "[PENDIENTE] Indice 3 : Conglomérat.", "en": "[PENDIENTE] Hint 3: Conglomerate." },

  // f_t4_3
  "f_t4_3_question": {
    "es": "[PENDIENTE] ¿Aproximadamente cuántos nichos individuales u hornacinas se conservan en esta pared vertical?",
    "fr": "[PENDIENTE] Environ combien de niches individuelles compte cette paroi verticale ?",
    "en": "[PENDIENTE] Approximately how many individual niches are preserved in this cliff wall?"
  },
  "f_t4_3_ans1": { "es": "Cientos", "fr": "Centaines", "en": "Hundreds" },
  "f_t4_3_ans2": { "es": "Más de cien", "fr": "Plus de cent", "en": "More than one hundred" },
  "f_t4_3_ans3": { "es": "300", "fr": "300", "en": "300" },
  "f_t4_3_hint1": { "es": "[PENDIENTE] Pista 1: Son varios centenares repartidos en varios niveles.", "fr": "[PENDIENTE] Indice 1 : Plusieurs centaines sur plusieurs niveaux.", "en": "[PENDIENTE] Hint 1: Several hundreds over multiple levels." },
  "f_t4_3_hint2": { "es": "[PENDIENTE] Pista 2: Alrededor de tres centenares.", "fr": "[PENDIENTE] Indice 2 : Autour de 300.", "en": "[PENDIENTE] Hint 2: Around 300." },
  "f_t4_3_hint3": { "es": "[PENDIENTE] Pista 3: Cientos (aprox. 300).", "fr": "[PENDIENTE] Indice 3 : Centaines (~300).", "en": "[PENDIENTE] Hint 3: Hundreds (~300)." },

  // f_t5_1
  "f_t5_1_question": {
    "es": "[PENDIENTE] En la Ermita de Villavieja, ¿qué estilo arquitectónico rural predomina en su construcción original?",
    "fr": "[PENDIENTE] À l'Ermitage de Villavieja, quel style architectural rural domine ?",
    "en": "[PENDIENTE] At Villavieja Hermitage, what rural architectural style prevails in its original construction?"
  },
  "f_t5_1_ans1": { "es": "Barroco popular", "fr": "Baroque populaire", "en": "Folk baroque" },
  "f_t5_1_ans2": { "es": "Románico rural", "fr": "Roman rural", "en": "Rural Romanesque" },
  "f_t5_1_ans3": { "es": "Barroco", "fr": "Baroque", "en": "Baroque" },
  "f_t5_1_hint1": { "es": "[PENDIENTE] Pista 1: Edificada entre los siglos XVII y XVIII con añadidos.", "fr": "[PENDIENTE] Indice 1 : Bâtie entre les XVIIe et XVIIIe siècles.", "en": "[PENDIENTE] Hint 1: Built between the 17th and 18th centuries." },
  "f_t5_1_hint2": { "es": "[PENDIENTE] Pista 2: Estilo barroco sencillo y devocional.", "fr": "[PENDIENTE] Indice 2 : Style baroque simple.", "en": "[PENDIENTE] Hint 2: Simple baroque style." },
  "f_t5_1_hint3": { "es": "[PENDIENTE] Pista 3: Barroco popular.", "fr": "[PENDIENTE] Indice 3 : Baroque populaire.", "en": "[PENDIENTE] Hint 3: Folk Baroque." },

  // f_t5_2
  "f_t5_2_question": {
    "es": "[PENDIENTE] ¿Qué celebración popular reúne cada primavera a los vecinos de Nalda en esta ermita?",
    "fr": "[PENDIENTE] Quelle fête populaire réunit chaque printemps les habitants de Nalda ici ?",
    "en": "[PENDIENTE] What traditional gathering brings Nalda locals together here every spring?"
  },
  "f_t5_2_ans1": { "es": "Romería de Villavieja", "fr": "Pèlerinage de Villavieja", "en": "Villavieja Pilgrimage" },
  "f_t5_2_ans2": { "es": "Romería", "fr": "Romería", "en": "Romeria" },
  "f_t5_2_hint1": { "es": "[PENDIENTE] Pista 1: Peregrinación campestre con comida, jotas y vino.", "fr": "[PENDIENTE] Indice 1 : Pèlerinage champêtre avec vin.", "en": "[PENDIENTE] Hint 1: Country pilgrimage with food and wine." },
  "f_t5_2_hint2": { "es": "[PENDIENTE] Pista 2: La Romería anual.", "fr": "[PENDIENTE] Indice 2 : La Romería annuelle.", "en": "[PENDIENTE] Hint 2: The annual Romería." },
  "f_t5_2_hint3": { "es": "[PENDIENTE] Pista 3: Romería de Villavieja.", "fr": "[PENDIENTE] Indice 3 : Romería de Villavieja.", "en": "[PENDIENTE] Hint 3: Villavieja Pilgrimage." },

  // Extra tests
  "f_extra_brindis_title": {
    "es": "Brindis Tabernero en el Castillo",
    "fr": "Santé de Tavernier au Château",
    "en": "Tavern Toast at the Castle"
  },
  "f_extra_brindis_description": {
    "es": "[PENDIENTE] Hazte una foto alzando una bota, vaso o cantimplora brindando con las ruinas del castillo al fondo.",
    "fr": "[PENDIENTE] Prends une photo en levant ton verre ou ta gourde devant les ruines du château.",
    "en": "[PENDIENTE] Take a photo raising a canteen, cup or flask toasting with the castle ruins behind you."
  },
  "f_extra_eructo_title": {
    "es": "Eructo Divino en el Arco",
    "fr": "Rot Divin sous l'Arche",
    "en": "Divine Burp under the Arch"
  },
  "f_extra_eructo_description": {
    "es": "[PENDIENTE] Graba un sonoro suspiro, eructo o exclamación de taberna bajo la acústica de la bóveda del arco.",
    "fr": "[PENDIENTE] Enregistre un soupir sonore ou une exclamation de taverne sous la voûte de l'arche.",
    "en": "[PENDIENTE] Record a resounding tavern sigh, burp or cheer under the arch's acoustic vault."
  },
  "f_extra_confesion_title": {
    "es": "Confesión Secreta en las Cuevas",
    "fr": "Confession Secrète aux Grottes",
    "en": "Secret Confession in the Caves"
  },
  "f_extra_confesion_description": {
    "es": "[PENDIENTE] Susurra un secreto inconfesable (o un pecado gastronómico) en una de las hornacinas de Los Palomares.",
    "fr": "[PENDIENTE] Chuchote un secret inavouable dans l'une des niches de Los Palomares.",
    "en": "[PENDIENTE] Whisper an unconfessable secret (or food craving) into one of the Los Palomares niches."
  },
  "f_extra_pecho_title": {
    "es": "A Pecho Descubierto en el Mirador",
    "fr": "Poitrine au Vent au Belvédère",
    "en": "Chest to the Wind at the Viewpoint"
  },
  "f_extra_pecho_description": {
    "es": "[PENDIENTE] Sácate una foto abriendo los brazos al viento de Cameros como si fueras el rey del Iregua.",
    "fr": "[PENDIENTE] Prends une photo ouvrant les bras au vent de Cameros comme le roi de l'Iregua.",
    "en": "[PENDIENTE] Take a photo opening your arms to the Cameros wind like the king of the Iregua valley."
  },
  "f_extra_siesta_title": {
    "es": "La Siesta Eterna en Villavieja",
    "fr": "La Sieste Éternelle à Villavieja",
    "en": "The Eternal Nap at Villavieja"
  },
  "f_extra_siesta_description": {
    "es": "[PENDIENTE] Graba un breve vídeo de 3 segundos fingiendo roncar plácidamente en el banco o prado de la ermita.",
    "fr": "[PENDIENTE] Enregistre une vidéo de 3 secondes simulant un ronflement paisible près de l'ermitage.",
    "en": "[PENDIENTE] Record a quick 3-second video pretending to snore peacefully on the hermitage bench or lawn."
  },
  "f_extra_baile_vino_title": {
    "es": "El Baile del Monje Achispado",
    "fr": "La Danse du Moine Éméché",
    "en": "The Tipsy Monk Dance"
  },
  "f_extra_baile_vino_description": {
    "es": "[PENDIENTE] Imita los pasos torpes y alegres de Fray Botijo celebrando una buena cosecha de vino de Rioja.",
    "fr": "[PENDIENTE] Imite les pas joyeux et maladroits de Fray Botijo fêtant les vendanges.",
    "en": "[PENDIENTE] Mimic the clumsy, merry steps of Friar Botijo celebrating a fine Rioja grape harvest."
  },

  // MetaEnigma
  "f_meta_enigma_title": {
    "es": "El Códice del Barril de 1387",
    "fr": "Le Codex du Tonneau de 1387",
    "en": "The 1387 Barrel Codex"
  },
  "f_meta_enigma_description": {
    "es": "[PENDIENTE] Reúne las 6 letras secretas (B-O-T-I-J-O) ocultas en las reliquias de Fray Botijo para destapar el barril de la salvación.",
    "fr": "[PENDIENTE] Réunis les 6 lettres secrètes (B-O-T-I-J-O) cachées dans les reliques pour ouvrir le tonneau du salut.",
    "en": "[PENDIENTE] Gather the 6 secret letters (B-O-T-I-J-O) hidden within Friar Botijo's relics to unlock the barrel of salvation."
  },

  // UI Report Joke & Content Rating
  "game.reportJoke": {
    "es": "Reportar chiste (ofensivo)",
    "fr": "Signaler une blague (offensante)",
    "en": "Report joke (offensive)"
  },
  "game.reportJokeSuccess": {
    "es": "Fray Botijo pide perdón de rodillas ante la Virgen de Villavieja y te ofrece un trago virtual 🍷",
    "fr": "Fray Botijo demande pardon à genoux devant la Vierge de Villavieja et t'offre un verre virtuel 🍷",
    "en": "Friar Botijo apologised on his knees before the Virgin of Villavieja and offers you a virtual drink 🍷"
  },
  "game.contentRatingAdultWarning": {
    "es": "Contenido picante con humor irreverente. No apto para niños ni para gente sin sentido del humor.",
    "fr": "Contenu épicé avec humour irrévérencieux. Pas pour les enfants ni pour les personnes sans sens de l'humour.",
    "en": "Spicy content with irreverent humour. Not suitable for children or people without a sense of humour."
  }
};

// Transform to app ForestPack schema
function createFullForestPack() {
  const pois = naldaPack.pois.map(p => {
    const nameTrans = naldaTranslations[p.nameKey]?.es || p.nameKey;
    const arTrans = naldaTranslations[p.ar.descriptionKey]?.es || p.ar.descriptionKey;
    return {
      id: p.id,
      name: nameTrans,
      description: arTrans,
      lat: p.coords.lat,
      lng: p.coords.lng,
      emoji: p.emoji,
      clueSnippet: `Busca la reliquia etérea de Fray Botijo en ${nameTrans}.`,
      arAsset: {
        preset: "ghost_monk",
        type: "ghost_monk",
        label: "Holograma 3D de Fray Botijo",
        title: "Aparición Espectral de Fray Botijo",
        modelUrl: p.ar.model,
        model: p.ar.model,
        scale: 1.3,
        heightOffsetMeters: 1.1,
        revealTrigger: "onArrival",
        trigger: p.ar.trigger,
        description: arTrans,
        descriptionKey: p.ar.descriptionKey,
        pose: p.ar.model.includes('eructo') ? 'eructo' :
              p.ar.model.includes('confesion') ? 'confesion' :
              p.ar.model.includes('meando') ? 'meando' :
              p.ar.model.includes('dormido') ? 'dormido' : 'borracho'
      }
    };
  });

  const storyDef = naldaPack.stories[0];
  const storyTitle = naldaTranslations[storyDef.titleKey]?.es || "El Fraile que Bebió Demasiado";
  const storySummary = naldaTranslations.forest_nalda_fray_description.es;
  const narratorName = naldaTranslations[storyDef.guide.nameKey]?.es || "Fray Botijo";
  const narratorPersona = naldaTranslations[storyDef.guide.personaKey]?.es;
  const narratorGreeting = naldaTranslations[storyDef.guide.greetingKey]?.es;

  const stories = [
    {
      id: storyDef.id,
      title: storyTitle,
      icon: "🍺",
      summary: storySummary,
      narrative: narratorGreeting,
      mission: "Acompañar al fantasma de Fray Botijo por Nalda, descifrar los enigmas históricos entre trago y trago, y reconstruir la palabra BOTIJO.",
      narratorName: narratorName,
      narratorRole: "Fantasma de monje copista borracho (1387)",
      narratorTone: "Tabernero medieval cachondo, irreverente y sabio",
      narratorAvatar: "🍺",
      voiceName: "Fenrir",
      characterBio: narratorPersona,
      characterGreeting: narratorGreeting,
      guide: storyDef.guide,
      contentRating: "adult",
      contentWarning: "Contenido picante con humor irreverente. No apto para niños ni para gente sin sentido del humor.",
      durations: storyDef.durations,
      difficulties: storyDef.difficulties
    }
  ];

  // Route presets
  const routePresets = {
    "30min": storyDef.durations["30min"].pois,
    "1h": storyDef.durations["1h"].pois,
    "1.5h": storyDef.durations["1h30"].pois,
    "1h30": storyDef.durations["1h30"].pois,
    "2h": storyDef.durations["2h"].pois
  };

  // Convert tests to Riddles
  const riddles = [];

  // Main tests
  storyDef.tests.forEach((t, idx) => {
    const qText = naldaTranslations[t.questionKey]?.es || t.questionKey;
    const hints = (t.hintsKeys || []).map(hk => naldaTranslations[hk]?.es || hk);
    
    let options = undefined;
    let answer = undefined;
    let acceptedAnswers = undefined;

    if (t.optionsKeys && t.optionsKeys.length > 0) {
      options = t.optionsKeys.map(ok => naldaTranslations[ok]?.es || ok);
      answer = options[t.correctIndex || 0];
    } else if (t.answersKeys && t.answersKeys.length > 0) {
      acceptedAnswers = t.answersKeys.map(ak => naldaTranslations[ak]?.es || ak);
      answer = acceptedAnswers[0];
    }

    const fragmentLetter = ["B", "O", "T", "I", "J", "O"][idx % 6];

    riddles.push({
      id: t.id,
      poiId: t.poi,
      storyId: storyDef.id,
      name: `Misterio de Fray Botijo #${idx + 1}`,
      difficulty: t.difficulty,
      question: qText,
      type: t.type === 'test' ? 'multiple_choice' : (t.type === 'text' ? 'open_text' : t.type),
      options,
      answer,
      acceptedAnswers,
      hints,
      staticHints: [hints[0] || 'Atiende al entorno', hints[1] || 'Recuerda el vino', hints[2] || answer || ''],
      points: t.points,
      correctIndex: t.correctIndex,
      questionKey: t.questionKey,
      optionsKeys: t.optionsKeys,
      hintsKeys: t.hintsKeys,
      answersKeys: t.answersKeys,
      metaRune: fragmentLetter,
      metaRuneClue: `Fragmento rúnico '${fragmentLetter}' del tonel sagrado`
    });
  });

  // Extra tests
  storyDef.extraTests.forEach(et => {
    const title = naldaTranslations[et.titleKey]?.es || et.titleKey;
    const desc = naldaTranslations[et.descriptionKey]?.es || et.descriptionKey;
    riddles.push({
      id: et.id,
      poiId: et.poi,
      storyId: storyDef.id,
      name: title,
      difficulty: '*',
      question: desc,
      type: et.type,
      points: et.points,
      optional: true,
      isBonus: true,
      bonusPoints: et.points,
      titleKey: et.titleKey,
      descriptionKey: et.descriptionKey
    });
  });

  const sceneNarratives = {
    "fraile-botijo_castillo-nalda-f": "Fray Botijo te espera tambaleándose en la torre del castillo con una jarra de barro.",
    "fraile-botijo_cuevas-palomares-f": "Entre los nichos escarpados de Los Palomares, el fraile busca su escondite de vino favorito.",
    "fraile-botijo_arco-villa-f": "El eco del arco de la villa retumba con las risotadas de taberna del fraile.",
    "fraile-botijo_mirador-cameros-f": "Fray Botijo otea el valle del Iregua mientras brinda al viento de Cameros.",
    "fraile-botijo_ermita-villavieja-f": "A la sombra de Villavieja, Fray Botijo se despereza de una siesta de seis siglos."
  };

  const bridgePhrases = {
    "castillo-nalda-f_to_arco-villa-f": "Baja con cuidado las callejuelas empedradas hasta el Arco de la Villa sin caerte como Fray Botijo.",
    "arco-villa-f_to_mirador-cameros-f": "Sube hacia el mirador para contemplar la majestuosa Puerta de Cameros.",
    "mirador-cameros-f_to_cuevas-palomares-f": "Dirígete hacia el farallón arcilloso donde se ocultan las misteriosas cuevas de Los Palomares.",
    "cuevas-palomares-f_to_ermita-villavieja-f": "Toma el sendero entre campos y huertas hasta la apacible Ermita de Villavieja."
  };

  const metaEnigma = {
    keyword: "BOTIJO",
    title: naldaTranslations[storyDef.metaEnigma.titleKey]?.es || "El Códice del Barril de 1387",
    description: naldaTranslations[storyDef.metaEnigma.descriptionKey]?.es || "Reúne las 6 letras secretas (B-O-T-I-J-O).",
    hint: "El recipiente de barro que refresca el agua y guarda el secreto del vino riojano.",
    successNarrative: "¡BINGOOOO, CHAVAL! ¡Has formado la palabra sagrada BOTIJO! Fray Botijo alza su jarra eterna hacia el cielo de Nalda y te nombra Caballero Honorario de la Taberna Medieval. ¡El misterio del barril ha sido resuelto!",
    titleKey: storyDef.metaEnigma.titleKey,
    descriptionKey: storyDef.metaEnigma.descriptionKey,
    fragments: storyDef.metaEnigma.fragments
  };

  return {
    id: "nalda-fraybotijo",
    name: "Nalda — El Fraile que Bebió Demasiado",
    country: "España (La Rioja)",
    region: "La Rioja, España",
    description: "Recorre Nalda junto al irreverente fantasma de Fray Botijo desvelando ruinas medievales, cuevas eremíticas y la historia del valle del Iregua entre chistes verdes y datos reales.",
    centerLat: 42.3351,
    centerLng: -2.4883,
    coverImageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    attribution: "Basado en la historia real y patrimonio de Nalda (La Rioja) y el humor medieval del fraile copista Fray Botijo (1387).",
    credits: "Basado en la historia real y patrimonio de Nalda (La Rioja) y el humor medieval del fraile copista Fray Botijo (1387).",
    defaultLanguage: "es",
    languages: ["es", "fr", "en"],
    isPublished: true,
    contentRating: "adult",
    contentWarning: "Contenido picante con humor irreverente. No apto para niños ni para gente sin sentido del humor.",
    pois,
    routePresets,
    stories,
    riddles,
    sceneNarratives,
    bridgePhrases,
    metaEnigma
  };
}

const fullPack = createFullForestPack();

// 1. Update /data/forests.json
const forestsPath = path.resolve('data/forests.json');
let forests = JSON.parse(fs.readFileSync(forestsPath, 'utf-8'));
forests = forests.filter(f => f.id !== 'nalda-fraybotijo' && f.id !== 'nalda');
forests.push(fullPack);
fs.writeFileSync(forestsPath, JSON.stringify(forests, null, 2), 'utf-8');
console.log('Saved to data/forests.json');

// 2. Also save forest-packs-seed.json at root and /data
fs.writeFileSync(path.resolve('forest-packs-seed.json'), JSON.stringify(forests, null, 2), 'utf-8');
fs.writeFileSync(path.resolve('data/forest-packs-seed.json'), JSON.stringify(forests, null, 2), 'utf-8');
console.log('Saved to forest-packs-seed.json');

// 3. Update src/data/seedPacks.ts
const seedPacksPath = path.resolve('src/data/seedPacks.ts');
let seedContent = fs.readFileSync(seedPacksPath, 'utf-8');
if (seedContent.includes('id: "nalda-fraybotijo"')) {
  // Already there
} else {
  // Export SEED_FOREST_PACKS from the json data or inline
  const newSeedCode = `import { ForestPack } from '../types';\nimport forestsJson from '../../data/forests.json';\n\nexport const SEED_FOREST_PACKS: ForestPack[] = forestsJson as unknown as ForestPack[];\n`;
  fs.writeFileSync(seedPacksPath, newSeedCode, 'utf-8');
  console.log('Updated src/data/seedPacks.ts to load dynamically from forests.json');
}

// 4. Update i18n files: /src/data/i18n.json and /i18n.json
function updateI18nFile(filePath) {
  const i18n = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  if (!i18n.ui) i18n.ui = { es: {}, fr: {}, en: {} };
  if (!i18n.ui.es) i18n.ui.es = {};
  if (!i18n.ui.fr) i18n.ui.fr = {};
  if (!i18n.ui.en) i18n.ui.en = {};

  // Add keys to ui dictionary
  Object.entries(naldaTranslations).forEach(([k, trans]) => {
    i18n.ui.es[k] = trans.es;
    i18n.ui.fr[k] = trans.fr;
    i18n.ui.en[k] = trans.en;
  });

  // Also add to keys root dictionary so t() can lookup directly by key
  if (!i18n.keys) i18n.keys = {};
  Object.entries(naldaTranslations).forEach(([k, trans]) => {
    i18n.keys[k] = trans;
  });

  // Also register under forests['nalda-fraybotijo']
  if (!i18n.forests) i18n.forests = {};
  i18n.forests['nalda-fraybotijo'] = {
    es: {
      name: naldaTranslations.forest_nalda_fray_name.es,
      country: "España (La Rioja)",
      description: naldaTranslations.forest_nalda_fray_description.es
    },
    fr: {
      name: naldaTranslations.forest_nalda_fray_name.fr,
      country: "Espagne (La Rioja)",
      description: naldaTranslations.forest_nalda_fray_description.fr
    },
    en: {
      name: naldaTranslations.forest_nalda_fray_name.en,
      country: "Spain (La Rioja)",
      description: naldaTranslations.forest_nalda_fray_description.en
    }
  };

  fs.writeFileSync(filePath, JSON.stringify(i18n, null, 2), 'utf-8');
  console.log('Updated i18n at ' + filePath);
}

updateI18nFile(path.resolve('src/data/i18n.json'));
updateI18nFile(path.resolve('i18n.json'));

console.log('Nalda Fray Botijo successfully integrated!');
