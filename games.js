// ── BLOBINFO — games.js ──
// Base de données des jeux les plus connus

const GAMES = [
  {
    id: 1,
    name: "Minecraft",
    icon: "⛏️",
    genre: "Survie / Créatif",
    year: 2011,
    dev: "Mojang Studios",
    desc: "Le jeu de construction et de survie le plus vendu de l'histoire. Explore un monde infini généré aléatoirement, construis des structures épiques et survie la nuit face aux monstres.",
    tags: ["Sandbox", "Multijoueur", "Création", "Survie", "PC", "Console", "Mobile"]
  },
  {
    id: 2,
    name: "Fortnite",
    icon: "🔫",
    genre: "Battle Royale",
    year: 2017,
    dev: "Epic Games",
    desc: "Le battle royale le plus populaire au monde. 100 joueurs s'affrontent sur une île en rétrécissement, avec un système de construction unique qui ajoute une dimension stratégique.",
    tags: ["Battle Royale", "Free-to-play", "Multijoueur", "Construction", "Compétitif"]
  },
  {
    id: 3,
    name: "The Legend of Zelda: Breath of the Wild",
    icon: "🗡️",
    genre: "Aventure / RPG",
    year: 2017,
    dev: "Nintendo",
    desc: "Une révolution dans les jeux d'aventure en monde ouvert. Link explore Hyrule dans une liberté totale, grimpant chaque montagne, résolvant des sanctuaires et combattant Ganon.",
    tags: ["Open World", "Aventure", "Nintendo", "Switch", "Puzzle", "Exploration"]
  },
  {
    id: 4,
    name: "Grand Theft Auto V",
    icon: "🚗",
    genre: "Action / Open World",
    year: 2013,
    dev: "Rockstar Games",
    desc: "La ville fictive de Los Santos est ton terrain de jeu. Vis des histoires de trois criminels aux destins croisés dans un monde ouvert hyper-détaillé, avec un mode multijoueur colossal.",
    tags: ["Open World", "Action", "Crime", "Multijoueur", "Adulte", "PC", "Console"]
  },
  {
    id: 5,
    name: "Among Us",
    icon: "👾",
    genre: "Party / Déduction",
    year: 2018,
    dev: "Innersloth",
    desc: "Un jeu de déduction sociale où des imposteurs se cachent parmi l'équipage d'un vaisseau spatial. Trahis tes amis ou trouve qui ment — le chaos assuré en soirée.",
    tags: ["Party Game", "Déduction", "Multijoueur", "Mobile", "PC", "Social"]
  },
  {
    id: 6,
    name: "League of Legends",
    icon: "⚔️",
    genre: "MOBA",
    year: 2009,
    dev: "Riot Games",
    desc: "Le MOBA le plus joué au monde. Choisis parmi des centaines de champions aux capacités uniques et combats en équipe de 5 pour détruire le Nexus ennemi.",
    tags: ["MOBA", "Compétitif", "Free-to-play", "Esport", "PC", "Stratégie"]
  },
  {
{
    id: 7,
    name: "Valorant",
    icon: "🎯",
    genre: "FPS Tactique",
    year: 2020,
    dev: "Riot Games",

    desc: "Valorant est un FPS tactique où deux équipes de cinq joueurs s'affrontent. Chaque agent possède des capacités uniques qui viennent compléter le gunplay.",

    tags: [
        "FPS",
        "Compétitif",
        "Esport",
        "Free-to-play",
        "PC",
        "Riot Games"
    ],

    guide: {

        economy: [
            ["Pistol (Attaque)", "Ghost ou Sheriff"],
            ["Pistol (Défense)", "Ghost ou Frenzy"],
            ["Victoire pistol", "Spectre + Bouclier léger"],
            ["Défaite pistol", "Classic ou Sheriff"],
            ["Bonus", "Garder Spectre"],
            ["Full Buy", "Vandal + Armure lourde"],
            ["Eco", "Sheriff / Marshal"],
            ["Force Buy", "Bulldog / Guardian / Spectre"]
        ],

        weapons: [
            {
                name: "Vandal",
                use: "Excellente sur les longues distances. One Tap dans la tête."
            },
            {
                name: "Phantom",
                use: "Parfaite pour les smokes et les combats rapprochés."
            },
            {
                name: "Operator",
                use: "Très forte pour tenir une ligne."
            },
            {
                name: "Sheriff",
                use: "La meilleure arme d'éco."
            }
        ],

        maps: {

            "Ascent": [
                "Omen",
                "Sova",
                "Killjoy",
                "Jett",
                "KAY/O"
            ],

            "Bind": [
                "Brimstone",
                "Raze",
                "Gekko",
                "Cypher",
                "Viper"
            ],

            "Haven": [
                "Omen",
                "Breach",
                "Sova",
                "Jett",
                "Cypher"
            ],

            "Split": [
                "Omen",
                "Raze",
                "Cypher",
                "Sage",
                "Breach"
            ],

            "Lotus": [
                "Omen",
                "Fade",
                "Raze",
                "Killjoy",
                "Vyse"
            ],

            "Sunset": [
                "Omen",
                "Cypher",
                "Breach",
                "Neon",
                "Sova"
            ],

            "Icebox": [
                "Viper",
                "Sova",
                "Killjoy",
                "Jett",
                "Harbor"
            ]
        },

        tips: [

            "Ne recharge pas après chaque kill.",

            "Joue toujours avec ton équipe.",

            "Économise lorsque toute l'équipe économise.",

            "Regarde régulièrement la minimap.",

            "Utilise tes compétences avant de prendre un duel.",

            "Ne gaspille pas toutes tes utilités dès le début du round.",

            "Préfire les angles les plus joués.",

            "Communique toutes les informations importantes."
        ]
    }
},
  },
  {
    id: 8,
    name: "Elden Ring",
    icon: "💀",
    genre: "Action RPG",
    year: 2022,
    dev: "FromSoftware",
    desc: "Un chef-d'œuvre de FromSoftware créé avec George R. R. Martin. Explore les Terres Intermédiaires, affronte des boss dantesques et forge ta propre légende dans un monde sombre et magnifique.",
    tags: ["Souls-like", "Action RPG", "Difficile", "Open World", "Dark Fantasy"]
  },
  {
    id: 9,
    name: "Pokémon",
    icon: "⚡",
    genre: "RPG / Aventure",
    year: 1996,
    dev: "Game Freak / Nintendo",
    desc: "Capture, entraîne et fais combattre des centaines de créatures appelées Pokémon. La franchise emblématique de Nintendo qui a traversé les générations sur Game Boy, DS, Switch et bien plus.",
    tags: ["RPG", "Aventure", "Collection", "Nintendo", "Enfants", "Compétitif"]
  },
  {
    id: 10,
    name: "Call of Duty",
    icon: "🪖",
    genre: "FPS",
    year: 2003,
    dev: "Activision",
    desc: "La franchise de FPS la plus vendue au monde. Des batailles de la Seconde Guerre mondiale aux combats futuristes, en passant par le battle royale Warzone, COD redéfinit l'action militaire.",
    tags: ["FPS", "Militaire", "Multijoueur", "Battle Royale", "Action", "Compétitif"]
  },
  {
    id: 11,
    name: "Cyberpunk 2077",
    icon: "🤖",
    genre: "RPG / Open World",
    year: 2020,
    dev: "CD Projekt Red",
    desc: "Plonge dans Night City, une mégalopole du futur obsédée par le pouvoir et les modifications corporelles. Joue V, un mercenaire en quête d'immortalité dans un monde cyberpunk saisissant.",
    tags: ["RPG", "Open World", "Sci-fi", "Adulte", "PC", "Console", "Narratif"]
  },
  {
    id: 12,
    name: "The Witcher 3",
    icon: "🐺",
    genre: "RPG",
    year: 2015,
    dev: "CD Projekt Red",
    desc: "L'un des meilleurs RPG de tous les temps. Incarne Geralt de Riv, un chasseur de monstres professionnel, dans un monde médiéval-fantastique richissime aux quêtes inoubliables.",
    tags: ["RPG", "Fantasy", "Open World", "Narratif", "Adulte", "Magie"]
  },
  {
    id: 13,
    name: "FIFA / EA Sports FC",
    icon: "⚽",
    genre: "Sport",
    year: 1993,
    dev: "EA Sports",
    desc: "La simulation de football la plus vendue. Gère ton club en mode Carrière, crée ton joueur ou compète en Ultimate Team pour bâtir l'équipe de tes rêves.",
    tags: ["Sport", "Football", "Multijoueur", "Compétitif", "Ultimate Team"]
  },
  {
    id: 14,
    name: "Apex Legends",
    icon: "🦾",
    genre: "Battle Royale / FPS",
    year: 2019,
    dev: "Respawn Entertainment",
    desc: "Le battle royale en équipe à l'élan de jeu fulgurant. Choisis ta légende parmi une liste de personnages aux capacités uniques et domine les arènes avec ta squad.",
    tags: ["Battle Royale", "FPS", "Free-to-play", "Compétitif", "Héros", "Esport"]
  },
  {
    id: 15,
    name: "Rocket League",
    icon: "🚀",
    genre: "Sport / Action",
    year: 2015,
    dev: "Psyonix",
    desc: "Football + voitures fusées = fun infini. Un sport compétitif unique où des véhicules boostés jouent au football dans des arènes spectaculaires. Simple à apprendre, impossible à maîtriser.",
    tags: ["Sport", "Compétitif", "Free-to-play", "Multijoueur", "Esport", "Voitures"]
  },
  {
    id: 16,
    name: "Overwatch 2",
    icon: "🦸",
    genre: "FPS / Héros",
    year: 2022,
    dev: "Blizzard Entertainment",
    desc: "Un FPS par équipe avec une galerie de héros hauts en couleur. Attaque, défends et sécurise des objectifs en combinant les capacités de ton équipe pour créer des synergies dévastatrices.",
    tags: ["FPS", "Héros", "Free-to-play", "Compétitif", "Esport", "Equipe"]
  },
  {
    id: 17,
    name: "Hollow Knight",
    icon: "🦋",
    genre: "Metroidvania",
    year: 2017,
    dev: "Team Cherry",
    desc: "Un metroidvania de toute beauté dans un royaume souterrain d'insectes. Explore Hallownest, un empire mystérieux envahi par une infection, avec une profondeur de gameplay et de lore rare.",
    tags: ["Indie", "Metroidvania", "Difficile", "Exploration", "Plateforme", "2D"]
  },
  {
    id: 18,
    name: "Stardew Valley",
    icon: "🌱",
    genre: "Simulation / RPG",
    year: 2016,
    dev: "ConcernedApe",
    desc: "Hérite d'une ferme abandonnée et transforme-la en exploitation florissante. Cultive, élevage, mine, pêche, noue des relations avec les villageois et découvre les secrets de la Vallée.",
    tags: ["Simulation", "Indie", "Relaxant", "RPG", "Multijoueur", "Pixel Art"]
  },
  {
    id: 19,
    name: "Dark Souls",
    icon: "🔥",
    genre: "Action RPG",
    year: 2011,
    dev: "FromSoftware",
    desc: "Le jeu qui a défini un genre. Meurs, apprends, recommence. Explore Lordran dans un monde d'une cohérence architecturale et narrative rare, ponctué de boss mémorables.",
    tags: ["Souls-like", "Difficile", "Action RPG", "Dark Fantasy", "Exploration"]
  },
  {
    id: 20,
    name: "Super Mario Bros",
    icon: "🍄",
    genre: "Plateforme",
    year: 1985,
    dev: "Nintendo",
    desc: "L'icône absolue du jeu vidéo. Mario saute, court et explore des niveaux colorés depuis 1985. La franchise qui a sauvé l'industrie du jeu vidéo et ne cesse d'innover.",
    tags: ["Plateforme", "Nintendo", "Tous publics", "Classique", "Multijoueur"]
  },
  {
    id: 21,
    name: "Counter-Strike 2",
    icon: "💣",
    genre: "FPS Tactique",
    year: 2023,
    dev: "Valve",
    desc: "Le FPS tactique de référence depuis des décennies. Terroristes contre contre-terroristes, économie d'armes, communication d'équipe — CS2 est l'essence du shooter compétitif.",
    tags: ["FPS", "Tactique", "Compétitif", "Esport", "Free-to-play", "PC"]
  },
  {
    id: 22,
    name: "Genshin Impact",
    icon: "🌸",
    genre: "Action RPG",
    year: 2020,
    dev: "HoYoverse",
    desc: "Un RPG d'action en monde ouvert au style manga enchantereur. Explore Teyvat avec des personnages aux éléments variés, résous des puzzles et plonge dans une histoire épique.",
    tags: ["RPG", "Free-to-play", "Gacha", "Open World", "Mobile", "PC", "Anime"]
  },
  {
    id: 23,
    name: "Red Dead Redemption 2",
    icon: "🤠",
    genre: "Action / Open World",
    year: 2018,
    dev: "Rockstar Games",
    desc: "Une épopée western d'une profondeur narrative inégalée. Incarne Arthur Morgan, hors-la-loi au grand cœur, dans le crépuscule de l'ère des cow-boys. Un chef-d'œuvre cinématographique.",
    tags: ["Open World", "Western", "Narratif", "Action", "Adulte", "Immersif"]
  },
  {
    id: 24,
    name: "Terraria",
    icon: "🌍",
    genre: "Aventure / Sandbox",
    year: 2011,
    dev: "Re-Logic",
    desc: "Un jeu de survie 2D infini. Creuse, construit, explore et affronte des centaines de boss et événements dans un monde généré aléatoirement riche en secrets et en contenu.",
    tags: ["Sandbox", "2D", "Survie", "Exploration", "Multijoueur", "Craft"]
  },
  {
    id: 25,
    name: "Hades",
    icon: "⚡",
    genre: "Roguelike",
    year: 2020,
    dev: "Supergiant Games",
    desc: "Un roguelike d'action dans la mythologie grecque. Zagreus tente de s'échapper des Enfers en enchainant les runs, débloquant de nouvelles capacités et révélant une narration progressive.",
    tags: ["Roguelike", "Indie", "Action", "Mythologie", "Narratif", "Réjouabilité"]
  },
  {
    id: 26,
    name: "Phasmophobia",
    icon: "👻",
    genre: "Horreur / Coop",
    year: 2020,
    dev: "Kinetic Games",
    desc: "Un jeu de chasse aux fantômes coopératif en réalité virtuelle optionnelle. Enquête avec ton équipe pour identifier le type de fantôme dans des maisons hantées de plus en plus terrifiantes.",
    tags: ["Horreur", "Coop", "Multijoueur", "VR", "Indie", "Enquête"]
  },
  {
    id: 27,
    name: "Celeste",
    icon: "🏔️",
    genre: "Plateforme",
    year: 2018,
    dev: "Maddy Thorson",
    desc: "Un jeu de plateforme de précision avec une histoire touchante sur la santé mentale. Escalade la montagne Celeste, surmonte tes peurs et découvre un level design d'une clarté cristalline.",
    tags: ["Plateforme", "Indie", "Difficile", "Narratif", "Précision", "Accessible"]
  },
  {
    id: 28,
    name: "Dota 2",
    icon: "🏰",
    genre: "MOBA",
    year: 2013,
    dev: "Valve",
    desc: "Le MOBA le plus complexe et le plus profond. Deux équipes de cinq héros s'affrontent dans des batailles stratégiques intenses pour détruire l'Ancienne adverse.",
    tags: ["MOBA", "Stratégie", "Compétitif", "Free-to-play", "Esport", "PC"]
  },
  {
    id: 29,
    name: "Animal Crossing: New Horizons",
    icon: "🏝️",
    genre: "Simulation / Relaxant",
    year: 2020,
    dev: "Nintendo",
    desc: "Installe-toi sur une île déserte et construis la communauté de tes rêves. Pêche, attrape des insectes, décore ton île et accueille des voisins mignons dans ce jeu au rythme des saisons.",
    tags: ["Simulation", "Relaxant", "Nintendo", "Switch", "Tous publics", "Créatif"]
  },
  {
    id: 30,
    name: "Baldur's Gate 3",
    icon: "🎲",
    genre: "RPG / Tour par tour",
    year: 2023,
    dev: "Larian Studios",
    desc: "Le RPG de l'année 2023. Basé sur D&D 5e, ce jeu offre une liberté narrative extraordinaire, des personnages mémorables et des choix qui façonnent vraiment l'histoire en coop ou en solo.",
    tags: ["RPG", "D&D", "Tour par tour", "Coop", "Narratif", "Fantasy", "PC"]
  }
];
