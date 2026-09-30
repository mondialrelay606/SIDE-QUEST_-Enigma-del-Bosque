import fs from 'fs';
import path from 'path';

const userReplacements = {
  "f_t1_1_question": {
    "es": "A ver, chaval, aquí encerraron a un noble en 1299. ¿A quién? Pista: yo estaba borracho, pero me acuerdo de que era un poco plasta.",
    "fr": "Bon, mon gars, ici on a enfermé un noble en 1299. Qui ? Indice : j'étais soûl, mais je me rappelle qu'il était un peu casse-pieds.",
    "en": "Listen here, mate, they locked up a nobleman here in 1299. Who was it? Hint: I was drunk, but I remember he was a bit of a pain."
  },
  "f_t1_1_opt_a": {
    "es": "El Obispo de Calahorra, que vino a cobrar el diezmo",
    "fr": "L'Évêque de Calahorra, venu encaisser la dîme",
    "en": "The Bishop of Calahorra, who came to collect the tithe"
  },
  "f_t1_1_opt_b": {
    "es": "Juan Núñez de Lara, que se pasó de listo",
    "fr": "Juan Núñez de Lara, qui a trop joué au malin",
    "en": "Juan Núñez de Lara, who acted too clever"
  },
  "f_t1_1_opt_c": {
    "es": "El Abad de San Millán, que venía a por vino",
    "fr": "L'Abbé de San Millán, venu chercher du vin",
    "en": "The Abbot of San Millán, who came for wine"
  },
  "f_t1_1_opt_d": {
    "es": "El Duque de Nájera, que se perdió de caza",
    "fr": "Le Duc de Nájera, perdu à la chasse",
    "en": "The Duke of Nájera, who got lost hunting"
  },
  "f_t1_1_hint1": {
    "es": "El tío perdió una batalla entre Araciel y Alfaro. Malo, malo.",
    "fr": "Le mec a perdu une bataille entre Araciel et Alfaro. Nul, nul.",
    "en": "The guy lost a battle between Araciel and Alfaro. Rubbish, rubbish."
  },
  "f_t1_1_hint2": {
    "es": "Atacó tierras del obispado de Calahorra. Se metió con los curas, chaval.",
    "fr": "Il a attaqué les terres de l'évêché de Calahorra. Il s'est frotté aux curés, mon gars.",
    "en": "He attacked the Calahorra bishopric's lands. He messed with the priests, mate."
  },
  "f_t1_1_hint3": {
    "es": "Su apellido empieza por Núñez. Y no, no es Núñez de Balboa.",
    "fr": "Son nom commence par Núñez. Et non, c'est pas Núñez de Balboa.",
    "en": "His surname starts with Núñez. And no, it's not Núñez de Balboa."
  },
  "f_t1_2_question": {
    "es": "¿En qué siglo se alzaron las defensas principales de este castillo? Piénsalo bien, que yo ya estaba muerto cuando se construyeron.",
    "fr": "En quel siècle les défenses principales de ce château ont-elles été dressées ? Réfléchis bien, j'étais déjà mort quand elles ont été construites.",
    "en": "In which century were the main defences of this castle built? Think carefully, I was already dead when they were built."
  },
  "f_t1_2_ans1": {
    "es": "XIII",
    "fr": "XIII",
    "en": "XIII"
  },
  "f_t1_2_ans2": {
    "es": "Siglo XIII",
    "fr": "XIIIe siècle",
    "en": "13th century"
  },
  "f_t1_2_ans3": {
    "es": "13",
    "fr": "13",
    "en": "13"
  },
  "f_t1_2_hint1": {
    "es": "Antes de que yo me ahogara en el barril, en 1387. Así que un poquito antes.",
    "fr": "Avant ma noyade dans le tonneau, en 1387. Donc un peu avant.",
    "en": "Before I drowned in the barrel, in 1387. So a bit earlier."
  },
  "f_t1_2_hint2": {
    "es": "Diez más tres en números romanos. Y no, no es el siglo XX.",
    "fr": "Dix plus trois en chiffres romains. Et non, ce n'est pas le XXe siècle.",
    "en": "Ten plus three in Roman numerals. And no, it's not the 20th century."
  },
  "f_t1_2_hint3": {
    "es": "Siglo XIII. Como el castillo de los documentales, chaval.",
    "fr": "XIIIe siècle. Comme le château des documentaires, mon gars.",
    "en": "13th century. Like the castle in documentaries, mate."
  },
  "f_t1_3_question": {
    "es": "¿Qué linaje señorial tomó posesión del Castillo de Nalda en el siglo XIV? Eran los jefes de la zona, vamos.",
    "fr": "Quel lignage seigneurial a pris possession du château de Nalda au XIVe siècle ? Les chefs du coin, quoi.",
    "en": "Which noble lineage took possession of Nalda Castle in the 14th century? The local bosses, basically."
  },
  "f_t1_3_ans1": {
    "es": "Ramírez de Arellano",
    "fr": "Ramírez de Arellano",
    "en": "Ramírez de Arellano"
  },
  "f_t1_3_ans2": {
    "es": "Arellano",
    "fr": "Arellano",
    "en": "Arellano"
  },
  "f_t1_3_ans3": {
    "es": "Señorío de Cameros",
    "fr": "Seigneurie de Cameros",
    "en": "Lordship of Cameros"
  },
  "f_t1_3_hint1": {
    "es": "Famosa casa nobiliaria de la corona castellana y navarra. Gente importante, oye.",
    "fr": "Maison noble réputée des couronnes castillane et navarraise. Du beau monde, hein.",
    "en": "Famous noble house of the Castilian and Navarrese crowns. Important people, eh."
  },
  "f_t1_3_hint2": {
    "es": "Empieza por Ramírez de... y no, no es el de los relojes.",
    "fr": "Commence par Ramírez de... et non, c'est pas celui des montres.",
    "en": "Starts with Ramírez de... and no, it's not the watch guy."
  },
  "f_t1_3_hint3": {
    "es": "Ramírez de Arellano. Llegaron a mandar hasta Soria. Nada, unos humildes.",
    "fr": "Ramírez de Arellano. Ils ont même commandé jusqu'à Soria. Bref, des modestes.",
    "en": "Ramírez de Arellano. They even ruled as far as Soria. Yeah, real modest bunch."
  },
  "f_t2_1_question": {
    "es": "Al cruzar el Arco de la Villa, ¿qué función defensiva tenía este portal en el medievo? Pista: no era para hacer turismo.",
    "fr": "En franchissant l'Arche de la Villa, quelle fonction défensive avait ce portail au Moyen Âge ? Indice : ce n'était pas pour le tourisme.",
    "en": "When crossing the Village Arch, what defensive function did this gate serve in the Middle Ages? Hint: it wasn't for tourism."
  },
  "f_t2_1_opt_a": {
    "es": "Mazmorra de herejes, que aquí había mucha mano dura",
    "fr": "Cachot des hérétiques, on ne rigolait pas ici",
    "en": "Dungeon for heretics, they were tough around here"
  },
  "f_t2_1_opt_b": {
    "es": "Bodega comunal de diezmo, que aquí el vino es sagrado",
    "fr": "Cave communale de la dîme, ici le vin est sacré",
    "en": "Communal tithe cellar, wine is sacred here"
  },
  "f_t2_1_opt_c": {
    "es": "Puerta fortificada y control de acceso a la villa",
    "fr": "Porte fortifiée et contrôle d'accès au village",
    "en": "Fortified gate and town access checkpoint"
  },
  "f_t2_1_opt_d": {
    "es": "Campanario de aviso, que aquí todo se avisaba a toque de campana",
    "fr": "Clocher d'alarme, ici tout s'annonçait à coups de cloche",
    "en": "Warning belfry, everything here was announced by bell"
  },
  "f_t2_1_hint1": {
    "es": "Cerraba la villa amurallada por la noche. Como tu portal, pero con piedras.",
    "fr": "Elle fermait la cité fortifiée la nuit. Comme ton portail, mais en pierre.",
    "en": "It sealed the walled town at night. Like your front door, but in stone."
  },
  "f_t2_1_hint2": {
    "es": "Controlaba quién entraba con mercancías. Y con vino, que aquí el vino es sagrado.",
    "fr": "Il contrôlait qui entrait avec des marchandises. Et du vin, ici le vin est sacré.",
    "en": "It controlled who came in with goods. And with wine, wine is sacred here."
  },
  "f_t2_1_hint3": {
    "es": "Puerta fortificada de acceso. Ni mazmorra, ni campanario, ni bodega.",
    "fr": "Porte fortifiée d'accès. Ni cachot, ni clocher, ni cave.",
    "en": "Fortified access gate. Neither dungeon, nor belfry, nor cellar."
  },
  "f_t2_2_question": {
    "es": "¿Qué tipo de piedra arenisca característica de la cuenca del Iregua forma las dovelas del arco? Pista: la tenemos a patadas por aquí.",
    "fr": "Quel type de grès caractéristique du bassin de l'Iregua forme les voussoirs de l'arche ? Indice : on en a à la pelle par ici.",
    "en": "What typical sandstone from the Iregua basin forms the arch voussoirs? Hint: we have it in spades around here."
  },
  "f_t2_2_ans1": {
    "es": "Arenisca",
    "fr": "Grès",
    "en": "Sandstone"
  },
  "f_t2_2_ans2": {
    "es": "Piedra de sillería",
    "fr": "Pierre de taille",
    "en": "Ashlar"
  },
  "f_t2_2_ans3": {
    "es": "Arenisca rojiza",
    "fr": "Grès rougeâtre",
    "en": "Red sandstone"
  },
  "f_t2_2_hint1": {
    "es": "Roca sedimentaria de grano fino y tacto áspero. Como mi sotana, pero más dura.",
    "fr": "Roche sédimentaire à grain fin et toucher rugueux. Comme ma soutane, mais plus dure.",
    "en": "Fine-grained sedimentary rock with a rough feel. Like my cassock, but harder."
  },
  "f_t2_2_hint2": {
    "es": "Compuesta de granos de arena prensados durante millones de años. Paciencia, chaval.",
    "fr": "Composée de grains de sable pressés pendant des millions d'années. Patience, mon gars.",
    "en": "Made of sand grains pressed over millions of years. Patience, mate."
  },
  "f_t2_2_hint3": {
    "es": "Arenisca. Ni mármol, ni granito, ni ná de eso.",
    "fr": "Grès. Ni marbre, ni granit, ni rien de tout ça.",
    "en": "Sandstone. Not marble, not granite, nothing like that."
  },
  "f_t2_3_question": {
    "es": "¿Qué patrona religiosa coronaba tradicionalmente la hornacina superior de esta puerta? Pista: es la jefa de la ermita del valle.",
    "fr": "Quelle patronne religieuse couronnait traditionnellement la niche supérieure de cette porte ? Indice : c'est la patronne de l'ermitage de la vallée.",
    "en": "Which religious patron traditionally topped the upper niche of this gate? Hint: she's the boss of the valley hermitage."
  },
  "f_t2_3_ans1": {
    "es": "Virgen de Villavieja",
    "fr": "Vierge de Villavieja",
    "en": "Virgin of Villavieja"
  },
  "f_t2_3_ans2": {
    "es": "San Millán",
    "fr": "Saint Millán",
    "en": "Saint Millan"
  },
  "f_t2_3_ans3": {
    "es": "Nuestra Señora",
    "fr": "Notre-Dame",
    "en": "Our Lady"
  },
  "f_t2_3_hint1": {
    "es": "La patrona venerada en la ermita del valle. La que da nombre a la romería.",
    "fr": "La patronne vénérée à l'ermitage de la vallée. Celle qui donne son nom au pèlerinage.",
    "en": "The patroness venerated at the valley hermitage. The one who gives the pilgrimage its name."
  },
  "f_t2_3_hint2": {
    "es": "Villavieja. Ahí lo dejo, que si no te lo doy mascado.",
    "fr": "Villavieja. Je te laisse, sinon je te le mâche.",
    "en": "Villavieja. I'll leave it there, otherwise I'm chewing it for you."
  },
  "f_t2_3_hint3": {
    "es": "Virgen de Villavieja. Y ahora vamos a por un trago, que ya está bien.",
    "fr": "Vierge de Villavieja. Et maintenant on va boire un coup, ça suffit.",
    "en": "Virgin of Villavieja. And now let's go for a drink, that's enough."
  },
  "f_t3_1_question": {
    "es": "Desde el Mirador Puerta de Cameros se domina el valle. ¿Qué río vertebra todo este cauce? Pista: no es el Ebro, aunque el Ebro también mola.",
    "fr": "Depuis le belvédère Porte de Cameros, on domine la vallée. Quelle rivière structure tout ce cours d'eau ? Indice : ce n'est pas l'Èbre, même si l'Èbre est cool aussi.",
    "en": "From the Puerta de Cameros viewpoint you command the valley. Which river structures this entire basin? Hint: it's not the Ebro, though the Ebro is cool too."
  },
  "f_t3_1_opt_a": {
    "es": "Río Ebro, el jefe de la zona",
    "fr": "L'Èbre, le boss du coin",
    "en": "Ebro River, the local boss"
  },
  "f_t3_1_opt_b": {
    "es": "Río Iregua",
    "fr": "Rivière Iregua",
    "en": "Iregua River"
  },
  "f_t3_1_opt_c": {
    "es": "Río Najerilla, el vecino de al lado",
    "fr": "La Najerilla, le voisin d'à côté",
    "en": "Najerilla River, the neighbour next door"
  },
  "f_t3_1_opt_d": {
    "es": "Río Leza, el primo lejano",
    "fr": "La Leza, le cousin éloigné",
    "en": "Leza River, the distant cousin"
  },
  "f_t3_1_hint1": {
    "es": "Nace en la Sierra Cebollera y baja hacia Logroño. Como mi resaca, pero con más agua.",
    "fr": "Il naît dans la Sierra Cebollera et descend vers Logroño. Comme ma gueule de bois, mais avec plus d'eau.",
    "en": "It's born in the Sierra Cebollera and flows down to Logroño. Like my hangover, but with more water."
  },
  "f_t3_1_hint2": {
    "es": "Nombre de seis letras que empieza por I. Y no, no es 'Iglesia'.",
    "fr": "Nom de six lettres qui commence par I. Et non, c'est pas 'Église'.",
    "en": "Six-letter name starting with I. And no, it's not 'Inn'."
  },
  "f_t3_1_hint3": {
    "es": "Río Iregua. El que da nombre al valle, chaval.",
    "fr": "Rivière Iregua. Celle qui donne son nom à la vallée, mon gars.",
    "en": "Iregua River. The one that gives the valley its name, mate."
  },
  "f_t3_2_question": {
    "es": "¿Qué formación montañosa se divisa al fondo custodiando la entrada sur hacia las tierras altas? Pista: lleva el nombre de este mismo mirador.",
    "fr": "Quel massif montagneux aperçoit-on au fond, gardant l'accès sud vers les hauteurs ? Indice : il porte le nom de ce même belvédère.",
    "en": "What mountain range is seen in the distance guarding the southern pass to the highlands? Hint: it bears the name of this very viewpoint."
  },
  "f_t3_2_ans1": {
    "es": "Sierra de Cameros",
    "fr": "Sierra de Cameros",
    "en": "Sierra de Cameros"
  },
  "f_t3_2_ans2": {
    "es": "Cameros",
    "fr": "Cameros",
    "en": "Cameros"
  },
  "f_t3_2_ans3": {
    "es": "Sierra de Cebollera",
    "fr": "Sierra de Cebollera",
    "en": "Sierra Cebollera"
  },
  "f_t3_2_hint1": {
    "es": "La comarca que da nombre a este mismo mirador. Léelo otra vez, si hace falta.",
    "fr": "La comarque qui donne son nom à ce même belvédère. Relis-le, si besoin.",
    "en": "The region that gives this very viewpoint its name. Read it again, if needed."
  },
  "f_t3_2_hint2": {
    "es": "Cameros. Así, sin más.",
    "fr": "Cameros. Comme ça, sans plus.",
    "en": "Cameros. Just like that."
  },
  "f_t3_2_hint3": {
    "es": "Sierra de Cameros. ¿A que no era tan difícil, chaval?",
    "fr": "Sierra de Cameros. C'était pas si dur, mon gars.",
    "en": "Sierra de Cameros. Not that hard, was it, mate?"
  },
  "f_t3_3_question": {
    "es": "¿Qué actividad económica milenaria de trashumancia de ovejas merinas enriqueció a esta comarca? Pista: tiene que ver con lana y con pastores.",
    "fr": "Quelle activité économique millénaire de transhumance de moutons mérinos a enrichi cette région ? Indice : ça a à voir avec la laine et les bergers.",
    "en": "What ancient merino sheep transhumance economic activity enriched this region? Hint: it has to do with wool and shepherds."
  },
  "f_t3_3_ans1": {
    "es": "La Mesta",
    "fr": "La Mesta",
    "en": "La Mesta"
  },
  "f_t3_3_ans2": {
    "es": "Trashumancia",
    "fr": "Transhumance",
    "en": "Transhumance"
  },
  "f_t3_3_ans3": {
    "es": "Comercio de lana",
    "fr": "Commerce de laine",
    "en": "Wool trade"
  },
  "f_t3_3_hint1": {
    "es": "Real Concejo de pastores fundado por Alfonso X el Sabio. Sí, el de las cantigas.",
    "fr": "Conseil royal de bergers fondé par Alphonse X le Sage. Oui, celui des cantigas.",
    "en": "Royal council of shepherds founded by Alfonso X the Wise. Yes, the one from the cantigas."
  },
  "f_t3_3_hint2": {
    "es": "La Mesta. Cortito y al pie.",
    "fr": "La Mesta. Court et précis.",
    "en": "La Mesta. Short and sweet."
  },
  "f_t3_3_hint3": {
    "es": "La Mesta. O trashumancia, si lo prefieres más largo.",
    "fr": "La Mesta. Ou transhumance, si tu préfères plus long.",
    "en": "La Mesta. Or transhumance, if you prefer it longer."
  },
  "f_t4_1_question": {
    "es": "Las Cuevas de Los Palomares tienen decenas de hornacinas excavadas en la roca. ¿Cuál era su uso primitivo más documentado? Pista: no era un hotel.",
    "fr": "Les grottes de Los Palomares comptent des dizaines de niches creusées dans la roche. Quel était leur usage primitif le plus documenté ? Indice : ce n'était pas un hôtel.",
    "en": "The Los Palomares Caves have dozens of carved niches in the cliff. What was their most documented primitive use? Hint: it wasn't a hotel."
  },
  "f_t4_1_opt_a": {
    "es": "Monasterio rupestre / eremitorio medieval y cría de palomas",
    "fr": "Monastère rupestre / ermitage médiéval et élevage de colombes",
    "en": "Rock-cut monastery / medieval hermitage and dove breeding"
  },
  "f_t4_1_opt_b": {
    "es": "Depósito de pólvora castellana, que aquí hubo mucha guerra",
    "fr": "Dépôt de poudre castillan, il y a eu beaucoup de guerre ici",
    "en": "Castilian gunpowder magazine, there was a lot of war here"
  },
  "f_t4_1_opt_c": {
    "es": "Cárcel secreta de la Inquisición, que aquí nadie se libraba",
    "fr": "Prison secrète de l'Inquisition, personne n'y échappait",
    "en": "Inquisition secret prison, no one escaped here"
  },
  "f_t4_1_opt_d": {
    "es": "Bodega funeraria romana, que aquí los romanos también bebían",
    "fr": "Cave funéraire romaine, les Romains buvaient aussi ici",
    "en": "Roman funerary cellar, the Romans drank here too"
  },
  "f_t4_1_hint1": {
    "es": "Monjes solitarios rezaban aquí antes de que llegaran las palomas. Mucho rezo y poca juerga.",
    "fr": "Des moines solitaires priaient ici avant l'arrivée des colombes. Beaucoup de prière, peu de fête.",
    "en": "Hermit monks prayed here before the doves arrived. Lots of prayer, little partying."
  },
  "f_t4_1_hint2": {
    "es": "Conjunto rupestre eremítico. Palabras mayores, chaval.",
    "fr": "Ensemble rupestre érémitique. Des grands mots, mon gars.",
    "en": "Rock-hewn hermitic complex. Big words, mate."
  },
  "f_t4_1_hint3": {
    "es": "Eremitorio rupestre y palomar. Lo que viene siendo un monasterio de roca con palomas.",
    "fr": "Ermitage rupestre et colombier. Ce qu'on appelle un monastère de roche avec des colombes.",
    "en": "Rock hermitage and dovecote. What we call a rock monastery with doves."
  },
  "f_t4_2_question": {
    "es": "¿En qué tipo de roca blanda conglomerada se excavaron los huecos de Los Palomares? Pista: no es mármol, tranquilo.",
    "fr": "Dans quel type de roche tendre conglomérée les cavités de Los Palomares ont-elles été creusées ? Indice : ce n'est pas du marbre, t'inquiète.",
    "en": "In which type of soft conglomerate rock were the Los Palomares hollows carved? Hint: it's not marble, don't worry."
  },
  "f_t4_2_ans1": {
    "es": "Conglomerado",
    "fr": "Conglomérat",
    "en": "Conglomerate"
  },
  "f_t4_2_ans2": {
    "es": "Arenisca arcillosa",
    "fr": "Grès argileux",
    "en": "Clay sandstone"
  },
  "f_t4_2_ans3": {
    "es": "Yeso y conglomerado",
    "fr": "Gypse et conglomérat",
    "en": "Gypsum and conglomerate"
  },
  "f_t4_2_hint1": {
    "es": "Grava y cantos rodados cementados naturalmente. Como mi estómago tras una noche de vino.",
    "fr": "Graviers et galets cimentés naturellement. Comme mon estomac après une nuit de vin.",
    "en": "Gravel and pebbles naturally cemented. Like my stomach after a night of wine."
  },
  "f_t4_2_hint2": {
    "es": "Conglomerado geológico. Palabrita que te suelta el geólogo, chaval.",
    "fr": "Conglomérat géologique. Un p'tit mot que te sort le géologue, mon gars.",
    "en": "Geological conglomerate. A little word the geologist throws at you, mate."
  },
  "f_t4_2_hint3": {
    "es": "Conglomerado. Ni yeso, ni arenisca, ni ná. Conglomerado y punto.",
    "fr": "Conglomérat. Ni gypse, ni grès, ni rien. Conglomérat, point.",
    "en": "Conglomerate. Not gypsum, not sandstone, nothing. Conglomerate, period."
  },
  "f_t4_3_question": {
    "es": "¿Aproximadamente cuántos nichos individuales u hornacinas se conservan en esta pared vertical? Pista: son unos cuantos, no te cortes.",
    "fr": "Combien de niches individuelles environ sont conservées sur cette paroi verticale ? Indice : il y en a pas mal, ne te limite pas.",
    "en": "Approximately how many individual niches are preserved in this vertical wall? Hint: there are quite a few, don't hold back."
  },
  "f_t4_3_ans1": {
    "es": "Cientos",
    "fr": "Centaines",
    "en": "Hundreds"
  },
  "f_t4_3_ans2": {
    "es": "Más de cien",
    "fr": "Plus de cent",
    "en": "More than one hundred"
  },
  "f_t4_3_ans3": {
    "es": "300",
    "fr": "300",
    "en": "300"
  },
  "f_t4_3_hint1": {
    "es": "Son varios centenares repartidos en varios niveles. Un poco como las habitaciones de un hotel, pero sin servicio de habitaciones.",
    "fr": "Il y en a plusieurs centaines réparties sur plusieurs niveaux. Un peu comme les chambres d'un hôtel, mais sans room service.",
    "en": "Several hundreds spread over multiple levels. A bit like hotel rooms, but without room service."
  },
  "f_t4_3_hint2": {
    "es": "Alrededor de tres centenares. Ahí lo dejo.",
    "fr": "Autour de trois cents. Je te laisse.",
    "en": "Around three hundred. I'll leave it there."
  },
  "f_t4_3_hint3": {
    "es": "Cientos. Aproximadamente 300. Y ahora vamos a por un trago, chaval.",
    "fr": "Centaines. Environ 300. Et maintenant on va boire un coup, mon gars.",
    "en": "Hundreds. About 300. And now let's go for a drink, mate."
  },
  "f_t5_1_question": {
    "es": "En la Ermita de Villavieja, ¿qué estilo arquitectónico rural predomina en su construcción original? Pista: ni románico ni gótico, piensa en algo más tardío.",
    "fr": "À l'ermitage de Villavieja, quel style architectural rural domine dans sa construction originale ? Indice : ni roman ni gothique, pense à quelque chose de plus tardif.",
    "en": "At Villavieja Hermitage, what rural architectural style prevails in its original construction? Hint: neither Romanesque nor Gothic, think of something later."
  },
  "f_t5_1_ans1": {
    "es": "Barroco popular",
    "fr": "Baroque populaire",
    "en": "Folk baroque"
  },
  "f_t5_1_ans2": {
    "es": "Románico rural",
    "fr": "Roman rural",
    "en": "Rural Romanesque"
  },
  "f_t5_1_ans3": {
    "es": "Barroco",
    "fr": "Baroque",
    "en": "Baroque"
  },
  "f_t5_1_hint1": {
    "es": "Edificada entre los siglos XVII y XVIII con añadidos. Ya te estoy dando demasiado.",
    "fr": "Bâtie entre les XVIIe et XVIIIe siècles avec des ajouts. Je te donne déjà trop.",
    "en": "Built between the 17th and 18th centuries with additions. I'm already giving you too much."
  },
  "f_t5_1_hint2": {
    "es": "Estilo barroco sencillo y devocional. Como la iglesia de tu pueblo, pero con más vino.",
    "fr": "Style baroque simple et dévotionnel. Comme l'église de ton village, mais avec plus de vin.",
    "en": "Simple, devotional baroque style. Like your village church, but with more wine."
  },
  "f_t5_1_hint3": {
    "es": "Barroco popular. Y ya está, chaval.",
    "fr": "Baroque populaire. Et voilà, mon gars.",
    "en": "Folk baroque. And that's it, mate."
  },
  "f_t5_2_question": {
    "es": "¿Qué celebración popular reúne cada primavera a los vecinos de Nalda en esta ermita? Pista: se sube en procesión, con comida y vino.",
    "fr": "Quelle fête populaire réunit chaque printemps les habitants de Nalda à cet ermitage ? Indice : on monte en procession, avec nourriture et vin.",
    "en": "What traditional gathering brings Nalda locals together here every spring? Hint: you go up in procession, with food and wine."
  },
  "f_t5_2_ans1": {
    "es": "Romería de Villavieja",
    "fr": "Pèlerinage de Villavieja",
    "en": "Villavieja Pilgrimage"
  },
  "f_t5_2_ans2": {
    "es": "Romería",
    "fr": "Romería",
    "en": "Romeria"
  },
  "f_t5_2_hint1": {
    "es": "Peregrinación campestre con comida, jotas y vino. Vamos, lo que viene siendo una fiesta.",
    "fr": "Pèlerinage champêtre avec nourriture, jotas et vin. Bref, une vraie fête.",
    "en": "Country pilgrimage with food, jotas and wine. Basically a party."
  },
  "f_t5_2_hint2": {
    "es": "La Romería anual. Cortito y al pie.",
    "fr": "La Romería annuelle. Court et précis.",
    "en": "The annual Romería. Short and sweet."
  },
  "f_t5_2_hint3": {
    "es": "Romería de Villavieja. Y ahora vamos a por el trago final, que ya toca.",
    "fr": "Pèlerinage de Villavieja. Et maintenant on va boire le coup final, ça se fête.",
    "en": "Villavieja Pilgrimage. And now let's have the final drink, we've earned it."
  },
  "f_extra_brindis_title": {
    "es": "Brindis Tabernero en el Castillo",
    "fr": "Santé de Tavernier au Château",
    "en": "Tavern Toast at the Castle"
  },
  "f_extra_brindis_description": {
    "es": "Hazte una foto alzando una bota, vaso o cantimplora brindando con las ruinas del castillo al fondo. Si es vino, +10 puntos de respeto del fraile.",
    "fr": "Prends une photo en levant une gourde, un verre ou une outre devant les ruines du château. Si c'est du vin, +10 points de respect du moine.",
    "en": "Take a photo raising a flask, cup or canteen toasting with the castle ruins behind you. If it's wine, +10 friar respect points."
  },
  "f_extra_eructo_title": {
    "es": "Eructo Divino en el Arco",
    "fr": "Rot Divin sous l'Arche",
    "en": "Divine Burp under the Arch"
  },
  "f_extra_eructo_description": {
    "es": "Graba un sonoro suspiro, eructo o exclamación de taberna bajo la acústica de la bóveda del arco. Cuanto más gordo, mejor.",
    "fr": "Enregistre un soupir sonore, un rot ou une exclamation de taverne sous l'acoustique de la voûte. Plus c'est gras, mieux c'est.",
    "en": "Record a resounding tavern sigh, burp or cheer under the arch's acoustic vault. The louder, the better."
  },
  "f_extra_confesion_title": {
    "es": "Confesión Secreta en las Cuevas",
    "fr": "Confession Secrète aux Grottes",
    "en": "Secret Confession in the Caves"
  },
  "f_extra_confesion_description": {
    "es": "Susurra un secreto inconfesable (o un pecado gastronómico) en una de las hornacinas de Los Palomares. El fraile escucha, aunque esté borracho.",
    "fr": "Chuchote un secret inavouable (ou un péché gastronomique) dans l'une des niches de Los Palomares. Le moine écoute, même s'il est soûl.",
    "en": "Whisper an unconfessable secret (or a food sin) into one of the Los Palomares niches. The friar listens, even if he's drunk."
  },
  "f_extra_pecho_title": {
    "es": "A Pecho Descubierto en el Mirador",
    "fr": "Poitrine au Vent au Belvédère",
    "en": "Chest to the Wind at the Viewpoint"
  },
  "f_extra_pecho_description": {
    "es": "Sácate una foto abriendo los brazos al viento de Cameros como si fueras el rey del Iregua. El fraile te nombra escudero honorífico.",
    "fr": "Prends une photo en ouvrant les bras au vent de Cameros comme si tu étais le roi de l'Iregua. Le moine te nomme écuyer honoraire.",
    "en": "Take a photo opening your arms to the Cameros wind like the king of the Iregua. The friar names you honorary squire."
  },
  "f_extra_siesta_title": {
    "es": "La Siesta Eterna en Villavieja",
    "fr": "La Sieste Éternelle à Villavieja",
    "en": "The Eternal Nap at Villavieja"
  },
  "f_extra_siesta_description": {
    "es": "Graba un breve vídeo de 3 segundos fingiendo roncar plácidamente en el banco o prado de la ermita. La siesta es sagrada, como el vino.",
    "fr": "Enregistre une vidéo de 3 secondes simulant un ronflement paisible sur le banc ou la pelouse de l'ermitage. La sieste est sacrée, comme le vin.",
    "en": "Record a quick 3-second video pretending to snore peacefully on the hermitage bench or lawn. Naps are sacred, like wine."
  },
  "f_extra_baile_vino_title": {
    "es": "El Baile del Monje Achispado",
    "fr": "La Danse du Moine Éméché",
    "en": "The Tipsy Monk Dance"
  },
  "f_extra_baile_vino_description": {
    "es": "Imita los pasos torpes y alegres de Fray Botijo celebrando una buena cosecha de vino de Rioja. Cuanto más ridículo, mejor.",
    "fr": "Imite les pas maladroits et joyeux de Fray Botijo célébrant une bonne récolte de vin de Rioja. Plus c'est ridicule, mieux c'est.",
    "en": "Mimic the clumsy, merry steps of Friar Botijo celebrating a fine Rioja vintage. The more ridiculous, the better."
  },
  "f_meta_enigma_title": {
    "es": "El Códice del Barril de 1387",
    "fr": "Le Codex du Tonneau de 1387",
    "en": "The 1387 Barrel Codex"
  },
  "f_meta_enigma_description": {
    "es": "Reúne las 6 letras secretas (B-O-T-I-J-O) ocultas en las reliquias de Fray Botijo para destapar el barril de la salvación. Y sí, huele a vino.",
    "fr": "Réunis les 6 lettres secrètes (B-O-T-I-J-O) cachées dans les reliques de Fray Botijo pour ouvrir le tonneau du salut. Et oui, ça sent le vin.",
    "en": "Gather the 6 secret letters (B-O-T-I-J-O) hidden in Friar Botijo's relics to unlock the barrel of salvation. And yes, it smells of wine."
  }
};

