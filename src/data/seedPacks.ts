import { ForestPack } from '../types';

export const SEED_FOREST_PACKS: ForestPack[] = [
  {
    id: "bosque-canejan-cestas",
    name: "Bosque de Canéjan-Cestas",
    country: "Francia (Gironde)",
    description: "Senda boscosa a lo largo del río Eau Bourde entre molinos centenarios, robles mágicos y leyendas de la resistencia bordelesa.",
    centerLat: 44.7645,
    centerLng: -0.6358,
    coverImageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    attribution: "Historia «La Promenade Enchantée» basada en el proyecto real Divercités «FOR[Ê]VEUR» (2026), cuentos y esculturas de niños de Canéjan junto a un escultor y cuentacuentos local.",
    credits: "Historia «La Promenade Enchantée» basada en el proyecto real Divercités «FOR[Ê]VEUR» (2026), cuentos y esculturas de niños de Canéjan junto a un escultor y cuentacuentos local.",
    isPublished: true,
    pois: [
      {
        id: "moulin_rouillac",
        name: "Moulin de Rouillac",
        description: "Antiguo molino del s. XIX a orillas del río Eau Bourde. Sus muelas trituraban trigo y centeno impulsadas por la corriente.",
        lat: 44.7641,
        lng: -0.6352,
        emoji: "⚙️",
        clueSnippet: "Busca los viejos engranajes de hierro y las compuertas de madera que regulaban la fuerza del agua.",
        arAsset: {
          preset: "rueda_hidraulica",
          label: "Rueda hidráulica 3D",
          title: "Rueda Hidráulica de Madera y Bronce",
          scale: 1.4,
          heightOffsetMeters: 1.2,
          revealTrigger: "onArrival",
          description: "La réplica etérea de la gran rueda dentada gira impulsada por el agua del río Eau Bourde."
        }
      },
      {
        id: "ruisseau_moulin",
        name: "Ruisseau du Moulin",
        description: "Arroyo cantarín cubierto de musgo que alimenta el caz del molino, donde nadan pequeños peces de río.",
        lat: 44.7652,
        lng: -0.6368,
        emoji: "💧",
        clueSnippet: "El susurro de la corriente oculta el secreto de las piedras redondeadas por los siglos.",
        arAsset: {
          preset: "cofre_sumergido",
          label: "Cofre sumergido 3D",
          title: "Cofre Sumergido de la Resistencia",
          scale: 1.2,
          heightOffsetMeters: 0.7,
          revealTrigger: "onRiddleSolved",
          description: "Un cofre de campaña estanco que guardaba mapas de evacuación y códigos cifrados de 1944."
        }
      },
      {
        id: "chene_soupirs",
        name: "Chêne des Soupirs",
        description: "Roble bicentenario con ramas arqueadas como brazos protectores. El viento murmura confidencias entre sus hojas.",
        lat: 44.7668,
        lng: -0.6341,
        emoji: "🌳",
        clueSnippet: "En la corteza rugosa del lado norte se aprecian las marcas que dejaron antiguos viajeros.",
        arAsset: {
          preset: "espiritu_guardian",
          label: "Espíritu guardián luminoso 3D",
          title: "Espíritu Guardián del Bosque",
          scale: 1.5,
          heightOffsetMeters: 1.8,
          revealTrigger: "onArrival",
          description: "Un orbe luminoso con filamentos dorados que pulsa al compás del viento entre las ramas del roble."
        }
      },
      {
        id: "pont_sorciere",
        name: "Pont de la Sorcière",
        description: "Puente rústico de piedra sobre una curva cerrada del sendero, envuelto en leyendas de pociones y fuego fatuo.",
        lat: 44.7684,
        lng: -0.6375,
        emoji: "🌉",
        clueSnippet: "Bajo el arco de piedra, el reflejo del agua dibuja símbolos sólo visibles con buena luz.",
        arAsset: {
          preset: "caldero_vapor",
          label: "Caldero mágico de vapor 3D",
          title: "Caldero Mágico de Piedra",
          scale: 1.3,
          heightOffsetMeters: 1.0,
          revealTrigger: "onRiddleSolved",
          description: "Caldero de la bruja Sylvaine del que emanan partículas brillantes de vapor azul y verde."
        }
      },
      {
        id: "cabane_forestier",
        name: "Cabane du Forestier",
        description: "Refugio tradicional de resineros construido con troncos de pino marítimo de las Landas.",
        lat: 44.7671,
        lng: -0.6399,
        emoji: "🛖",
        clueSnippet: "El dintel de madera lleva grabado un año y un símbolo de resina.",
        arAsset: {
          preset: "farol_cuaderno",
          label: "Farol y cuaderno 3D",
          title: "Farol y Cuaderno de Resinero",
          scale: 1.2,
          heightOffsetMeters: 1.1,
          revealTrigger: "onArrival",
          description: "Un farol de queroseno encendido junto al diario de campo de los antiguos leñadores."
        },
        _todo: "Sin acertijos asignados en ninguna historia. Excluido de las rutas hasta que se le añada contenido."
      },
      {
        id: "belvedere_canejan",
        name: "Belvédère de Canéjan",
        description: "Mirador sobre el dosel de pinos que ofrece una vista despejada sobre la ribera arbolada del valle del Eau Bourde.",
        lat: 44.7632,
        lng: -0.6385,
        emoji: "🔭",
        clueSnippet: "Desde aquí se observa el horizonte donde las copas verdes se funden con el cielo.",
        arAsset: {
          preset: "catalejo_nautico",
          label: "Catalejo náutico 3D",
          title: "Catalejo Náutico de Bronce",
          scale: 1.3,
          heightOffsetMeters: 1.3,
          revealTrigger: "onRiddleSolved",
          description: "Instrumento óptico apuntando hacia las copas de los pinos y las coordenadas del valle."
        }
      }
    ],
    stories: [
      {
        id: "guerra",
        title: "Sombras de la Guerra",
        icon: "⚔️",
        summary: "Verano de 1944. Las patrullas ocupantes vigilan los caminos; la red maquis ha escondido claves a lo largo del río Eau Bourde.",
        narrative: "Las tropas de ocupación patrullan las carreteras principales. En la espesura del bosque de Canéjan, la red maquis ha escondido cilindros con coordenadas y nombres en clave. Eres el enlace del maquis.",
        mission: "Actuar como enlace de la Resistencia, seguir las señales ocultas en los árboles y descifrar las claves para abrir paso seguro hacia Burdeos.",
        narrator: {
          name: "Jean \"Le Silence\"",
          role: "Enlace veterano de la Resistencia",
          avatarEmoji: "🕵️‍♂️",
          tone: "Cauto, firme, susurrado",
          ttsVoice: "Fenrir"
        },
        narratorName: "Jean \"Le Silence\"",
        narratorRole: "Enlace veterano de la Resistencia",
        narratorTone: "Cauto, firme, susurrado",
        narratorAvatar: "🕵️‍♂️",
        voiceName: "Fenrir",
        characterBio: "Miembro veterano de la red clandestina bordelesa en 1944. Conoce cada raíz, cueva y recodo del Eau Bourde. Te hablará con cautela para no llamar la atención de las patrullas.",
        characterGreeting: "Camarada... acércate despacio. No llames la atención. ¿Has localizado la siguiente señal entre los árboles?"
      },
      {
        id: "molino_perdido",
        title: "El Secreto del Molino Perdido",
        icon: "⚙️",
        summary: "Año 1878. Maître Pierre ideó un mecanismo hidráulico para triplicar la fuerza motriz del molino y ocultó sus bocetos a lo largo de la cuenca.",
        narrative: "En 1878, Maître Pierre ideó un sistema de esclusas capaz de triplicar la fuerza motriz del molino sin desbordar el río. Ante las disputas entre terratenientes, ocultó sus planos en puntos clave de la ribera.",
        mission: "Reconstruir las medidas del caudal, examinar la cantería de las acequias y encontrar la combinación del cofre del Rouillac.",
        narrator: {
          name: "Maître Pierre",
          role: "Último maestro molinero",
          avatarEmoji: "👨‍🔧",
          tone: "Orgulloso, metódico, amante del trabajo artesanal",
          ttsVoice: "Charon"
        },
        narratorName: "Maître Pierre",
        narratorRole: "Último maestro molinero",
        narratorTone: "Orgulloso, metódico, amante del trabajo artesanal",
        narratorAvatar: "👨‍🔧",
        voiceName: "Charon",
        characterBio: "Artesano apasionado del siglo XIX que dedicó su vida a domesticar la fuerza del río. Te enseñará a leer la corriente, los engranajes de madera y las muelas de piedra.",
        characterGreeting: "¡Ah, bien hallado, joven aprendiz! Escucha el rumor del caz... las muelas tienen secretos que sólo los oídos pacientes entienden. ¿Qué duda te asalta?"
      },
      {
        id: "hechizo_encantado",
        title: "El Hechizo del Moulin Encantado",
        icon: "✨",
        summary: "Un sortilegio de niebla ha congelado la melodía del arroyo y las flores no despiertan.",
        narrative: "Un viejo sortilegio de niebla ha congelado la melodía del arroyo y las flores de ribera han cerrado sus pétalos. Sylvaine, espíritu del agua dulce, busca exploradores puros de corazón para devolver la luz.",
        mission: "Ayudar a la dríade Sylvaine a conectar con los árboles centenarios, purificar las aguas y romper el maleficio.",
        narrator: {
          name: "Sylvaine",
          role: "Dríade protectora del río Eau Bourde",
          avatarEmoji: "🧚‍♀️",
          tone: "Etérea, poética, metáforas de agua y hojas",
          ttsVoice: "Kore"
        },
        narratorName: "Sylvaine",
        narratorRole: "Dríade protectora del río Eau Bourde",
        narratorTone: "Etérea, poética, metáforas de agua y hojas",
        narratorAvatar: "🧚‍♀️",
        voiceName: "Kore",
        characterBio: "Espíritu milenario de las aguas claras y los helechos. Habla con delicadeza, como el murmullo de un manantial, y te revelará los secretos invisibles a ojos comunes.",
        characterGreeting: "Siento tu presencia entre las hojas... La niebla aún pesa sobre mis aguas. Cuéntame, caminante de corazón noble, ¿qué buscas en este claro?"
      },
      {
        id: "promenade_enchantee",
        title: "La Promenade Enchantée",
        icon: "🎨",
        summary: "Cuentos infantiles y esculturas de madera diseñados por los niños de Canéjan junto a un escultor y cuentacuentos local.",
        narrative: "En este sendero, los dibujos y cuentos de los niños cobraron vida. Duendecillos del musgo, pájaros parlanchines y piedras que cantan aguardan a toda la familia en una aventura llena de ternura.",
        mission: "Seguir las pistas rimadas de los alumnos, descubrir los animalitos del arroyo y hacer reír al bosque en familia.",
        narrator: {
          name: "Duendecillo Roble",
          role: "Cronista de los cuentos de la escuela",
          avatarEmoji: "🧝‍♂️",
          tone: "Alegre, travieso, rimador",
          ttsVoice: "Puck"
        },
        narratorName: "Duendecillo Roble",
        narratorRole: "Cronista de los cuentos de la escuela",
        narratorTone: "Alegre, travieso, rimador",
        narratorAvatar: "🧝‍♂️",
        voiceName: "Puck",
        characterBio: "Pequeño duende nacido de los dibujos y la imaginación de los escolares de Canéjan. Le encantan los acertijos alegres, saltar por las raíces y coleccionar bellotas.",
        characterGreeting: "¡Hoooola explorador! ¡Qué alegría verte por aquí! ¿Tienes preparado tu gorrito de duende o necesitas que te cante una rimilla?"
      }
    ],
    riddles: [
      // Sombras de la Guerra
      {
        id: "r_guerra_moulin_1",
        poiId: "moulin_rouillac",
        storyId: "guerra",
        name: "La Clave del Eje",
        difficulty: "novato",
        points: 100,
        question: "¿Qué elemento fundamental del molino servía a la Resistencia para esconder mensajes impermeabilizados bajo el torrente?",
        type: "multiple_choice",
        options: ["La rueda hidráulica", "La veleta del tejado", "El saco de harina", "El reloj de pared"],
        answer: "La rueda hidráulica",
        hints: [
          "Está en contacto constante con el agua que baja del cauce.",
          "Gira sin cesar cuando las compuertas están abiertas.",
          "Es la gran rueda hidráulica de madera y hierro que mueve el mecanismo."
        ],
        staticHints: [
          "Está en contacto constante con el agua que baja del cauce.",
          "Gira sin cesar cuando las compuertas están abiertas.",
          "Es la gran rueda hidráulica de madera y hierro que mueve el mecanismo."
        ]
      },
      {
        id: "r_guerra_moulin_2",
        poiId: "moulin_rouillac",
        storyId: "guerra",
        name: "El Código de las Muelas",
        difficulty: "explorador",
        points: 150,
        question: "Un mensaje en clave dice: «Tres sacos de trigo, dos vueltas de eje, un silencio al alba». Si cada saco representa 10 km y cada vuelta 5 horas, ¿cuántos km recorrió el mensajero antes de detenerse?",
        type: "open_text",
        answer: "30",
        acceptedAnswers: ["30", "30 km", "30km", "treinta"],
        hints: [
          "Fíjate únicamente en los sacos de trigo que marcan la distancia.",
          "Son 3 sacos y cada uno vale 10.",
          "Multiplica 3 por 10: el resultado es 30."
        ],
        staticHints: [
          "Fíjate únicamente en los sacos de trigo que marcan la distancia.",
          "Son 3 sacos y cada uno vale 10.",
          "Multiplica 3 por 10: el resultado es 30."
        ]
      },
      {
        id: "r_guerra_moulin_3",
        poiId: "moulin_rouillac",
        storyId: "guerra",
        name: "Cifrado de Rouillac",
        difficulty: "maestro",
        points: 250,
        question: "La contraseña maquis es el anagrama de «MOLINO» sustituyendo la última vocal por la inicial de la red «RESISTENCIA». ¿Cuál es la clave final?",
        type: "open_text",
        answer: "MOLINR",
        acceptedAnswers: ["MOLINR", "molinr"],
        hints: [
          "Toma la palabra MOLINO.",
          "Quita la última letra 'O' y añade la inicial de Resistencia ('R').",
          "La palabra clave es MOLINR."
        ],
        staticHints: [
          "Toma la palabra MOLINO.",
          "Quita la última letra 'O' y añade la inicial de Resistencia ('R').",
          "La palabra clave es MOLINR."
        ]
      },
      {
        id: "r_guerra_ruisseau_1",
        poiId: "ruisseau_moulin",
        storyId: "guerra",
        name: "Vadeando el Arroyo",
        difficulty: "novato",
        points: 100,
        question: "Para cruzar el arroyo sin dejar huellas visibles en el barro, ¿por dónde indicó el sargento caminar?",
        type: "multiple_choice",
        options: ["Pisando las piedras del lecho", "Corriendo por el camino de arena", "Saltando con botas pesadas"],
        answer: "Pisando las piedras del lecho",
        hints: [
          "El agua limpia el rastro inmediatamente.",
          "Busca las superficies duras y húmedas que sobresalen de la corriente.",
          "Debes caminar sobre las piedras del lecho del río."
        ],
        staticHints: [
          "El agua limpia el rastro inmediatamente.",
          "Busca las superficies duras y húmedas que sobresalen de la corriente.",
          "Debes caminar sobre las piedras del lecho del río."
        ]
      },
      {
        id: "r_guerra_ruisseau_2",
        poiId: "ruisseau_moulin",
        storyId: "guerra",
        name: "La Hora del Vado",
        difficulty: "explorador",
        points: 150,
        question: "Si la patrulla enemiga pasa cada 45 minutos y la última pasó a las 14:15, ¿a qué hora exacta (HH:MM) pasará la siguiente si no hay retrasos?",
        type: "open_text",
        answer: "15:00",
        acceptedAnswers: ["15:00", "15h00", "15:00h"],
        hints: [
          "Suma 45 minutos a las 14:15.",
          "15 + 45 minutos da exactamente 60 minutos.",
          "Por tanto la hora en punto es 15:00."
        ],
        staticHints: [
          "Suma 45 minutos a las 14:15.",
          "15 + 45 minutos da exactamente 60 minutos.",
          "Por tanto la hora en punto es 15:00."
        ]
      },
      {
        id: "r_guerra_chene_1",
        poiId: "chene_soupirs",
        storyId: "guerra",
        name: "El Buzón Silencioso",
        difficulty: "novato",
        points: 100,
        question: "¿Qué fruto característico produce este centenario roble, que servía a los enlaces como contraseña al llevar uno en el bolsillo?",
        type: "multiple_choice",
        options: ["Bellota", "Piña", "Castaña", "Nuez"],
        answer: "Bellota",
        hints: [
          "Es el fruto tradicional de los robles y encinas.",
          "Tiene una pequeña cúpula o sombrerito leñoso.",
          "Es la bellota."
        ],
        staticHints: [
          "Es el fruto tradicional de los robles y encinas.",
          "Tiene una pequeña cúpula o sombrerito leñoso.",
          "Es la bellota."
        ]
      },
      {
        id: "r_guerra_chene_2",
        poiId: "chene_soupirs",
        storyId: "guerra",
        name: "Orientación Maquis",
        difficulty: "explorador",
        points: 150,
        question: "¿En qué lado del tronco del roble suele crecer el musgo más espeso en este hemisferio, indicando hacia dónde está el Norte?",
        type: "multiple_choice",
        options: ["Cara Norte", "Cara Sur", "Cara Este", "Cualquier lado por igual"],
        answer: "Cara Norte",
        hints: [
          "Es el lado más sombrío y húmedo al no recibir sol directo.",
          "En Europa es la dirección boreal.",
          "Es la cara Norte."
        ],
        staticHints: [
          "Es el lado más sombrío y húmedo al no recibir sol directo.",
          "En Europa es la dirección boreal.",
          "Es la cara Norte."
        ]
      },
      {
        id: "r_guerra_belvedere_1",
        poiId: "belvedere_canejan",
        storyId: "guerra",
        name: "El Vigía del Horizonte",
        difficulty: "novato",
        points: 100,
        question: "Desde este mirador, ¿qué señal visual de humo blanco pactaron para confirmar que la ruta estaba despejada?",
        type: "multiple_choice",
        options: ["Tres columnas cortas de humo", "Un cohete de bengala roja", "Una bandera amarilla"],
        answer: "Tres columnas cortas de humo",
        hints: [
          "Columnas discretas generadas con ramas verdes.",
          "Eran tres señales repetidas.",
          "Tres columnas cortas de humo."
        ],
        staticHints: [
          "Columnas discretas generadas con ramas verdes.",
          "Eran tres señales repetidas.",
          "Tres columnas cortas de humo."
        ]
      },

      // El Secreto del Molino Perdido
      {
        id: "r_molino_moulin_1",
        poiId: "moulin_rouillac",
        storyId: "molino_perdido",
        name: "La Rueda de Piedra",
        difficulty: "novato",
        points: 100,
        question: "¿Cómo se llama la piedra circular pesada que tritura el grano contra la piedra fija?",
        type: "open_text",
        answer: "Muela",
        acceptedAnswers: ["Muela", "la muela", "muela de molino"],
        hints: [
          "Palabra de 5 letras que también nombra un tipo de diente.",
          "Gira accionada por el eje del molino.",
          "Es la «Muela»."
        ],
        staticHints: [
          "Palabra de 5 letras que también nombra un tipo de diente.",
          "Gira accionada por el eje del molino.",
          "Es la «Muela»."
        ]
      },
      {
        id: "r_molino_moulin_2",
        poiId: "moulin_rouillac",
        storyId: "molino_perdido",
        name: "El Caudal Secreto",
        difficulty: "explorador",
        points: 150,
        question: "Maître Pierre anotó: «Por cada metro cúbico por segundo, la rueda gira 12 veces por minuto». Si hoy el río lleva 3 m³/s, ¿a cuántas revoluciones por minuto gira la rueda?",
        type: "open_text",
        answer: "36",
        acceptedAnswers: ["36", "36 rpm", "36rpm", "treinta y seis"],
        hints: [
          "Multiplica el caudal en m³/s por las revoluciones por unidad.",
          "3 multiplicado por 12.",
          "El resultado es 36."
        ],
        staticHints: [
          "Multiplica el caudal en m³/s por las revoluciones por unidad.",
          "3 multiplicado por 12.",
          "El resultado es 36."
        ]
      },
      {
        id: "r_molino_ruisseau_1",
        poiId: "ruisseau_moulin",
        storyId: "molino_perdido",
        name: "El Canal de Derivación",
        difficulty: "novato",
        points: 100,
        question: "¿Cómo se llama la compuerta de madera que regula el paso de agua hacia el molino?",
        type: "multiple_choice",
        options: ["Esclusa o compuerta", "Dique seco", "Pozo de tormentas"],
        answer: "Esclusa o compuerta",
        hints: [
          "Se levanta o baja verticalmente mediante una cremallera o manivela.",
          "Permite aislar el molino cuando hay crecidas.",
          "Esclusa o compuerta."
        ],
        staticHints: [
          "Se levanta o baja verticalmente mediante una cremallera o manivela.",
          "Permite aislar el molino cuando hay crecidas.",
          "Esclusa o compuerta."
        ]
      },
      {
        id: "r_molino_chene_1",
        poiId: "chene_soupirs",
        storyId: "molino_perdido",
        name: "La Madera del Eje",
        difficulty: "novato",
        points: 100,
        question: "¿Qué propiedad del roble lo hacía el árbol favorito para fabricar los dientes y engranajes del molino?",
        type: "multiple_choice",
        options: ["Dureza y resistencia al agua", "Ligereza extrema como el corcho", "Flexibilidad para doblarse en espiral"],
        answer: "Dureza y resistencia al agua",
        hints: [
          "Los engranajes deben soportar toneladas de fricción.",
          "No debe pudrirse fácilmente en humedad constante.",
          "Dureza y resistencia al agua."
        ],
        staticHints: [
          "Los engranajes deben soportar toneladas de fricción.",
          "No debe pudrirse fácilmente en humedad constante.",
          "Dureza y resistencia al agua."
        ]
      },
      {
        id: "r_molino_belvedere_1",
        poiId: "belvedere_canejan",
        storyId: "molino_perdido",
        name: "El Nivel de Caída",
        difficulty: "novato",
        points: 100,
        question: "Para que un molino funcione con fuerza, ¿qué necesita tener el agua entre el inicio y el final de la acequia?",
        type: "multiple_choice",
        options: ["Un desnivel o pendiente", "Aguas termales calientes", "Arena blanca"],
        answer: "Un desnivel o pendiente",
        hints: [
          "La gravedad es la fuente de energía del agua.",
          "Sin altura que caer, el agua se estanca.",
          "Un desnivel o pendiente."
        ],
        staticHints: [
          "La gravedad es la fuente de energía del agua.",
          "Sin altura que caer, el agua se estanca.",
          "Un desnivel o pendiente."
        ]
      },

      // El Hechizo del Moulin Encantado
      {
        id: "r_hechizo_moulin_1",
        poiId: "moulin_rouillac",
        storyId: "hechizo_encantado",
        name: "La Voz del Agua",
        difficulty: "novato",
        points: 100,
        question: "Sylvaine te susurra: «No soy piedra ni soy viento, muevo maderas sin mover un brazo y canto canciones sin tener boca». ¿Qué elemento soy?",
        type: "multiple_choice",
        options: ["El agua del río", "El rayo del sol", "La sombra de la tarde"],
        answer: "El agua del río",
        hints: [
          "Fluye eternamente hacia el océano.",
          "Llena los cauces del bosque.",
          "Es el agua del río."
        ],
        staticHints: [
          "Fluye eternamente hacia el océano.",
          "Llena los cauces del bosque.",
          "Es el agua del río."
        ]
      },
      {
        id: "r_hechizo_ruisseau_1",
        poiId: "ruisseau_moulin",
        storyId: "hechizo_encantado",
        name: "Las Lágrimas de Sylvaine",
        difficulty: "novato",
        points: 100,
        question: "¿Qué pequeñas plantas milenarias sin flores cubren las piedras a la orilla del arroyo como una alfombra verde brillante?",
        type: "multiple_choice",
        options: ["Musgo y helechos", "Cáctus y espinas", "Rosas silvestres"],
        answer: "Musgo y helechos",
        hints: [
          "Crecen en la penumbra húmeda.",
          "Tienen un tacto suave y esponjoso.",
          "Son el musgo y los helechos."
        ],
        staticHints: [
          "Crecen en la penumbra húmeda.",
          "Tienen un tacto suave y esponjoso.",
          "Son el musgo y los helechos."
        ]
      },
      {
        id: "r_hechizo_chene_1",
        poiId: "chene_soupirs",
        storyId: "hechizo_encantado",
        name: "El Abrazo de la Dríade",
        difficulty: "novato",
        points: 100,
        question: "¿Cuántas vidas humanas dicen las leyendas que puede llegar a vivir un roble milenario sano en este bosque?",
        type: "multiple_choice",
        options: ["Más de 10 vidas (800-1000 años)", "Apenas 1 vida (30 años)", "Solo 5 años"],
        answer: "Más de 10 vidas (800-1000 años)",
        hints: [
          "Un roble tarda siglos en crecer, madurar y declinar.",
          "Es uno de los árboles más longevos de Europa.",
          "Más de 10 vidas (800-1000 años)."
        ],
        staticHints: [
          "Un roble tarda siglos en crecer, madurar y declinar.",
          "Es uno de los árboles más longevos de Europa.",
          "Más de 10 vidas (800-1000 años)."
        ]
      },
      {
        id: "r_hechizo_pont_1",
        poiId: "pont_sorciere",
        storyId: "hechizo_encantado",
        name: "El Puente de las Brumas",
        difficulty: "novato",
        points: 100,
        question: "Para cruzar el puente sin alertar a los espíritus de la niebla, ¿qué tributo vegetal exige la leyenda arrojar al agua?",
        type: "multiple_choice",
        options: ["Una hoja seca de roble", "Una moneda de oro", "Un pedazo de pan"],
        answer: "Una hoja seca de roble",
        hints: [
          "Es un elemento natural del suelo del bosque.",
          "Procede del árbol sagrado de la arboleda.",
          "Una hoja seca de roble."
        ],
        staticHints: [
          "Es un elemento natural del suelo del bosque.",
          "Procede del árbol sagrado de la arboleda.",
          "Una hoja seca de roble."
        ]
      },
      {
        id: "r_hechizo_belvedere_1",
        poiId: "belvedere_canejan",
        storyId: "hechizo_encantado",
        name: "El Despertar del Bosque",
        difficulty: "novato",
        points: 100,
        question: "Al llegar a lo más alto del mirador, Sylvaine te pide pronunciar la palabra que une a todos los seres vivos del bosque: «A _ _ _ N _ A». ¿Qué palabra es?",
        type: "open_text",
        answer: "ARMONIA",
        acceptedAnswers: ["ARMONIA", "armonía", "armonia"],
        hints: [
          "Significa concordia, equilibrio y belleza en conjunto.",
          "Empieza por AR y termina por IA.",
          "La palabra es ARMONIA."
        ],
        staticHints: [
          "Significa concordia, equilibrio y belleza en conjunto.",
          "Empieza por AR y termina por IA.",
          "La palabra es ARMONIA."
        ],
        _fix: "Puntos originales: 150. Normalizado a 100 por ser dificultad Novato."
      },

      // La Promenade Enchantée
      {
        id: "r_promenade_ruisseau_1",
        poiId: "ruisseau_moulin",
        storyId: "promenade_enchantee",
        name: "La Rima del Renacuajo",
        difficulty: "novato",
        points: 100,
        question: "Cuento de los niños: «Tengo cola pero no soy pez, cuando crezca daré brincos sin parar». ¿Quién soy?",
        type: "multiple_choice",
        options: ["Renacuajo o ranita", "Libélula veloz", "Caracol de agua"],
        answer: "Renacuajo o ranita",
        hints: [
          "Vive en los remansos del arroyo.",
          "Perderá su colita y le saldrán cuatro patas para croar.",
          "Renacuajo o ranita."
        ],
        staticHints: [
          "Vive en los remansos del arroyo.",
          "Perderá su colita y le saldrán cuatro patas para croar.",
          "Renacuajo o ranita."
        ]
      },
      {
        id: "r_promenade_chene_1",
        poiId: "chene_soupirs",
        storyId: "promenade_enchantee",
        name: "El Sombrero del Duende",
        difficulty: "novato",
        points: 100,
        question: "Los niños imaginaron que las bellotas caídas eran gorritos de duendes. Si cuentas los duendecillos de un nido y ves 4 gorritos y 3 ramitas, ¿cuántos duendecillos tienen sombrero?",
        type: "open_text",
        answer: "4",
        acceptedAnswers: ["4", "cuatro", "4 duendes"],
        hints: [
          "Cada duendecillo con sombrero usa un gorrito de bellota.",
          "Había 4 gorritos en total.",
          "La respuesta es 4."
        ],
        staticHints: [
          "Cada duendecillo con sombrero usa un gorrito de bellota.",
          "Había 4 gorritos en total.",
          "La respuesta es 4."
        ]
      },
      {
        id: "r_promenade_pont_1",
        poiId: "pont_sorciere",
        storyId: "promenade_enchantee",
        name: "La Escultura Mágica",
        difficulty: "novato",
        points: 100,
        question: "En el proyecto Divercités 'FOR[Ê]VEUR', el escultor talló figuras de madera para acompañar los cuentos. ¿De qué material noble están hechas estas obras?",
        type: "multiple_choice",
        options: ["Madera recuperada del propio bosque", "Plástico reciclado de colores", "Acero inoxidable pulido"],
        answer: "Madera recuperada del propio bosque",
        hints: [
          "Respeta la naturaleza viva sin talar árboles sanos.",
          "Es un material cálido que envejece con el musgo.",
          "Madera recuperada del propio bosque."
        ],
        staticHints: [
          "Respeta la naturaleza viva sin talar árboles sanos.",
          "Es un material cálido que envejece con el musgo.",
          "Madera recuperada del propio bosque."
        ]
      },
      {
        id: "r_promenade_moulin_1",
        poiId: "moulin_rouillac",
        storyId: "promenade_enchantee",
        name: "El Pastel del Molinero Duende",
        difficulty: "novato",
        points: 100,
        question: "Para cerrar el cuento de la clase, el duendecillo prepara una tarta con harina recién molida. ¿Cuál es el ingrediente que cae de los árboles que le da el toque dulce?",
        type: "multiple_choice",
        options: ["Miel de abejas del bosque", "Pimienta picante", "Sal marina"],
        answer: "Miel de abejas del bosque",
        hints: [
          "La producen insectos laboriosos que polinizan las flores silvestres.",
          "Es dorada y muy dulce.",
          "Miel de abejas del bosque."
        ],
        staticHints: [
          "La producen insectos laboriosos que polinizan las flores silvestres.",
          "Es dorada y muy dulce.",
          "Miel de abejas del bosque."
        ]
      }
    ],
    routePresets: {
      "30min": ["moulin_rouillac", "ruisseau_moulin"],
      "1h": ["moulin_rouillac", "ruisseau_moulin", "chene_soupirs"],
      "1.5h": ["moulin_rouillac", "ruisseau_moulin", "chene_soupirs", "belvedere_canejan"],
      "2h": ["moulin_rouillac", "ruisseau_moulin", "chene_soupirs", "belvedere_canejan"],
      "guerra": {
        "30min": ["moulin_rouillac", "ruisseau_moulin"],
        "1h": ["moulin_rouillac", "ruisseau_moulin", "chene_soupirs"],
        "1.5h": ["moulin_rouillac", "ruisseau_moulin", "chene_soupirs", "belvedere_canejan"],
        "2h": ["moulin_rouillac", "ruisseau_moulin", "chene_soupirs", "belvedere_canejan"]
      },
      "molino_perdido": {
        "30min": ["moulin_rouillac", "ruisseau_moulin"],
        "1h": ["moulin_rouillac", "ruisseau_moulin", "chene_soupirs"],
        "1.5h": ["moulin_rouillac", "ruisseau_moulin", "chene_soupirs", "belvedere_canejan"],
        "2h": ["moulin_rouillac", "ruisseau_moulin", "chene_soupirs", "belvedere_canejan"]
      },
      "hechizo_encantado": {
        "30min": ["moulin_rouillac", "ruisseau_moulin"],
        "1h": ["moulin_rouillac", "ruisseau_moulin", "chene_soupirs"],
        "1.5h": ["moulin_rouillac", "ruisseau_moulin", "chene_soupirs", "pont_sorciere"],
        "2h": ["moulin_rouillac", "ruisseau_moulin", "chene_soupirs", "pont_sorciere", "belvedere_canejan"]
      },
      "promenade_enchantee": {
        "30min": ["ruisseau_moulin", "chene_soupirs"],
        "1h": ["ruisseau_moulin", "chene_soupirs", "pont_sorciere"],
        "1.5h": ["ruisseau_moulin", "chene_soupirs", "pont_sorciere", "moulin_rouillac"],
        "2h": ["ruisseau_moulin", "chene_soupirs", "pont_sorciere", "moulin_rouillac"]
      }
    },
    sceneNarratives: {
      "guerra_moulin_rouillac": "El crujido del viejo molino de Rouillac resuena bajo el dosel. Aquí se ocultaba la caja estanca de la resistencia entre las vigas húmedas del sótano de muelas.",
      "guerra_ruisseau_moulin": "El agua helada amortigua los pasos. El enlace te espera al otro lado del arroyo con un salvoconducto cosido en el forro de su chaqueta.",
      "guerra_chene_soupirs": "Bajo la inmensa copa del Chêne des Soupirs, los maquis acordaban los horarios de paso de los mensajes codificados sin levantar sospechas.",
      "guerra_pont_sorciere": "El paso estrecho del Pont de la Sorcière era el punto de observación más peligroso: aquí una patrulla podía cortar la retirada en cuestión de segundos.",
      "guerra_cabane_forestier": "En la cabaña de resineros abandonada aún quedan restos de una radio de campaña y planos de las vías férreas de Cestas.",
      "guerra_belvedere_canejan": "Desde la cima del Belvédère, el vigía domina todo el valle arbolado. La señal luminosa final indicará si el convoy ha logrado ponerse a salvo.",

      "molino_perdido_moulin_rouillac": "Las compuertas del Moulin de Rouillac guardan el ingenio de Maître Pierre. El sonido sordo del agua al caer es la clave de su mecanismo.",
      "molino_perdido_ruisseau_moulin": "Siguiendo el curso del agua, descubres los antiguos muretes de contención que desviaban el torrente en épocas de estiaje.",
      "molino_perdido_chene_soupirs": "El roble gigante sirvió de referencia geográfica en el mapa dibujado en pergamino por el agrimensor del siglo XIX.",
      "molino_perdido_pont_sorciere": "La arquitectura del arco de piedra revela técnicas de cantería tradicional utilizadas para soportar las crecidas de primavera.",
      "molino_perdido_cabane_forestier": "Dentro del refugio forestal, una caja de herramientas de hierro forjado conserva la llave inglesa del eje principal.",
      "molino_perdido_belvedere_canejan": "Alcanzas el punto geodésico más alto. Desde aquí, el trazado original de las acequias del molino se dibuja con total claridad.",

      "hechizo_encantado_moulin_rouillac": "Una suave neblina irisada baila sobre la rueda dormida del molino. Sylvaine emerge en un murmullo de gotas de agua.",
      "hechizo_encantado_ruisseau_moulin": "Los helechos parecen inclinarse a tu paso. El agua del arroyo canta una melodía olvidada que cura los corazones fatigados.",
      "hechizo_encantado_chene_soupirs": "El viejo roble respira con el viento. Si apoyas la palma de tu mano en su corteza, sentirás el latido cálido de la madre madera.",
      "hechizo_encantado_pont_sorciere": "Bajo las piedras del puente centenario, pequeñas chispas de luz fosforescente guían a los caminantes nocturnos.",
      "hechizo_encantado_cabane_forestier": "El techo de corteza alberga nidos de pájaros cantarines que guardan las semillas mágicas de la dríade.",
      "hechizo_encantado_belvedere_canejan": "El viento en la cima arrastra un polvillo dorado. El sortilegio comienza a disiparse y el bosque recupera su resplandor.",

      "promenade_enchantee_moulin_rouillac": "¡Bienvenido al molino de los cuentos! Los niños de Canéjan inventaron aquí al duendecillo que hornea galletas de avena con polvillo de estrellas.",
      "promenade_enchantee_ruisseau_moulin": "En este recodo del agua, la clase imaginó barquitos de corteza que transportaban mensajes secretos entre animales amigos.",
      "promenade_enchantee_chene_soupirs": "Las ramas del roble son columpios gigantes donde ardillas y duendes celebran tertulias al atardecer.",
      "promenade_enchantee_pont_sorciere": "Las esculturas de madera de Divercités cobran vida cuando los niños las miran con ojos de explorador curioso.",
      "promenade_enchantee_cabane_forestier": "Una cabaña hecha para soñar despierto: aquí guardaban los lápices de colores y las historias que no cabían en los cuadernos.",
      "promenade_enchantee_belvedere_canejan": "¡La meta de la Promenade! El horizonte se llena de aplausos invisibles y una brisa juguetona que despeina a los exploradores."
    }
  },

  // Second pack: "El Pinar de los Tres Caminos (Bosque de Casa)"
  {
    id: "pinar-tres-caminos",
    name: "El Pinar de los Tres Caminos (Bosque de Casa)",
    country: "España — PLACEHOLDER, sustituir por la ubicación real",
    description: "Plantilla lista para jugar y personalizar a tu gusto: un bosque mediterráneo de pinos, con pozo centenario, sendero botánico y mirador al atardecer.",
    centerLat: 40.4168,
    centerLng: -3.7038,
    coverImageUrl: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80",
    attribution: "Plantilla para el bosque local. Coordenadas de ejemplo (Puerta del Sol / Madrid). Puedes sustituirlas desde el Panel de Administración por las de tu bosque real.",
    credits: "Plantilla para el bosque local. Coordenadas de ejemplo (Puerta del Sol / Madrid). Puedes sustituirlas desde el Panel de Administración por las de tu bosque real.",
    _todoCoordenadas: "Estas coordenadas son el centro de Madrid (Puerta del Sol), no un bosque real. Sustituir centerLat/centerLng y las lat/lng de cada POI por las de tu bosque real antes de publicar.",
    isPublished: true,
    pois: [
      {
        id: "fuente_piedra",
        name: "La Fuente de Piedra",
        description: "Manantial de roca caliza y abrevadero donde antaño abrevaban los pastores y los caminantes llenaban sus cantimploras.",
        lat: 40.4172,
        lng: -3.7031,
        emoji: "⛲",
        clueSnippet: "El agua fresca brota de una hendidura en la roca coronada de musgo.",
        arAsset: {
          preset: "cantaro_piedra",
          label: "Cántaro de piedra rebosante 3D (propuesta, a validar)",
          title: "Cántaro de Piedra Rebosante",
          scale: 1.2,
          heightOffsetMeters: 0.8,
          revealTrigger: "onArrival",
          description: "Un cántaro tradicional de barro y piedra caliza del que emana agua cristalina."
        }
      },
      {
        id: "arbol_vigia",
        name: "El Gran Árbol Vigía",
        description: "Árbol centenario de raíces expuestas que abrazan el terreno y dan sombra a toda la curva del sendero.",
        lat: 40.4180,
        lng: -3.7045,
        emoji: "🌳",
        clueSnippet: "Fíjate en las cavidades del tronco donde suelen anidar los pájaros carpinteros.",
        arAsset: {
          preset: "corzo_dorado",
          label: "Corzo dorado entre raíces 3D (propuesta, a validar)",
          title: "Corzo Dorado Guardián",
          scale: 1.4,
          heightOffsetMeters: 1.2,
          revealTrigger: "onArrival",
          description: "Figura mística de un corzo con pelaje áureo descansando entre las raíces milenarias."
        }
      },
      {
        id: "cruce_vientos",
        name: "Cruce de los Cuatro Vientos",
        description: "Hito de piedra en la confluencia de cañadas, sendas de pastoreo y bajada al barranco.",
        lat: 40.4162,
        lng: -3.7050,
        emoji: "🧭",
        clueSnippet: "Un hito de piedra antiguo marca las direcciones de los términos colindantes.",
        arAsset: {
          preset: "brujula_flotante",
          label: "Brújula flotante de bronce 3D (propuesta, a validar)",
          title: "Brújula Flotante de Bronce",
          scale: 1.3,
          heightOffsetMeters: 1.0,
          revealTrigger: "onRiddleSolved",
          description: "Brújula de agrimensor que gira suspendida orientando los cuatro puntos cardinales."
        }
      },
      {
        id: "mirador_puestas_sol",
        name: "Mirador de las Puestas de Sol",
        description: "Balcón natural sobre la ladera rocosa desde el que se divisa todo el valle y las copas de los pinares.",
        lat: 40.4155,
        lng: -3.7028,
        emoji: "🌅",
        clueSnippet: "Un banco rústico de madera invita a contemplar el horizonte dorado.",
        arAsset: {
          preset: "halcon_bronce",
          label: "Halcón de bronce planeando 3D (propuesta, a validar)",
          title: "Halcón de Bronce Planeando",
          scale: 1.3,
          heightOffsetMeters: 1.5,
          revealTrigger: "onRiddleSolved",
          description: "Escultura suspendida de un halcón con alas extendidas aprovechando las corrientes térmicas."
        }
      }
    ],
    stories: [
      {
        id: "leyenda_guardabosques",
        title: "La Leyenda del Guardabosques Olvidado",
        icon: "🌲",
        summary: "Durante cuarenta años, Anselmo patrulló estas veredas protegiendo corzos y manantiales. Antes de jubilarse, enterró un cuaderno de campo con notas botánicas y enigmas.",
        narrative: "Durante cuarenta años, Anselmo cuidó cada senda, censó los nidos de águila y plantó los brotes jóvenes. Antes de partir, dejó una prueba de agudeza para quien sepa escuchar a la naturaleza.",
        mission: "Completar el recorrido de los 4 hitos, resolver las pruebas botánicas y de orientación y obtener el título de Guardián Honorario del Bosque.",
        narrator: {
          name: "Guardabosques Anselmo",
          role: "Espíritu guardián del monte",
          avatarEmoji: "🧔",
          tone: "Campechano, sabio, amante de las aves y las plantas",
          ttsVoice: "Zephyr"
        },
        narratorName: "Guardabosques Anselmo",
        narratorRole: "Espíritu guardián del monte",
        narratorTone: "Campechano, sabio, amante de las aves y las plantas",
        narratorAvatar: "🧔",
        voiceName: "Zephyr",
        characterBio: "Guarda veterano que patrulló estas sendas durante décadas. Amigo de los corzos, experto en botánica mediterránea y defensor de las fuentes de piedra.",
        characterGreeting: "¡Qué pasa, caminante! Huele a resina y jara fresca hoy en el monte. Si necesitas una mano con las sendas o con las pistas de mi viejo cuaderno, dime sin reparo."
      }
    ],
    riddles: [
      {
        id: "r_guardabosques_fuente_1",
        poiId: "fuente_piedra",
        storyId: "leyenda_guardabosques",
        name: "El Caño Cristalino",
        difficulty: "novato",
        points: 100,
        question: "¿Qué planta aromática de flores moradas o azuladas suele crecer silvestre junto a las rocas secas cerca de la fuente?",
        type: "multiple_choice",
        options: ["Romero o tomillo", "Lechuga iceberg", "Platanero tropical"],
        answer: "Romero o tomillo",
        hints: [
          "Si frotas sus hojas entre tus dedos desprenden un olor característico del monte.",
          "Es una planta típica del bosque mediterráneo resistente a la sequía.",
          "Romero o tomillo."
        ],
        staticHints: [
          "Si frotas sus hojas entre tus dedos desprenden un olor característico del monte.",
          "Es una planta típica del bosque mediterráneo resistente a la sequía.",
          "Romero o tomillo."
        ]
      },
      {
        id: "r_guardabosques_fuente_2",
        poiId: "fuente_piedra",
        storyId: "leyenda_guardabosques",
        name: "El Reloj de Arena del Manantial",
        difficulty: "explorador",
        points: 150,
        question: "Anselmo anotó en su cuaderno: «El manantial llena el abrevadero en 4 vueltas de arena, y cada vuelta dura 15 minutos». ¿Cuántos minutos tarda en llenarse el abrevadero completo?",
        type: "open_text",
        answer: "60",
        acceptedAnswers: ["60", "60 minutos", "sesenta", "1 hora", "una hora"],
        hints: [
          "Multiplica el número de vueltas por la duración de cada una.",
          "Son 4 vueltas de 15 minutos cada una.",
          "4 por 15 son 60 minutos."
        ],
        staticHints: [
          "Multiplica el número de vueltas por la duración de cada una.",
          "Son 4 vueltas de 15 minutos cada una.",
          "4 por 15 son 60 minutos."
        ]
      },
      {
        id: "r_guardabosques_fuente_3",
        poiId: "fuente_piedra",
        storyId: "leyenda_guardabosques",
        name: "La Piedra Cifrada",
        difficulty: "maestro",
        points: 250,
        question: "En su cuaderno, Anselmo cifró el nombre de la roca que forma esta fuente reordenando sus letras: «ZACILA». ¿Qué palabra esconde?",
        type: "open_text",
        answer: "CALIZA",
        acceptedAnswers: ["CALIZA", "caliza"],
        hints: [
          "Es el mismo tipo de roca que da nombre al agua «dura».",
          "Tiene las mismas seis letras que ZACILA, solo reordenadas.",
          "La palabra es CALIZA."
        ],
        staticHints: [
          "Es el mismo tipo de roca que da nombre al agua «dura».",
          "Tiene las mismas seis letras que ZACILA, solo reordenadas.",
          "La palabra es CALIZA."
        ]
      },

      {
        id: "r_guardabosques_arbol_1",
        poiId: "arbol_vigia",
        storyId: "leyenda_guardabosques",
        name: "Los Anillos del Tiempo",
        difficulty: "novato",
        points: 100,
        question: "¿Cómo sabemos la edad exacta de un árbol cortado sin necesidad de máquinas modernas?",
        type: "multiple_choice",
        options: ["Contando los anillos de crecimiento del tronco", "Pesando las hojas caídas", "Midiendo el grosor de la corteza en invierno"],
        answer: "Contando los anillos de crecimiento del tronco",
        hints: [
          "Cada primavera y otoño el árbol añade una capa circular a su madera.",
          "Se ven en el corte transversal como círculos concéntricos.",
          "Contando los anillos de crecimiento del tronco."
        ],
        staticHints: [
          "Cada primavera y otoño el árbol añade una capa circular a su madera.",
          "Se ven en el corte transversal como círculos concéntricos.",
          "Contando los anillos de crecimiento del tronco."
        ]
      },
      {
        id: "r_guardabosques_arbol_2",
        poiId: "arbol_vigia",
        storyId: "leyenda_guardabosques",
        name: "La Edad del Vigía",
        difficulty: "explorador",
        points: 150,
        question: "Anselmo midió el tronco: 120 cm de diámetro. Si cada año el árbol añade de media 0,6 cm de radio, ¿cuántos años tiene aproximadamente el Gran Árbol Vigía?",
        type: "open_text",
        answer: "100",
        acceptedAnswers: ["100", "100 años", "cien"],
        hints: [
          "El radio es la mitad del diámetro: empieza por ahí.",
          "120 cm de diámetro son 60 cm de radio.",
          "60 dividido entre 0,6 son 100 años."
        ],
        staticHints: [
          "El radio es la mitad del diámetro: empieza por ahí.",
          "120 cm de diámetro son 60 cm de radio.",
          "60 dividido entre 0,6 son 100 años."
        ]
      },
      {
        id: "r_guardabosques_arbol_3",
        poiId: "arbol_vigia",
        storyId: "leyenda_guardabosques",
        name: "El Primo Sediento del Roble",
        difficulty: "maestro",
        points: 250,
        question: "En su cuaderno, Anselmo dibujó una raíz y escribió: «Busco agua profunda bajo la piedra caliza, soy primo del roble pero aguanto mejor la sequía». ¿Qué árbol mediterráneo soy?",
        type: "open_text",
        answer: "Encina",
        acceptedAnswers: ["Encina", "la encina", "carrasca"],
        hints: [
          "Pertenece a la misma familia que los robles, los Quercus.",
          "Su fruto también es la bellota, pero su hoja es pequeña y perenne, casi como espinas.",
          "Es la encina (o carrasca)."
        ],
        staticHints: [
          "Pertenece a la misma familia que los robles, los Quercus.",
          "Su fruto también es la bellota, pero su hoja es pequeña y perenne, casi como espinas.",
          "Es la encina (o carrasca)."
        ]
      },

      {
        id: "r_guardabosques_cruce_1",
        poiId: "cruce_vientos",
        storyId: "leyenda_guardabosques",
        name: "La Rosa de los Vientos",
        difficulty: "novato",
        points: 100,
        question: "Si te colocas al amanecer mirando hacia donde sale el Sol (el Este), ¿hacia qué mano quedará el Norte?",
        type: "multiple_choice",
        options: ["A tu mano izquierda", "A tu mano derecha", "A tu espalda"],
        answer: "A tu mano izquierda",
        hints: [
          "Extiende ambos brazos en cruz mirando hacia la salida del sol.",
          "Tu brazo derecho apuntará al Sur y tu espalda al Oeste.",
          "A tu mano izquierda."
        ],
        staticHints: [
          "Extiende ambos brazos en cruz mirando hacia la salida del sol.",
          "Tu brazo derecho apuntará al Sur y tu espalda al Oeste.",
          "A tu mano izquierda."
        ],
        _fix: "Puntos originales: 120. Normalizado a 100 por ser dificultad Novato."
      },
      {
        id: "r_guardabosques_cruce_2",
        poiId: "cruce_vientos",
        storyId: "leyenda_guardabosques",
        name: "La Sombra del Mediodía",
        difficulty: "explorador",
        points: 150,
        question: "A mediodía solar, en el hemisferio norte, ¿hacia qué punto cardinal apunta siempre la sombra de un poste clavado en el suelo?",
        type: "multiple_choice",
        options: ["Hacia el Norte", "Hacia el Sur", "Hacia el Este", "Hacia el Oeste"],
        answer: "Hacia el Norte",
        hints: [
          "El sol al mediodía está en su punto más alto, hacia el Sur, en nuestro hemisferio.",
          "La sombra siempre cae en el lado contrario al sol.",
          "Apunta hacia el Norte."
        ],
        staticHints: [
          "El sol al mediodía está en su punto más alto, hacia el Sur, en nuestro hemisferio.",
          "La sombra siempre cae en el lado contrario al sol.",
          "Apunta hacia el Norte."
        ]
      },
      {
        id: "r_guardabosques_cruce_3",
        poiId: "cruce_vientos",
        storyId: "leyenda_guardabosques",
        name: "El Rumbo de Vuelta",
        difficulty: "maestro",
        points: 250,
        question: "Sales del cruce caminando con rumbo 90° (Este) durante 10 minutos, y luego giras exactamente 180°. ¿Con qué rumbo regresas al cruce?",
        type: "open_text",
        answer: "270",
        acceptedAnswers: ["270", "270°", "270 grados", "oeste"],
        hints: [
          "Girar 180° significa dar media vuelta completa.",
          "Suma 180 al rumbo de ida: 90 + 180.",
          "El rumbo de vuelta es 270° (Oeste)."
        ],
        staticHints: [
          "Girar 180° significa dar media vuelta completa.",
          "Suma 180 al rumbo de ida: 90 + 180.",
          "El rumbo de vuelta es 270° (Oeste)."
        ]
      },

      {
        id: "r_guardabosques_mirador_1",
        poiId: "mirador_puestas_sol",
        storyId: "leyenda_guardabosques",
        name: "El Vuelo del Águila",
        difficulty: "novato",
        points: 100,
        question: "¿Qué ave rapaz con cola en cuña y alas anchas suele planear en círculos aprovechando las corrientes térmicas sobre el mirador?",
        type: "multiple_choice",
        options: ["Águila o busardo", "Pingüino emperador", "Colibrí florero"],
        answer: "Águila o busardo",
        hints: [
          "Tiene garras afiladas y vista prodigiosa.",
          "Vuela sin apenas aletear en días soleados.",
          "Águila o busardo."
        ],
        staticHints: [
          "Tiene garras afiladas y vista prodigiosa.",
          "Vuela sin apenas aletear en días soleados.",
          "Águila o busardo."
        ]
      },
      {
        id: "r_guardabosques_mirador_2",
        poiId: "mirador_puestas_sol",
        storyId: "leyenda_guardabosques",
        name: "El Sol de Verano",
        difficulty: "explorador",
        points: 150,
        question: "En el hemisferio norte, durante el solsticio de verano, ¿por dónde se pone el sol respecto al Oeste exacto?",
        type: "multiple_choice",
        options: ["Más hacia el Noroeste", "Más hacia el Suroeste", "Exactamente por el Oeste"],
        answer: "Más hacia el Noroeste",
        hints: [
          "En verano los días son más largos y el sol recorre un arco más amplio.",
          "Se pone desplazado hacia el mismo lado donde sale más pronto por la mañana.",
          "Se pone más hacia el Noroeste."
        ],
        staticHints: [
          "En verano los días son más largos y el sol recorre un arco más amplio.",
          "Se pone desplazado hacia el mismo lado donde sale más pronto por la mañana.",
          "Se pone más hacia el Noroeste."
        ]
      },
      {
        id: "r_guardabosques_mirador_3",
        poiId: "mirador_puestas_sol",
        storyId: "leyenda_guardabosques",
        name: "El Último Destello",
        difficulty: "maestro",
        points: 250,
        question: "El disco solar tarda unos 2 minutos en ocultarse completamente tras el horizonte desde que lo toca. Si hoy empezó a ocultarse a las 21:07, ¿a qué hora exacta desaparece del todo?",
        type: "open_text",
        answer: "21:09",
        acceptedAnswers: ["21:09", "21h09", "21:09h"],
        hints: [
          "Suma los 2 minutos que tarda en ocultarse del todo.",
          "21:07 más 2 minutos.",
          "Desaparece a las 21:09."
        ],
        staticHints: [
          "Suma los 2 minutos que tarda en ocultarse del todo.",
          "21:07 más 2 minutos.",
          "Desaparece a las 21:09."
        ]
      }
    ],
    routePresets: {
      "30min": ["fuente_piedra", "arbol_vigia"],
      "1h": ["fuente_piedra", "arbol_vigia", "cruce_vientos"],
      "1.5h": ["fuente_piedra", "arbol_vigia", "cruce_vientos", "mirador_puestas_sol"],
      "2h": ["fuente_piedra", "arbol_vigia", "cruce_vientos", "mirador_puestas_sol"],
      "leyenda_guardabosques": {
        "30min": ["fuente_piedra", "arbol_vigia"],
        "1h": ["fuente_piedra", "arbol_vigia", "cruce_vientos"],
        "1.5h": ["fuente_piedra", "arbol_vigia", "cruce_vientos", "mirador_puestas_sol"],
        "2h": ["fuente_piedra", "arbol_vigia", "cruce_vientos", "mirador_puestas_sol"]
      }
    },
    sceneNarratives: {
      "leyenda_guardabosques_fuente_piedra": "El murmullo de la fuente rompe el silencio del monte. El agua fresca mana limpia entre los helechos que crecen a la sombra de la roca.",
      "leyenda_guardabosques_arbol_vigia": "El gran árbol extiende su manto protector. Anselmo solía sentarse en su raíz más gruesa para anotar el nacimiento de los primeros corzos.",
      "leyenda_guardabosques_cruce_vientos": "Cuatro sendas se abren ante ti. El hito de piedra desgastado por la intemperie indica el camino que tomaban los antiguos leñadores.",
      "leyenda_guardabosques_mirador_puestas_sol": "El aire aquí arriba es puro y huele a jara y pino quemado por el sol. El horizonte te regala una vista inabarcable de todo el valle."
    }
  }
];