// 1. Update i18n files
function updateI18n(filePath) {
  if (!fs.existsSync(filePath)) return;
  const i18n = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!i18n.ui) i18n.ui = { es: {}, fr: {}, en: {} };
  if (!i18n.keys) i18n.keys = {};

  for (const [key, val] of Object.entries(userReplacements)) {
    i18n.keys[key] = val;
    i18n.ui.es[key] = val.es;
    i18n.ui.fr[key] = val.fr;
    i18n.ui.en[key] = val.en;
  }

  fs.writeFileSync(filePath, JSON.stringify(i18n, null, 2), 'utf-8');
  console.log('Updated i18n in', filePath);
}

updateI18n(path.resolve('src/data/i18n.json'));
updateI18n(path.resolve('i18n.json'));

// 2. Update forests JSON files
function updateForestsRiddles(filePath) {
  if (!fs.existsSync(filePath)) return;
  const forests = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const nalda = forests.find(f => f.id === 'nalda');
  if (!nalda) return;

  // Question mapping helper
  const multipleChoiceMap = {
    'f-t1-1': {
      qKey: 'f_t1_1_question',
      optsKeys: ['f_t1_1_opt_a', 'f_t1_1_opt_b', 'f_t1_1_opt_c', 'f_t1_1_opt_d'],
      hintsKeys: ['f_t1_1_hint1', 'f_t1_1_hint2', 'f_t1_1_hint3'],
      correctIndex: 1
    },
    'f-t2-1': {
      qKey: 'f_t2_1_question',
      optsKeys: ['f_t2_1_opt_a', 'f_t2_1_opt_b', 'f_t2_1_opt_c', 'f_t2_1_opt_d'],
      hintsKeys: ['f_t2_1_hint1', 'f_t2_1_hint2', 'f_t2_1_hint3'],
      correctIndex: 2
    },
    'f-t3-1': {
      qKey: 'f_t3_1_question',
      optsKeys: ['f_t3_1_opt_a', 'f_t3_1_opt_b', 'f_t3_1_opt_c', 'f_t3_1_opt_d'],
      hintsKeys: ['f_t3_1_hint1', 'f_t3_1_hint2', 'f_t3_1_hint3'],
      correctIndex: 1
    },
    'f-t4-1': {
      qKey: 'f_t4_1_question',
      optsKeys: ['f_t4_1_opt_a', 'f_t4_1_opt_b', 'f_t4_1_opt_c', 'f_t4_1_opt_d'],
      hintsKeys: ['f_t4_1_hint1', 'f_t4_1_hint2', 'f_t4_1_hint3'],
      correctIndex: 0
    }
  };

  const textRiddleMap = {
    'f-t1-2': {
      qKey: 'f_t1_2_question',
      ansKeys: ['f_t1_2_ans1', 'f_t1_2_ans2', 'f_t1_2_ans3'],
      hintsKeys: ['f_t1_2_hint1', 'f_t1_2_hint2', 'f_t1_2_hint3']
    },
    'f-t1-3': {
      qKey: 'f_t1_3_question',
      ansKeys: ['f_t1_3_ans1', 'f_t1_3_ans2', 'f_t1_3_ans3'],
      hintsKeys: ['f_t1_3_hint1', 'f_t1_3_hint2', 'f_t1_3_hint3']
    },
    'f-t2-2': {
      qKey: 'f_t2_2_question',
      ansKeys: ['f_t2_2_ans1', 'f_t2_2_ans2', 'f_t2_2_ans3'],
      hintsKeys: ['f_t2_2_hint1', 'f_t2_2_hint2', 'f_t2_2_hint3']
    },
    'f-t2-3': {
      qKey: 'f_t2_3_question',
      ansKeys: ['f_t2_3_ans1', 'f_t2_3_ans2', 'f_t2_3_ans3'],
      hintsKeys: ['f_t2_3_hint1', 'f_t2_3_hint2', 'f_t2_3_hint3']
    },
    'f-t3-2': {
      qKey: 'f_t3_2_question',
      ansKeys: ['f_t3_2_ans1', 'f_t3_2_ans2', 'f_t3_2_ans3'],
      hintsKeys: ['f_t3_2_hint1', 'f_t3_2_hint2', 'f_t3_2_hint3']
    },
    'f-t3-3': {
      qKey: 'f_t3_3_question',
      ansKeys: ['f_t3_3_ans1', 'f_t3_3_ans2', 'f_t3_3_ans3'],
      hintsKeys: ['f_t3_3_hint1', 'f_t3_3_hint2', 'f_t3_3_hint3']
    },
    'f-t4-2': {
      qKey: 'f_t4_2_question',
      ansKeys: ['f_t4_2_ans1', 'f_t4_2_ans2', 'f_t4_2_ans3'],
      hintsKeys: ['f_t4_2_hint1', 'f_t4_2_hint2', 'f_t4_2_hint3']
    },
    'f-t4-3': {
      qKey: 'f_t4_3_question',
      ansKeys: ['f_t4_3_ans1', 'f_t4_3_ans2', 'f_t4_3_ans3'],
      hintsKeys: ['f_t4_3_hint1', 'f_t4_3_hint2', 'f_t4_3_hint3']
    },
    'f-t5-1': {
      qKey: 'f_t5_1_question',
      ansKeys: ['f_t5_1_ans1', 'f_t5_1_ans2', 'f_t5_1_ans3'],
      hintsKeys: ['f_t5_1_hint1', 'f_t5_1_hint2', 'f_t5_1_hint3']
    },
    'f-t5-2': {
      qKey: 'f_t5_2_question',
      ansKeys: ['f_t5_2_ans1', 'f_t5_2_ans2'],
      hintsKeys: ['f_t5_2_hint1', 'f_t5_2_hint2', 'f_t5_2_hint3']
    }
  };

  const extraTestsMap = {
    'f-extra-brindis': { tKey: 'f_extra_brindis_title', dKey: 'f_extra_brindis_description' },
    'f-extra-eructo': { tKey: 'f_extra_eructo_title', dKey: 'f_extra_eructo_description' },
    'f-extra-confesion': { tKey: 'f_extra_confesion_title', dKey: 'f_extra_confesion_description' },
    'f-extra-pecho': { tKey: 'f_extra_pecho_title', dKey: 'f_extra_pecho_description' },
    'f-extra-siesta': { tKey: 'f_extra_siesta_title', dKey: 'f_extra_siesta_description' },
    'f-extra-baile-vino': { tKey: 'f_extra_baile_vino_title', dKey: 'f_extra_baile_vino_description' }
  };

  nalda.riddles = nalda.riddles.map((r) => {
    if (r.storyId !== 'fraile-botijo') return r;

    if (multipleChoiceMap[r.id]) {
      const cfg = multipleChoiceMap[r.id];
      const q = userReplacements[cfg.qKey].es;
      const opts = cfg.optsKeys.map(k => userReplacements[k].es);
      const hints = cfg.hintsKeys.map(k => userReplacements[k].es);
      const ans = opts[cfg.correctIndex];
      return {
        ...r,
        question: q,
        options: opts,
        answer: ans,
        correctIndex: cfg.correctIndex,
        hints,
        staticHints: hints,
        questionKey: cfg.qKey,
        optionsKeys: cfg.optsKeys,
        hintsKeys: cfg.hintsKeys
      };
    }

    if (textRiddleMap[r.id]) {
      const cfg = textRiddleMap[r.id];
      const q = userReplacements[cfg.qKey].es;
      const accepted = cfg.ansKeys.map(k => userReplacements[k]?.es).filter(Boolean);
      const hints = cfg.hintsKeys.map(k => userReplacements[k].es);
      return {
        ...r,
        question: q,
        acceptedAnswers: accepted,
        answer: accepted[0],
        hints,
        staticHints: hints,
        questionKey: cfg.qKey,
        answersKeys: cfg.ansKeys,
        hintsKeys: cfg.hintsKeys
      };
    }

    if (extraTestsMap[r.id]) {
      const cfg = extraTestsMap[r.id];
      const title = userReplacements[cfg.tKey].es;
      const desc = userReplacements[cfg.dKey].es;
      return {
        ...r,
        name: title,
        question: desc,
        titleKey: cfg.tKey,
        descriptionKey: cfg.dKey
      };
    }

    return r;
  });

  fs.writeFileSync(filePath, JSON.stringify(forests, null, 2), 'utf-8');
  console.log('Updated Fray Botijo riddles in', filePath);
}

updateForestsRiddles(path.resolve('data/forests.json'));
updateForestsRiddles(path.resolve('forest-packs-seed.json'));
updateForestsRiddles(path.resolve('data/forest-packs-seed.json'));

console.log('Replacement finished successfully!');
