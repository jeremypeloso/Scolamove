import type { Sejour } from "./sejours";

export const franceSejours: Sejour[] = [
      {
    id: "volcanisme-en-auvergne",
    title: "Volcanisme en Auvergne",
    destination: "Auvergne",
    country: "France",
    region: "Auvergne-Rhône-Alpes",
    language: "Français",
    duration: "3 jours / 2 nuits",
    level: "Collège / Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "218€",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80",
    badge: "Sciences",
    featured: false,
    theme: "Nature & sciences",
    description:
      "Vivez une escale nature au cœur du Parc des Volcans d’Auvergne : explorez le volcan de Lemptégy, site unique où les entrailles d’un volcan se révèlent à ciel ouvert, découvrez l’univers fascinant du parc Vulcania et parcourez les sentiers d’un volcan basaltique. Une immersion captivante où la géologie et le volcanisme se dévoilent sous toutes leurs facettes.",
    objectives: [
      "Découvrir les volcans : comprendre leur origine et leurs secrets sur le terrain.",
      "Vivre la science à travers ateliers et animations immersives.",
      "Stimuler la curiosité face aux merveilles de la nature.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Volcan de Lemptégy",
        text:
          "Départ de l’établissement le matin ou la veille. Visite du volcan de Lemptégy avec animateur : découverte du volcanisme et expérience 4D unique en France, ou ascension du Puy de Dôme offrant un panorama exceptionnel. Dîner et nuit.",
      },
      {
        day: "Jour 2",
        title: "Vulcania",
        text:
          "Journée à Vulcania, parc dédié au volcanisme et aux sciences de la Terre : visite guidée interactive avec médiateur scientifique, découvertes ludiques et immersives, atelier pédagogique et visite libre. Déjeuner pique-nique. Dîner et nuit.",
      },
      {
        day: "Jour 3",
        title: "Puy de la vache - Voyage retour",
        text:
          "Montée à bord du train à crémaillère jusqu’au Puy de Dôme, point culminant de la chaîne des Puys. Au sommet, découverte de l’espace Grand Site de France, du Temple de Mercure, ainsi que des sentiers d’interprétation, jalonnés de légendes et d’anecdotes, lors d’une visite accompagnée par un guide de montagne. Retour vers l’établissement.",
      },
    ],
    visitBudget: "Environ 36€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "En complément, profitez d’activités variées : visite du château de Murol, sensations en VTT ou escalade, immersion dans une habitation troglodyte et découverte de la grotte de la Pierre de Volvic.",
  },
  {
    id: "lyon-et-la-resistance",
    title: "Lyon et la résistance",
    destination: "Lyon",
    country: "France",
    region: "Auvergne-Rhône-Alpes",
    language: "Français",
    duration: "3 jours / 2 nuits",
    level: "Collège / Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "221€",
    image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=1000&q=80",
    badge: "Histoire",
    featured: false,
    theme: "Mémoire & histoire",
    description:
      "Pendant la Seconde Guerre mondiale, Lyon a occupé une place majeure dans l’organisation de la Résistance. À travers ses rues et ses monuments, vous découvrirez des lieux emblématiques, témoins de cette période sombre mais aussi de l’engagement et du courage de ceux qui ont lutté pour la liberté.",
    objectives: [
      "Découvrir Lyon résistante : lieux et acteurs de la Seconde Guerre mondiale.",
      "Vivre la mémoire : témoignages et récits du quotidien sous l’Occupation.",
      "Réfléchir aux valeurs : liberté, résistance et paix.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Lyon",
        text:
          "Départ en autocar le matin ou la veille selon votre académie. Autocar à disposition pour le séjour. Déjeuner libre. Visite guidée « Lyon Résistance » en car : fort Montluc, maison du Dr Dugoujon, quai Jean Moulin. Dîner et nuit.",
      },
      {
        day: "Jour 2",
        title: "Lyon",
        text:
          "Visite guidée du Mémorial Jean Moulin avec questionnaire sur la Résistance. Déjeuner pique-nique. Temps libre au parc de la Tête d’Or. Visite contée sur la vie à Lyon sous l’Occupation. Dîner et nuit.",
      },
      {
        day: "Jour 3",
        title: "Lyon - Voyage retour",
        text:
          "Visite guidée du Centre d’Histoire de la Résistance et de la Déportation et de son exposition permanente. Temps libre, déjeuner pique-nique. Retour en autocar en soirée ou le lendemain selon votre académie.",
      },
    ],
    visitBudget: "Environ 23€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "En supplément, possibilité de visite de la prison de Montluc ou du musée de la Maison d’Izieu selon disponibilités.",
  },
  {
    id: "vienne-lyon-traces-romains",
    title: "Vienne et Lyon sur les traces des romains",
    destination: "Lyon / Vienne",
    country: "France",
    region: "Auvergne-Rhône-Alpes",
    language: "Français",
    duration: "3 jours / 2 nuits",
    level: "Collège / Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "217€",
    image: "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?auto=format&fit=crop&w=1000&q=80",
    badge: "Antiquité",
    featured: false,
    theme: "Civilisations antiques",
    description:
      "Ce programme associe la visite du site archéologique de Saint-Romain-en-Gal, l’un des plus vastes ensembles dédiés à la civilisation gallo-romaine en France, à la découverte de Lyon, ancienne capitale des Gaules, où se trouve le plus ancien amphithéâtre romain du pays.",
    objectives: [
      "Découvrir la civilisation gallo-romaine : musées, sites archéologiques et amphithéâtres.",
      "Comprendre l’évolution urbaine : de la capitale des Gaules aux quartiers historiques de Lyon et Vienne.",
      "Apprendre par l’expérience : ateliers et immersion dans le patrimoine antique.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Lyon",
        text:
          "Départ en autocar le matin ou la veille selon votre académie. Mise à disposition d’un autocar pour la durée du séjour. Déjeuner libre. Visite libre du Lugdunum musée. Puis, visite libre du site archéologique de Fourvière : les théâtres romains, le grand théâtre et l’Odéon, et visite libre de la basilique de Fourvière : chef d’œuvre de l’architecture éclectique du XIXème siècle. Dîner et nuit.",
      },
      {
        day: "Jour 2",
        title: "St Romain en Gal",
        text:
          "Visite guidée au musée gallo-romain de St Romain en Gal, musée et site. Déjeuner pique-nique. Route pour Vienne. Atelier pédagogique, puis découverte libre de la « Vienne gallo-romaine » : le théâtre romain adossé au Mont Pipet, le temple d’Auguste et de Livie, le jardin archéologique. Dîner et nuit.",
      },
      {
        day: "Jour 3",
        title: "Lyon - Voyage retour",
        text:
          "Visites à Lyon : découverte de l’amphithéâtre des Trois Gaules, puis temps libre dans le quartier de la Croix Rousse, ancien quartier des tisserands. Déjeuner pique-nique. Visite guidée « De Bellecour au vieux Lyon ». Départ en autocar et retour en soirée ou le lendemain, selon votre académie.",
      },
    ],
    visitBudget: "Environ 15€ par personne. À ajouter au prix du voyage.",
    possibleVisits: "Nous consulter.",
  },
  {
    id: "lyon-ville-des-lumieres",
    title: "Lyon, ville des lumières",
    destination: "Lyon",
    country: "France",
    region: "Auvergne-Rhône-Alpes",
    language: "Français",
    duration: "3 jours / 2 nuits",
    level: "Collège / Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "216€",
    image: "https://images.unsplash.com/photo-1558126019-29f1ccab0b04?auto=format&fit=crop&w=1000&q=80",
    badge: "",
    featured: false,
    theme: "Patrimoine & culture",
    description:
      "Lyon dévoile une richesse exceptionnelle de découvertes : du Vieux Lyon inscrit au patrimoine mondial de l’UNESCO à l’audacieux quartier moderne de la Confluence, en passant par ses musées renommés, la capitale des Gaules ne manquera pas de vous séduire.",
    objectives: [
      "Découvrir le patrimoine : Vieux Lyon, traboules et histoire.",
      "Explorer sciences et urbanisme : quartier Confluence et musée des Confluences.",
      "Plonger dans le cinéma : frères Lumière et effets spéciaux.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Lyon",
        text:
          "Départ en autocar le matin ou la veille, selon votre académie. Déplacements sur place en transport en commun. Déjeuner libre. Visite guidée à pied « De Fourvière au Vieux Lyon et ses traboules », découvrez le cœur de la ville et ses monuments au rythme des ruelles pavées, cours intérieures et traboules. Dîner et nuit.",
      },
      {
        day: "Jour 2",
        title: "Lyon",
        text:
          "Visite guidée du quartier Confluence, un modèle d’urbanisme contemporain où l’environnement est préservé. Déjeuner pique-nique. Visite libre du musée des Confluences sur la Grande Histoire de l’Homme, thèmes : origines, espèces, sociétés et éternités. Visite guidée du musée Lumière qui présente les inventions des frères Lumière dans leur cadre de vie d’origine ainsi que de nombreux objets optiques liés à l’invention du cinéma. Dîner et nuit.",
      },
      {
        day: "Jour 3",
        title: "Lyon - Voyage retour",
        text:
          "Visite libre du musée Miniatures et Cinéma qui propose une collection unique d’objets de cinéma. Vous saurez tout des effets spéciaux, des métiers et des techniques propres au 7ème art. Découverte libre de la fresque des Lyonnais célèbres. Déjeuner pique-nique. Visite guidée de l’opéra de Lyon. Départ en autocar, et retour en soirée ou le lendemain, selon votre académie.",
      },
    ],
    visitBudget: "Environ 51€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "En supplément : Musée des Beaux-Arts, Maison des Canuts, Musée Tony Garnier, Parc de la Tête d’Or, théâtres gallo-romains & Lugdunum et une croisière commentée.",
  },
    {
    id: "de-provins-a-guedelon",
    title: "De Provins à Guédelon",
    destination: "Provins / Guédelon",
    country: "France",
    region: "Bourgogne-Franche-Comté",
    language: "Français",
    duration: "2 jours / 1 nuit",
    level: "Collège / Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "94€",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1000&q=80",
    badge: "Moyen Âge",
    featured: false,
    theme: "Histoire médiévale",
    description:
      "Plongez au cœur du Moyen Âge : découvrez Provins, cité médiévale au patrimoine remarquable et animée par de grands spectacles historiques, puis explorez Guédelon, chantier unique où des ouvriers construisent un château fort dans le respect des techniques du XIIIe siècle.",
    objectives: [
      "Comprendre la société médiévale à travers un patrimoine vivant.",
      "Découvrir les métiers et techniques du Moyen Âge.",
      "Relier visites, ateliers et histoire concrète.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Provins",
        text:
          "Départ le matin en direction de Provins et visite guidée à pied de Provins, ville de foire médiévale, inscrite au Patrimoine Mondial de l’Humanité par l’UNESCO. Une thématique au choix : À l’assaut des remparts ou Les métiers du Moyen Âge ou Provins, au cœur des échanges. Déjeuner libre. Un spectacle au choix parmi : Les aigles des remparts ou La légende des chevaliers, puis un atelier au choix parmi : blasons, calligraphie, construire le Moyen Âge ou vitrail. Dîner et nuit.",
      },
      {
        day: "Jour 2",
        title: "Guédelon - Voyage retour",
        text:
          "Route pour Guédelon et visite du chantier médiéval de Guédelon avec rencontre de 3 chroniqueurs qui vous expliqueront le contexte historique et social du chantier ainsi que les travaux en cours : commencé il y a plus de 25 ans, 45 ouvriers construisent un château fort sous vos yeux dans le respect des techniques du XIIIe siècle. Déjeuner pique-nique. Un atelier au choix parmi : taille de pierre ou trait ou archéologie. Puis, visite libre du chantier médiéval et du moulin hydraulique à farine. Retour à votre établissement en soirée.",
      },
    ],
  },
  {
    id: "nature-et-ocean-a-brest",
    title: "Nature et océan à Brest",
    destination: "Brest",
    country: "France",
    region: "Bretagne",
    language: "Français",
    duration: "3 jours / 2 nuits",
    level: "Collège / Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "218€",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1000&q=80",
    badge: "Nature",
    featured: false,
    theme: "Océan & environnement",
    description:
      "Partez à l’extrême ouest de la France pour découvrir Brest avec Océanopolis, véritable fenêtre sur le monde marin, et explorez l’île de Molène, joyau préservé de la mer d’Iroise.",
    objectives: [
      "Explorer l’océan : comprendre ses écosystèmes et les enjeux du climat.",
      "Découvrir la biodiversité : observer la faune et la flore d’un milieu insulaire unique.",
      "Protéger la planète : sensibiliser aux menaces qui pèsent sur la nature et ses ressources.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Brest",
        text:
          "Départ en autocar le matin ou la veille, selon votre académie. Journée à Océanopolis. Le Centre National de Culture Scientifique dédié à l’Océan vous propose un voyage au cœur de l’Océan et de ses écosystèmes marins. Découverte de ses 4 espaces marins : le sentier des loutres, le pavillon polaire, le pavillon Bretagne et le pavillon tropical. Déjeuner libre. Atelier au choix : les coraux d’eau froide face au dérèglement climatique ou Plastik panic dans l’océan. Temps libre sur le port de plaisance. Dîner et nuit en auberge de jeunesse.",
      },
      {
        day: "Jour 2",
        title: "Île de Molène",
        text:
          "Départ en bateau pour l’île de Molène. Visite guidée de cette petite île où il n’y a pas de voiture, en alternance. Déjeuner pique-nique. Visite du sémaphore et de la maison de la nature. Traversée retour. Dîner et nuit en auberge de jeunesse.",
      },
      {
        day: "Jour 3",
        title: "Brest - Voyage retour",
        text:
          "Visite pédagogique des serres tropicales au jardin du conservatoire botanique national de Brest pour comprendre les menaces qui pèsent sur la diversité végétale et l’importance des plantes pour la biosphère et pour l’homme. Déjeuner pique-nique. Départ de Brest en début d’après-midi en autocar et retour en soirée.",
      },
    ],
    visitBudget: "Environ 36€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "Activités sportives : catamaran, planche à voile, bateau collectif, kayak, paddle et big SUP.",
  },
  {
    id: "combine-val-de-loire-futuroscope",
    title: "Combiné Val de Loire et Futuroscope",
    destination: "Val de Loire / Futuroscope",
    country: "France",
    region: "Centre-Val de Loire",
    language: "Français",
    duration: "3 jours / 2 nuits",
    level: "Collège / Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "208€",
    image: "https://images.unsplash.com/photo-1598812866501-87ad598839e7?auto=format&fit=crop&w=1000&q=80",
    badge: "Best-seller",
    featured: false,
    theme: "Patrimoine & sciences",
    description:
      "Offrez-vous un voyage hors du commun, entre histoire et modernité : émerveillez-vous devant la splendeur des châteaux de la Loire, puis laissez-vous surprendre par le monde futuriste et les expériences technologiques inédites du Futuroscope.",
    objectives: [
      "Découvrir la Renaissance : architecture et génie de Léonard de Vinci.",
      "Relier passé et futur : des châteaux au Futuroscope.",
      "Éveiller la curiosité : expériences immersives et innovations.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Chenonceau - Amboise - Futuroscope",
        text:
          "Départ en autocar le matin. Visite libre du château de Chenonceau, chef d’œuvre de la Renaissance française, construit sur le lit même du Cher. Déjeuner libre. Route pour Amboise et découverte du château du Clos Lucé et du parc Léonard de Vinci qui met en scène, dans un parcours paysager, ses créations et ses inventions. Route pour le parc du Futuroscope. Dîner et nuit en hôtel.",
      },
      {
        day: "Jour 2",
        title: "Futuroscope",
        text:
          "Visite libre du parc avec une quarantaine d’attractions, dont Objectif Mars, l’expérience phare mêlant intérieur/extérieur et pointes à 55 km/h. Déjeuner sur le parc. Profitez aussi de Chasseurs de tornades, l’Extraordinaire Voyage, Arthur 4D, l’Âge de Glace, Sébastien Loeb Racing Experience et Dynamic, ainsi que du spectacle de magie IllusiO et des grands classiques : La Vienne Dynamique, Danse avec les Robots, Dans les yeux de Thomas Pesquet, la Machine à voyager dans le temps. Dîner, spectacle nocturne La Clé des Songes, puis nuit.",
      },
      {
        day: "Jour 3",
        title: "Futuroscope - Voyage retour",
        text:
          "Suite de la découverte libre du parc. Déjeuner sur le parc. Suite de la visite. Départ en autocar et retour en soirée.",
      },
    ],
    visitBudget: "Environ 25€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "Animation les Yeux Grands Fermés. Visite accompagnée du parc Futuroscope.",
  },
  {
    id: "decouvertes-naturelles-en-anjou",
    title: "Découvertes naturelles en Anjou",
    destination: "Anjou",
    country: "France",
    region: "Centre-Val de Loire",
    language: "Français",
    duration: "3 jours / 2 nuits",
    level: "Collège / Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "Sur demande",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
    badge: "Nature",
    featured: false,
    theme: "Nature & biodiversité",
    description:
      "De la majestueuse abbaye Royale de Fontevraud à l’incroyable aventure souterraine de la Mine Bleue, en passant par l’univers troglodytique et les merveilles végétales de Terra Botanica, vivez des découvertes riches en émotions au cœur de l’Anjou Val de Loire.",
    objectives: [
      "Explorer le patrimoine : découvrir l’histoire monastique et la vie troglodytique en Anjou.",
      "Comprendre la biodiversité : observer la richesse végétale mondiale à Terra Botanica.",
      "Découvrir un savoir-faire : plonger dans l’univers de l’ardoise à la Mine Bleue.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Fontevraud - Rochemenier",
        text:
          "Départ de votre établissement le matin. Visite guidée de l’abbaye de Fontevraud, l’une des plus grandes cités monastiques d’Europe. Déjeuner libre. Visite commentée du village troglodyte de Rochemenier composé de deux anciennes fermes, d’une chapelle, d’habitations modernisées, d’un poulailler, de meubles, d’outils et instruments de travail des champs. Dîner et nuit.",
      },
      {
        day: "Jour 2",
        title: "Terra Botanica",
        text:
          "Journée libre avec documents pédagogiques à Terra Botanica, le premier parc du végétal en Europe avec ses 275.000 espèces végétales venant du monde entier et les collections d’orchidées, de roses, de palmiers. Déjeuner pique-nique. Découvrez la jungle, les déserts arides, les rizières d’Orient mais aussi les attractions : cinéma en 4D, balade en barque ou en coquille de noix. Atelier possible en option. Dîner et nuit.",
      },
      {
        day: "Jour 3",
        title: "Noyant la Gravoyère - Voyage retour",
        text:
          "Route pour Noyant la Gravoyère. Randonnée pédagogique libre dans la vallée du Misengrain. Déjeuner pique-nique. Visite guidée de la Mine Bleue à 126 mètres sous terre, ancienne carrière d’ardoise du début du XXe siècle. Animation commentée sur l’ardoise. Retour à votre établissement en soirée.",
      },
    ],
    visitBudget: "Tarif et budget visites de ce programme : à la demande.",
    possibleVisits:
      "Les supers pouvoirs des plantes extrêmes. Les grandes explorations des XVIe et XVIIIe siècles.",
  },
  {
    id: "renaissance-en-val-de-loire",
    title: "Renaissance en Val de Loire",
    destination: "Val de Loire",
    country: "France",
    region: "Centre-Val de Loire",
    language: "Français",
    duration: "3 jours / 2 nuits",
    level: "Collège / Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "182€",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=80",
    badge: "Patrimoine",
    featured: false,
    theme: "Renaissance & patrimoine",
    description:
      "Entre châteaux et jardins, découvrez une mosaïque de sites aussi riches que variés. Laissez-vous emporter par une histoire royale aux accents parfois insolites, puis vivez l’expérience unique d’une descente en canoë sur la Loire.",
    objectives: [
      "Découvrir la Renaissance : explorer les grands châteaux de la Loire et leur architecture.",
      "Rencontrer le génie de Léonard : comprendre ses inventions au Clos Lucé.",
      "Apprécier l’art des jardins : observer la beauté des jardins de Villandry.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Chambord - Amboise",
        text:
          "Départ en autocar le matin. Visite libre du château de Chambord, le plus vaste des châteaux de la Loire, joyau de la Renaissance construit par François 1er. En option : visite conférence ou ateliers pédagogiques. Déjeuner libre. Route pour Amboise et découverte du château du Clos Lucé et du parc Léonard de Vinci, avec livret pédagogique, qui met en scène, dans un parcours paysager, ses créations et ses inventions. Dîner et nuit.",
      },
      {
        day: "Jour 2",
        title: "Chenonceau - Civray de Touraine",
        text:
          "Visite libre du château de Chenonceau, chef d’œuvre de la Renaissance française, construit sur le lit même du Cher. Déjeuner pique-nique. Promenade à vélo le long de la Loire au départ de Blois. Dîner et nuit.",
      },
      {
        day: "Jour 3",
        title: "Villandry - Azay le Rideau - Voyage retour",
        text:
          "Découverte des splendides jardins Renaissance de Villandry. Déjeuner pique-nique. Visite libre du château d’Azay le Rideau, château édifié au XVIe siècle sur une île au milieu de l’Indre. Départ en autocar et retour en soirée.",
      },
    ],
    visitBudget: "Environ 53€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "Promenade en canoë sur le Cher, promenade commentée en gabarre, château de Cheverny & secrets de Moulinsart et Zoo de Beauval.",
  },
    {
    id: "strasbourg-bruxelles-capitales-europeennes",
    title: "De Strasbourg à Bruxelles : les capitales européennes",
    destination: "Strasbourg, Schengen, Bruxelles",
    country: "France",
    region: "Grand Est",
    language: "Citoyenneté européenne",
    duration: "3 jours / 2 nuits",
    level: "Collège et Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "À partir de 229€",
    image: "https://images.unsplash.com/photo-1577766001022-60d8b845a2f8?auto=format&fit=crop&w=1200&q=80",
    badge: "",
    featured: false,
    theme: "Europe",
    description:
      "De Strasbourg à Bruxelles, cet itinéraire vous conduit au cœur du fonctionnement de l’Union européenne. Vous y découvrirez les sièges de ses principales institutions, Parlement, Commission, Conseil et comprendrez leur rôle dans la construction et la vie démocratique européenne.",
    objectives: [
      "Découvrir l’Europe : comprendre les institutions et leur rôle.",
      "Revivre l’Histoire : des traités fondateurs à l’intégration européenne.",
      "Vivre l’Europe : visites, rencontres et découvertes sur le terrain.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Strasbourg",
        text: "Départ le matin en direction de Strasbourg ou la veille, selon votre académie. Déjeuner libre. Visite du Parlement Européen ou du Conseil de l’Europe. Découverte du vieux Strasbourg : la cathédrale, la Petite France, le quartier des tanneurs et des meuniers ou rallye européen à Strasbourg. Route pour le Luxembourg. Dîner et nuit en auberge de jeunesse.",
      },
      {
        day: "Jour 2",
        title: "Schengen",
        text: "Visite guidée « Schengen est vivant » en plein air, organisée par le Centre Européen Schengen. Déjeuner pique-nique et départ pour Bruxelles. Dîner et nuit en auberge de jeunesse.",
      },
      {
        day: "Jour 3",
        title: "Bruxelles - Voyage retour",
        text: "Visite ou conférence aux Institutions Européennes ou au Parlement, ou découverte du fonctionnement de l’Europe au Parlamentarium. Déjeuner pique-nique. Visite libre de la Maison de l’Histoire Européenne. Retour à votre établissement en soirée ou le lendemain, selon votre académie.",
      },
    ],
    visitBudget: "Environ 12€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "Maison de Robert Schuman à Scy-Chazelles, Cour de Justice de l’Union Européenne à Luxembourg-ville, visite guidée sur les traces de Robert Schuman, Parc Mini-Europe à Bruxelles.",
  },

  {
    id: "strasbourg-fribourg",
    title: "De Strasbourg à Fribourg",
    destination: "Strasbourg, Fribourg",
    country: "France",
    region: "Grand Est",
    language: "Europe et développement durable",
    duration: "3 jours / 2 nuits",
    level: "Collège et Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "À partir de 197€",
    image: "https://images.unsplash.com/photo-1602595688238-9fffe12d5af4?auto=format&fit=crop&w=1200&q=80",
    badge: "",
    featured: false,
    theme: "Europe durable",
    description:
      "Découvrez Strasbourg, ville au patrimoine architectural unique où se mêlent charme pittoresque et institutions européennes de premier plan. Poursuivez ensuite vers Fribourg, cité authentique de la Forêt-Noire, reconnue pour son engagement écologique.",
    objectives: [
      "Découvrir l’Europe : rôle et fonctionnement des institutions européennes.",
      "Explorer la ville durable : Fribourg, modèle d’urbanisme et d’énergie verte.",
      "Relier passé et futur : de l’histoire médiévale aux enjeux environnementaux.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Strasbourg",
        text: "Départ de votre établissement en autocar le matin ou la veille, selon votre académie, et route pour Strasbourg. Déjeuner libre. Visite du Parlement Européen ou du Conseil de l’Europe. Puis route pour Fribourg. Dîner et nuit en auberge de jeunesse.",
      },
      {
        day: "Jour 2",
        title: "Fribourg",
        text: "Visite guidée du centre historique de Fribourg de 1120 à 2020, d’un point de vue historique et urbanistique. Le guide présente ensuite le concept de mobilité mis en place dans la ville. Déjeuner pique-nique. Visite guidée sur le thème de l’urbanisme durable avec le quartier Vauban, son lotissement solaire, les maisons à énergie positive et la maison Heliotrop en extérieur.",
      },
      {
        day: "Jour 3",
        title: "Fribourg - Voyage retour",
        text: "Visite guidée du stade solaire et présentation d’une centrale hydroélectrique ainsi que les mesures de renaturation de la rivière Dreisam. Puis temps libre dans la ville. Retour à votre établissement en soirée ou le lendemain, selon votre académie.",
      },
    ],
    visitBudget: "Environ 37€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "Musée du Carnaval, montée au Schlossberg en téléphérique, Augustinermuseum, promenade en bateau sur le lac de Titisee.",
  },

  {
    id: "verdun-strasbourg",
    title: "De Verdun à Strasbourg",
    destination: "Verdun, Struthof, Strasbourg",
    country: "France",
    region: "Grand Est",
    language: "Histoire et mémoire",
    duration: "3 jours / 2 nuits",
    level: "Collège et Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "À partir de 238€",
    image: "https://images.unsplash.com/photo-1568974936468-98c38d6e8cfd?auto=format&fit=crop&w=1200&q=80",
    badge: "",
    featured: false,
    theme: "Mémoire",
    description:
      "Découvrez les villes emblématiques de l’Alsace et de la Grande Guerre à travers un itinéraire mêlant mémoire et modernité : des paysages marqués par l’histoire aux institutions de Strasbourg, capitale européenne d’aujourd’hui.",
    objectives: [
      "Se souvenir de la Grande Guerre : lieux de mémoire à Verdun.",
      "Comprendre la Seconde Guerre mondiale : visite du Struthof et réflexion sur la déportation.",
      "Relier mémoire et citoyenneté : découverte des institutions européennes à Strasbourg.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Verdun",
        text: "Départ de votre établissement le matin en direction de Verdun ou la veille, selon votre académie. Déjeuner libre. Visite avec guide conférencier : le mémorial-musée de la bataille de Fleury, le fort de Douaumont, l’ossuaire de Douaumont. Dîner et nuit.",
      },
      {
        day: "Jour 2",
        title: "Struthof",
        text: "Visite commentée du Fort de Mutzig, construit par les Allemands pour bloquer l’accès à la plaine d’Alsace aux troupes françaises. Déjeuner pique-nique. Route pour Natzwiller. Visite guidée de l’ex-camp de concentration du Struthof. Puis visite libre du centre européen du résistant déporté. Dîner et nuit.",
      },
      {
        day: "Jour 3",
        title: "Strasbourg - Voyage retour",
        text: "Route pour Strasbourg et visite du Parlement Européen ou du Conseil de l’Europe. Promenade dans le vieux Strasbourg : la cathédrale et son horloge astronomique, le quartier de la Petite France. Déjeuner pique-nique. Retour à votre établissement en soirée ou le lendemain selon votre académie.",
      },
    ],
    visitBudget: "Environ 26€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "Musée alsacien à Strasbourg, croisière sur l’Ill, Musée du Chocolat à Geispolsheim, château de Kaysersberg, Musée Unterlinden à Colmar, Mémorial Alsace-Moselle à Schirmeck.",
  },
    {
    id: "alsace-region-europeenne",
    title: "L’Alsace, région européenne",
    destination: "Strasbourg, Natzwiller, Orschwiller, Rust",
    country: "France",
    region: "Grand Est",
    language: "Europe et histoire",
    duration: "3 jours / 2 nuits",
    level: "Collège et Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "À partir de 214€",
    image: "https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=1200&q=80",
    badge: "",
    featured: false,
    theme: "Europe",
    description:
      "À la croisée de la France et de l’Allemagne, ce territoire marqué par une histoire mouvementée a longtemps été disputé entre les deux nations. Aujourd’hui, il incarne un lieu de rencontre et de réconciliation, où se mêlent les influences culturelles et où s’affirme l’idéal européen.",
    objectives: [
      "Découvrir l’Europe : visiter Strasbourg et ses institutions européennes.",
      "Préserver la mémoire : comprendre l’histoire au camp du Struthof.",
      "S’ouvrir à la culture européenne : explorer patrimoine, villages alsaciens et Europa-Park.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Strasbourg",
        text: "Départ de votre établissement le matin ou la veille, selon votre académie, en direction de Strasbourg, capitale européenne. Déjeuner libre. Découverte libre du vieux Strasbourg à pied : la cathédrale, la Petite France ou rallye avec un carnet de route en autonomie dans le quartier de la Petite France ou dans le quartier européen. Visite du Parlement Européen ou du Conseil de l’Europe. Dîner et nuit en hôtel.",
      },
      {
        day: "Jour 2",
        title: "Natzwiller - Orschwiller",
        text: "Route pour Natzwiller et visite guidée du camp du Struthof et du centre européen du résistant déporté. Déjeuner pique-nique. Route pour Orschwiller et visite libre du château du Haut-Koenigsbourg qui domine la plaine d’Alsace. Puis temps libre dans les villages de Ribeauvillé ou de Riquewihr. Dîner et nuit en hôtel.",
      },
      {
        day: "Jour 3",
        title: "Rust - Voyage retour",
        text: "Départ pour Rust en Allemagne et journée au parc d’attractions Europa-Park, composé de plus de 100 attractions autour de 15 quartiers européens. Déjeuner pique-nique. Suite de votre journée à Europa-Park. Retour à votre établissement en soirée ou le lendemain, selon votre académie.",
      },
    ],
    visitBudget: "Environ 52€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "Parlamentarium Simone Veil, Historial franco-allemand d’Hartmannswillerkopf, Mémorial Alsace-Moselle à Schirmeck.",
  },

  {
    id: "grande-guerre-champs-batailles",
    title: "Grande guerre et champs de batailles",
    destination: "Péronne, Chemin des Dames, Verdun",
    country: "France",
    region: "Grand Est / Hauts-de-France",
    language: "Histoire et mémoire",
    duration: "3 jours / 2 nuits",
    level: "Collège et Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "À partir de 217€",
    image: "https://images.unsplash.com/photo-1549643276-fdf2fab574f5?auto=format&fit=crop&w=1200&q=80",
    badge: "",
    featured: false,
    theme: "Mémoire",
    description:
      "Cette escapade, de la Somme à l’Alsace, vous invite à parcourir les hauts lieux de mémoire de la Première Guerre mondiale. Au fil des monuments, musées et sites commémoratifs, vous mesurerez l’ampleur du drame vécu par toute une génération.",
    objectives: [
      "Découvrir la Somme : champs de bataille et lieux de mémoire.",
      "Vivre l’histoire : musées, souterrains et témoignages de soldats.",
      "Se souvenir à Verdun : l’héritage de la Grande Guerre.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Péronne",
        text: "Départ de votre établissement le matin ou la veille, selon votre académie, en direction de Péronne, lieu de départ du circuit guidé du souvenir en car. Vous découvrirez les principaux champs de bataille et les monuments commémoratifs de la Première Guerre mondiale, révélateurs des combats meurtriers qui se déroulèrent dans ce secteur. Dîner et nuit.",
      },
      {
        day: "Jour 2",
        title: "Péronne",
        text: "Visite de l’Historial de la Grande Guerre à Péronne, qui retrace la bataille de la Somme et la vie des combattants durant le conflit. Déjeuner pique-nique. Visite de la Caverne du Dragon, baptisée Drachenhöhle par les Allemands, et immersion dans les souterrains transformés en caserne militaire lors de la Grande Guerre. Puis circuit guidé du Chemin des Dames : plateau de Californie, monument Haïm Kern, ancien village de Craonne, arboretum, cimetière de Craonnelle, monument des Basques. Dîner et nuit.",
      },
      {
        day: "Jour 3",
        title: "Verdun - Voyage retour",
        text: "Départ le matin en direction de Verdun. Visite avec guide conférencier : le mémorial-musée de la bataille de Fleury, le fort de Douaumont, l’ossuaire de Douaumont. Retour à votre établissement en soirée ou le lendemain, selon votre académie.",
      },
    ],
    visitBudget: "Environ 25€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "Citadelle de Verdun, Fort de Vaux, Centre mondial de la paix à Verdun, Mémorial de l’Armistice à Rethondes.",
  },

  {
    id: "nord-art-revolution-industrielle",
    title: "Le Nord : art et révolution industrielle",
    destination: "Loos-en-Gohelle, Lewarde, Lille, Lens, Roubaix",
    country: "France",
    region: "Hauts-de-France",
    language: "Patrimoine industriel",
    duration: "3 jours / 2 nuits",
    level: "Collège et Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "À partir de 217€",
    image: "https://images.unsplash.com/photo-1597758522183-654d6933e6f0?auto=format&fit=crop&w=1200&q=80",
    badge: "",
    featured: false,
    theme: "Art et industrie",
    description:
      "Mettez le cap sur le Nord–Pas-de-Calais, une région riche d’art, de culture, de patrimoine et d’histoire. Ici, traditions populaires, savoir-faire ancestraux et monuments remarquables révèlent une identité singulière.",
    objectives: [
      "Découvrir l’héritage minier : la vie des mineurs et le patrimoine industriel.",
      "Observer les reconversions : sites industriels transformés en espaces culturels.",
      "Explorer l’identité du Nord : entre mémoire ouvrière, art et modernité.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Loos-en-Gohelle - Lewarde",
        text: "Départ de votre établissement le matin en direction de Loos-en-Gohelle. Parcours commenté de la chaîne des terrils, site classé par l’Unesco, retraçant les différents aspects de la vie sociale et culturelle des mineurs. Déjeuner libre. Route pour Lewarde et visite guidée du centre historique minier, le plus grand musée de la mine en France. Dîner et nuit en auberge.",
      },
      {
        day: "Jour 2",
        title: "Lille - Lens",
        text: "Visite guidée de Lille en car sur le thème « Lille : patrimoine industriel réhabilité ». Vous découvrirez les lieux qui ont fait l’histoire économique et le patrimoine de la ville. Déjeuner pique-nique. Route pour Lens et visite libre du Louvre-Lens. Dîner et nuit en auberge de jeunesse.",
      },
      {
        day: "Jour 3",
        title: "Roubaix - Voyage retour",
        text: "Route pour Roubaix et circuit pédestre en centre-ville sur le thème du retour à l’âge industriel. Déjeuner pique-nique. Visite libre du musée d’art et d’industrie : La Piscine. Retour à votre établissement en soirée.",
      },
    ],
    visitBudget: "Environ 21€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "Mémorial canadien de Vimy, Lens’ 14-18, Centre d’Histoire Guerre et Paix, Villa Cavrois, Nécropole Notre-Dame de Lorette et Anneau de la Mémoire.",
  },
    {
    id: "decouverte-littoral-normand",
    title: "Découverte du littoral normand",
    destination: "Étretat, Honfleur, Asnelles, Bayeux",
    country: "France",
    region: "Normandie",
    language: "Nature et patrimoine",
    duration: "3 jours / 2 nuits",
    level: "Collège et Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "À partir de 216€",
    image: "https://images.unsplash.com/photo-1561995332-6f230d05f53f?auto=format&fit=crop&w=1200&q=80",
    badge: "",
    featured: false,
    theme: "Littoral",
    description:
      "Entre gastronomie, littoral, impressionnisme et histoire, la Normandie réunit toutes les richesses d’un territoire authentique. Venez y savourer ses produits locaux, véritables trésors du terroir, qui éveilleront vos papilles et prolongeront la découverte bien au-delà des paysages.",
    objectives: [
      "Comprendre la nature : formation et faune des falaises d’Étretat.",
      "Découvrir les savoir-faire : ostréiculture et spécialités normandes.",
      "Plonger dans l’histoire : la tapisserie de Bayeux et son patrimoine.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Étretat - Honfleur",
        text: "Départ de votre établissement le matin ou la veille, selon votre académie, en direction d’Étretat. Balade nature commentée à la découverte des falaises d’Étretat : la falaise, sa formation, ses mouvements, la craie, le silex, les galets, les plantes et les oiseaux des falaises. Déjeuner libre. Découverte libre d’Honfleur, cité maritime de caractère, avec ses ruelles pittoresques et ses maisons anciennes. Dîner et nuit.",
      },
      {
        day: "Jour 2",
        title: "Asnelles - Grandcamp-Maisy - Port-en-Bessin-Huppain",
        text: "Activité char à voile, en fonction des horaires de marée et des conditions météorologiques. Déjeuner pique-nique. Visite guidée d’une ferme ostréicole, puis dégustation, avec possibilité de voir les parcs en mer selon les marées. Puis visite guidée à pied du port de pêche de Port-en-Bessin-Huppain. Dîner et nuit.",
      },
      {
        day: "Jour 3",
        title: "Isigny-sur-Mer - Bayeux - Voyage retour",
        text: "Visite guidée de la fabrique de caramels d’Isigny. Puis visite guidée d’une chèvrerie et dégustation de spécialités fromagères. Déjeuner pique-nique. Visite audioguidée du musée de la Tapisserie de Bayeux, qui relate en 58 scènes les préparatifs et les débuts de la conquête d’Angleterre. Possibilité d’explorer Bayeux autrement, de balise en balise, à l’aide d’une application mobile gratuite. Retour à votre établissement en soirée ou le lendemain, selon votre académie.",
      },
    ],
    visitBudget: "Environ 56€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "Biscuiterie des sablés d’Asnelles, découverte du port du Havre en bateau, Naturospace, rallye guidé Houlgate la Grande Aventure, Saumonier.",
  },

  {
    id: "ecologie-baie-mont-saint-michel",
    title: "Écologie en Baie du Mont-Saint-Michel",
    destination: "Normandie, Mont-Saint-Michel, Saint-Malo",
    country: "France",
    region: "Normandie",
    language: "Écologie et biodiversité",
    duration: "3 jours / 2 nuits",
    level: "Collège et Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "À partir de 212€",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
    badge: "",
    featured: false,
    theme: "Écologie",
    description:
      "Partez à la découverte d’une région où l’homme vit en harmonie avec la nature, façonnée par une mer omniprésente. Entre biodiversité exceptionnelle et richesses naturelles à protéger, ce territoire invite à mieux comprendre l’importance de préserver notre environnement.",
    objectives: [
      "Découvrir la biodiversité : agriculture durable et écosystèmes de la baie.",
      "Explorer le Mont-Saint-Michel : histoire et environnement unique.",
      "Apprendre par l’expérience : ateliers marins et découvertes nature.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Normandie",
        text: "Départ de votre établissement le matin en direction de la Normandie. Visite guidée d’une ferme biologique et familiale. Découvrez son parc animalier, son musée du lait et toute la diversité de ses produits. Déjeuner pique-nique. Visite guidée sur le thème de la biodiversité et du développement durable à l’écomusée de la baie puis découverte des prés-salés. Dîner et nuit en auberge de jeunesse.",
      },
      {
        day: "Jour 2",
        title: "Mont-Saint-Michel",
        text: "Visite guidée de l’Abbaye du Mont-Saint-Michel. Puis visite libre du village avec ses remparts. Déjeuner pique-nique. Sortie commentée « Découverte des grèves » en direction du rocher de Tombelaine : marche à travers les sables, la tangue et les cours d’eau de la baie, ou traversée de la baie depuis le Bec d’Andaine jusqu’au Mont-Saint-Michel. Dîner et nuit en auberge de jeunesse.",
      },
      {
        day: "Jour 3",
        title: "Saint-Malo et la côte d’Émeraude - Voyage retour",
        text: "Route pour Saint-Malo et visite du Grand Aquarium, où 600 espèces différentes vous attendent. Participation à un atelier didactique au choix : « corail mon trésor », « mer fragile chaud devant » ou « les mystères de la mer ». Déjeuner pique-nique. Activité au choix avec un guide naturaliste : pêche à pied, découverte des algues, artiste sensible à la nature ou randonnée découverte des paysages du littoral. Retour à votre établissement en soirée.",
      },
    ],
    visitBudget: "Environ 53€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "Espace découverte de l’usine marémotrice EDF de la Rance, activités à la Maison de la Baie : ramassage de déchets, projet Baie Propre, découverte des AOP de la baie, éducation à la mer et au vent.",
  },

  {
    id: "memoires-seconde-guerre-normandie",
    title: "Mémoires de la Seconde Guerre",
    destination: "Caen, Arromanches, plages du Débarquement",
    country: "France",
    region: "Normandie",
    language: "Histoire et mémoire",
    duration: "3 jours / 2 nuits",
    level: "Collège et Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "À partir de 213€",
    image: "https://images.unsplash.com/photo-1590579491624-f98f36d4c763?auto=format&fit=crop&w=1200&q=80",
    badge: "",
    featured: false,
    theme: "Mémoire",
    description:
      "C’est en Normandie que débuta la plus grande bataille de la Seconde Guerre mondiale. Véritable musée à ciel ouvert, la région conserve encore aujourd’hui de nombreux vestiges du Débarquement : batteries, port artificiel, cimetières militaires et sites commémoratifs.",
    objectives: [
      "Comprendre la Seconde Guerre mondiale : ses enjeux et ses conséquences.",
      "Revivre le Débarquement : plages, musées et vestiges de Normandie.",
      "Transmettre la mémoire : lieux de souvenir, paix et liberté.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Caen",
        text: "Visite guidée du Mémorial de Caen sur le thème « Seconde Guerre Mondiale » ou « Guerre Froide » et temps libre dans l’autre espace selon les créneaux disponibles. Déjeuner libre. Suite de la visite et temps libre dans le parc international du Mémorial. Dîner et nuit.",
      },
      {
        day: "Jour 2",
        title: "Arromanches - Les plages du Débarquement",
        text: "Route pour Arromanches et visite du musée circulaire 360° avec le film « Les 100 jours de Normandie », puis visite audioguidée du musée du Débarquement. Temps libre sur la plage et vue panoramique sur le port artificiel d’Arromanches. Déjeuner pique-nique. Visite guidée des plages du Débarquement : la Pointe du Hoc, le cimetière allemand de La Cambe, puis visite du cimetière américain de Colleville-sur-Mer qui surplombe Omaha Beach. Dîner et nuit.",
      },
      {
        day: "Jour 3",
        title: "Longues-sur-Mer - Courseulles-sur-Mer - Voyage retour",
        text: "Visite libre de la Batterie de Longues-sur-Mer ou, en option, activité char à voile. Déjeuner pique-nique. Visite guidée du centre Juno Beach : « Explore Juno en classe » avec des tablettes et visite guidée des bunkers du parc Juno et de la plage. Départ de Caen en autocar et retour en soirée.",
      },
    ],
    visitBudget: "Environ 34€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "Musée Airborne à Sainte-Mère-Église, Overlord Museum à Colleville-sur-Mer, Mémorial de Falaise, visite guidée du Mémorial Pegasus.",
  },

  {
    id: "peintres-ecrivains-normandie",
    title: "Peintres et écrivains de Normandie",
    destination: "Rouen, Étretat, Honfleur, Giverny",
    country: "France",
    region: "Normandie",
    language: "Arts et littérature",
    duration: "3 jours / 2 nuits",
    level: "Collège et Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "À partir de 211€",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    badge: "",
    featured: false,
    theme: "Arts et littérature",
    description:
      "Plongez dans l’univers des grands écrivains et peintres normands en découvrant les paysages, cités et rivages qui ont nourri leur inspiration. De la littérature aux chefs-d’œuvre picturaux, redécouvrez une région qui a marqué durablement l’histoire artistique et culturelle.",
    objectives: [
      "Relier œuvres littéraires et artistiques à leurs lieux d’inspiration.",
      "Découvrir les grands auteurs et artistes normands dans leur contexte.",
      "Enrichir la culture littéraire et artistique par l’observation de sites et d’œuvres.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Rouen",
        text: "Départ de votre établissement le matin ou la veille, selon votre académie, en direction de Rouen. Visite guidée de Rouen sur le thème « Hommes célèbres » ou « Rouen dans l’œuvre de Flaubert ». Déjeuner libre. Visite libre du musée des beaux-arts. Route vers Petit-Couronne et visite guidée du musée Pierre Corneille. Dîner et nuit.",
      },
      {
        day: "Jour 2",
        title: "Grainville-Ymauville - Fécamp - Étretat - Trouville-sur-Mer - Honfleur",
        text: "Visite guidée « Sur les traces de Maupassant » à la découverte des lieux ayant inspiré l’écrivain, notamment pour son roman Une Vie, avec des étapes à Grainville-Ymauville, Fécamp et Étretat, ou participation à un jeu de piste guidé sur le thème d’Arsène Lupin. Déjeuner pique-nique. L’après-midi, route vers Trouville-sur-Mer pour une visite guidée de la station balnéaire, à travers les artistes, peintres et écrivains qui l’ont marquée. Poursuite par la visite guidée du musée Eugène Boudin à Honfleur. Dîner et nuit.",
      },
      {
        day: "Jour 3",
        title: "Rives-en-Seine - Giverny - Voyage retour",
        text: "Route pour Rives-en-Seine et visite guidée du musée Victor Hugo. Déjeuner pique-nique. Route vers Giverny et visite libre de la maison de Claude Monet et des jardins. Retour à votre établissement en soirée ou le lendemain, selon votre académie.",
      },
    ],
    visitBudget: "Environ 27€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "Clos Lupin, Maisons Satie, Musée Flaubert et d’Histoire de la Médecine, rallye Arsène Lupin en autonomie, visite guidée sensorielle de Rives-en-Seine, Musée des Impressionnismes Giverny.",
  },
  {
    id: "biodiversite-ile-oleron",
    title: "Biodiversité sur l’île d’Oléron",
    destination: "Île d’Oléron, Rochefort, Moëze",
    country: "France",
    region: "Nouvelle-Aquitaine",
    language: "Écologie et biodiversité",
    duration: "3 jours / 2 nuits",
    level: "Collège et Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "À partir de 272€",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    badge: "",
    featured: false,
    theme: "Biodiversité",
    description:
      "Partez à la découverte de l’île d’Oléron et de sa région, un territoire d’exception offrant une incroyable diversité : plages infinies, vaste massif forestier, marais d’importance majeure et réserves naturelles préservées.",
    objectives: [
      "Découvrir les écosystèmes : marais salants, réserves naturelles et biodiversité marine.",
      "Apprendre l’écologie au quotidien : habitat durable, éco-gestes et gestion des ressources.",
      "Agir pour la nature : pêche responsable et collecte de déchets.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Île d’Oléron",
        text: "Départ le matin vers l’île d’Oléron. Visite guidée d’un marais salant avec dégustation et petit sachet de sel offert. Découverte libre de l’écomusée à travers quatre expositions sur le sel et les marais. Déjeuner libre. Puis visite guidée et atelier pédagogique à la maison éco-paysanne pour explorer l’habitat d’hier et de demain : éco-construction, éco-gestes, éco-hameaux. Route vers Rochefort, dîner et nuit en auberge de jeunesse.",
      },
      {
        day: "Jour 2",
        title: "Rochefort - Moëze",
        text: "Visite guidée de la station de lagunage de Rochefort, modèle écologique de traitement des eaux et d’observation des marais et oiseaux aquatiques. Déjeuner pique-nique. L’après-midi, atelier nature à la réserve de Moëze-Oléron pour comprendre l’importance de la mer des Pertuis. Dîner et nuit en auberge de jeunesse.",
      },
      {
        day: "Jour 3",
        title: "Île d’Oléron - Voyage retour",
        text: "Pêche à pied écologique qui sensibilise à des gestes respectueux de l’environnement, en fonction des horaires de marées. Déjeuner pique-nique. Ramassage de déchets sur une plage de l’île et activité Land-Art avec les laisses de mer. Retour à votre établissement en soirée ou le lendemain, selon votre académie.",
      },
    ],
    visitBudget: "Environ 28€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "Centre culturel du patrimoine naturel marin des Pertuis charentais, visite d’un port ostréicole ou de pêche, atelier nature fait maison, sortie forêt-dunes, balade à vélo sur l’île d’Oléron.",
  },

  {
    id: "perigord-decouvertes-sportives-culturelles",
    title: "Le Périgord : découvertes sportives et culturelles",
    destination: "Rouffignac, Lascaux, Castelnaud, Sarlat",
    country: "France",
    region: "Nouvelle-Aquitaine",
    language: "Préhistoire et patrimoine",
    duration: "3 jours / 2 nuits",
    level: "Collège et Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "À partir de 202€",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
    badge: "",
    featured: false,
    theme: "Préhistoire",
    description:
      "Du temps de la Préhistoire aux villages troglodytiques, en passant par des activités sportives et de pleine nature, vos journées en Périgord vous feront voyager au cœur des origines et à la découverte des sites grandioses de cette région.",
    objectives: [
      "Explorer la Préhistoire : découvrir l’art pariétal et les grottes ornées du Périgord.",
      "Vivre l’histoire : visiter châteaux forts, sites troglodytiques et villages médiévaux.",
      "Apprendre par l’expérience : pratiquer spéléologie, escalade et randonnées nature.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Rouffignac - Lascaux 4",
        text: "Départ de votre établissement le matin. Déjeuner libre. Visite de la grotte aux cent mammouths à Rouffignac à bord d’un petit train électrique. Puis visite de Lascaux 4, Centre International de l’Art Pariétal montrant l’intégralité de la grotte de Lascaux. Dîner et nuit.",
      },
      {
        day: "Jour 2",
        title: "Activités sportives - Castelnaud-la-Chapelle - Peyzac-le-Moustier",
        text: "Matinée initiation à la spéléologie ou à l’escalade. Déjeuner pique-nique. Visite guidée du château fort de Castelnaud et tir au trébuchet. Puis visite guidée du site troglodytique de La Roque Saint-Christophe. Dîner et nuit.",
      },
      {
        day: "Jour 3",
        title: "La Roque-Gageac - Voyage retour",
        text: "Randonnée guidée à La Roque-Gageac, un des plus beaux villages de France : découverte du village et balade en forêt, avec explications sur la truffe, les champignons et les clés de détermination avec les traces laissées par les animaux. Déjeuner pique-nique. Temps libre dans la cité médiévale de Sarlat, capitale du Périgord Noir, avec ses ruelles tortueuses, ses passages voûtés, sa cathédrale et ses hôtels particuliers des XVe et XVIe siècles. Retour à votre établissement en soirée.",
      },
    ],
    visitBudget: "Environ 74€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "Croisière en gabarre, Musée national de la Préhistoire, Lascaux II, village du Thot, activité accrobranche, village d’artisans du Bournat.",
  },

  {
    id: "decouverte-marseille",
    title: "À la découverte de Marseille",
    destination: "Marseille, Calanques, Îles du Frioul",
    country: "France",
    region: "Provence-Alpes-Côte d’Azur",
    language: "Patrimoine et Méditerranée",
    duration: "3 jours / 2 nuits",
    level: "Collège et Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "À partir de 315€",
    image: "https://images.unsplash.com/photo-1587991549018-32ecc11e063e?auto=format&fit=crop&w=1200&q=80",
    badge: "",
    featured: false,
    theme: "Méditerranée",
    description:
      "Ville d’art et d’histoire, la cité phocéenne regorge de trésors à découvrir. De sa basilique emblématique qui domine la ville aux paysages spectaculaires de ses calanques côté mer, Marseille dévoile un patrimoine unique mêlant culture, spiritualité et nature.",
    objectives: [
      "Découvrir Marseille : basilique, abbaye, fortifications et vieux quartiers.",
      "Explorer la nature méditerranéenne : randonnée dans les calanques et découverte du Frioul.",
      "Relier culture et civilisation : visite du MUCEM ou de la grotte Cosquer.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Marseille",
        text: "Départ en autocar le matin ou la veille, selon votre académie. Mise à disposition d’un autocar pour la durée du séjour. Déjeuner libre. Montée à pied au panorama Notre-Dame de la Garde, puis descente à pied en passant par l’abbaye Saint-Victor et par le fort Saint-Nicolas. Promenade au Vieux-Port. Dîner et nuit.",
      },
      {
        day: "Jour 2",
        title: "Calanques - Îles du Frioul",
        text: "Sortie nature à pied dans les calanques où votre guide professionnel de la randonnée vous parlera de la végétation, du climat méditerranéen et des paysages de Cézanne. Déjeuner pique-nique. Traversée en bateau au château d’If et aux îles du Frioul, archipel de calcaire dressé au sein du parc national des calanques de Marseille. Visite du château d’If, ancienne prison construite sous François Ier. Dîner et nuit.",
      },
      {
        day: "Jour 3",
        title: "Marseille - Voyage retour",
        text: "Visite libre du MUCEM, Musée de la Civilisation de l’Europe et de la Méditerranée, ou visite de la grotte Cosquer en supplément. Déjeuner pique-nique. Visite guidée du Vieux-Panier, quartier typique bâti sur la butte des Moulins à l’emplacement de l’ancienne Massalia, dernier vestige du Vieux Marseille. Départ en autocar et retour en soirée ou le lendemain, selon votre académie.",
      },
    ],
    visitBudget: "Environ 40€ par personne. À ajouter au prix du voyage.",
    possibleVisits: "Nous consulter.",
  },

  {
    id: "provence-romaine",
    title: "La Provence romaine",
    destination: "Pont du Gard, Nîmes, Arles, Orange",
    country: "France",
    region: "Provence-Alpes-Côte d’Azur",
    language: "Antiquité romaine",
    duration: "3 jours / 2 nuits",
    level: "Collège et Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "À partir de 290€",
    image: "https://images.unsplash.com/photo-1569749408585-7f0c0e2fcb62?auto=format&fit=crop&w=1200&q=80",
    badge: "",
    featured: false,
    theme: "Antiquité",
    description:
      "Partez à la découverte de la Provence, de son histoire riche et de ses monuments qui ont traversé les siècles. De ville en ville, explorez certains des plus beaux témoignages de l’époque romaine.",
    objectives: [
      "Comprendre la civilisation romaine : découvrir les grands sites antiques de Provence.",
      "Lire les vestiges : observer et interpréter monuments et fouilles.",
      "Relier histoire et patrimoine : saisir l’importance de leur conservation.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Pont du Gard - Nîmes",
        text: "Départ en autocar le matin ou la veille, selon votre académie. Mise à disposition d’un autocar pour la durée du séjour. Déjeuner libre au Pont du Gard, pont-aqueduc romain à trois niveaux inscrit au patrimoine mondial de l’Unesco, puis visite guidée de Nîmes : les arènes, extérieur de la Maison Carrée, la Tour Magne et sa table d’orientation. Dîner et nuit.",
      },
      {
        day: "Jour 2",
        title: "Saint-Rémy-de-Provence - Arles",
        text: "Découverte de Saint-Rémy-de-Provence : les Antiques, visite commentée des fouilles de Glanum sous réserve. Déjeuner pique-nique. Visite guidée d’Arles : le théâtre antique, les arènes, le cloître Saint-Trophime ou les thermes de Constantin. Visite libre du musée de l’Arles antique pour découvrir les collections arlésiennes depuis la Préhistoire jusqu’à la fin de l’Antiquité tardive. Dîner et nuit.",
      },
      {
        day: "Jour 3",
        title: "Orange - Vaison-la-Romaine - Voyage retour",
        text: "Route pour Orange et visites : l’arc de triomphe, le théâtre antique audioguidé et son musée. Déjeuner pique-nique. Route pour Vaison-la-Romaine : visite guidée des fouilles de Puymin ou du site de la Villasse. Départ en autocar et retour en soirée ou le lendemain, selon votre académie.",
      },
    ],
    visitBudget: "Environ 42€ par personne. À ajouter au prix du voyage.",
    possibleVisits: "Musée de la Romanité à Nîmes, ateliers ACTA à Arles.",
  },
    {
    id: "moyen-age-provence",
    title: "Le Moyen Âge en Provence",
    destination: "Avignon, Beaucaire, Tarascon, Les Baux-de-Provence",
    country: "France",
    region: "Provence-Alpes-Côte d’Azur",
    language: "Patrimoine médiéval",
    duration: "3 jours / 2 nuits",
    level: "Collège et Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "À partir de 288€",
    image: "https://images.unsplash.com/photo-1535392432937-a27c36ec07b5?auto=format&fit=crop&w=1200&q=80",
    badge: "",
    featured: false,
    theme: "Moyen Âge",
    description:
      "Séjour consacré à la découverte du patrimoine médiéval de Provence, entre villes historiques, châteaux et abbayes. Visites guidées, ateliers pédagogiques et expériences culturelles permettent une immersion complète, des cités d’Avignon et Tarascon aux Baux-de-Provence et aux Carrières des Lumières.",
    objectives: [
      "Découvrir le patrimoine médiéval : cités, abbayes, palais et châteaux de Provence.",
      "S’initier aux arts anciens : ateliers d’héraldique, enluminure, peinture ou vitrail.",
      "Relier histoire et culture : villages perchés, moulins et spectacle immersif aux Carrières de Lumières.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Avignon",
        text: "Départ en autocar le matin ou la veille, selon la distance. Mise à disposition d’un autocar pour la durée du séjour. Route pour Vaison-la-Romaine et visite guidée de la Haute-Ville, magnifique cité médiévale. Déjeuner libre. Route pour Avignon, visite guidée de la ville et visite libre du Palais des Papes. Dîner et nuit.",
      },
      {
        day: "Jour 2",
        title: "Beaucaire - Tarascon",
        text: "Route pour Beaucaire. Module au choix : « La vie de château » avec circuit dans la forteresse, initiation à l’héraldique et réalisation d’un blason ou initiation à l’enluminure et réalisation d’une lettrine enluminée ; « Dans les rues de Belcaïre » avec parcours dans le centre historique et initiation à la peinture médiévale ; ou « Une église dans la ville » avec visite-questionnaire autour de l’ancienne chapelle des moines Cordeliers et initiation au vitrail. Déjeuner pique-nique. Route pour Tarascon et visite guidée du château du Roi René, considéré comme l’un des plus beaux châteaux médiévaux de France. Visite d’un moulin à huile d’olive avec dégustation. Dîner et nuit.",
      },
      {
        day: "Jour 3",
        title: "Montmajour - Les Baux-de-Provence - Voyage retour",
        text: "Visite conférence de l’abbaye de Montmajour. Puis route pour Les Baux-de-Provence et parcours libre dans ce splendide village perché. Déjeuner pique-nique. Visite audioguidée du château. Visite libre et spectacle multimédia aux Carrières des Lumières. Départ en autocar et retour en soirée ou le lendemain, selon la distance.",
      },
    ],
    visitBudget: "Environ 51€ par personne. À ajouter au prix du voyage.",
    possibleVisits:
      "Journée au Rocher Mistral, parc historique avec spectacles et parcours immersifs.",
  },

  {
    id: "nature-ocres-provence",
    title: "Nature et ocres en Provence",
    destination: "Marais du Vigueirat, Eyragues, Alpilles, Roussillon",
    country: "France",
    region: "Provence-Alpes-Côte d’Azur",
    language: "Nature et développement durable",
    duration: "3 jours / 2 nuits",
    level: "Collège et Lycée",
    accommodation: "Centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "À partir de 337€",
    image: "https://images.unsplash.com/photo-1598351411762-08352aef7aa1?auto=format&fit=crop&w=1200&q=80",
    badge: "",
    featured: false,
    theme: "Nature",
    description:
      "Découvrez la Provence, une destination incontournable du tourisme durable. Entre espaces naturels préservés, paysages typiquement méditerranéens, biodiversité remarquable et richesse de sa faune et de sa flore, cette région offre un cadre idéal pour allier découverte, respect de l’environnement et immersion au cœur d’une nature authentique.",
    objectives: [
      "Observer les milieux naturels : faune, flore et écosystèmes des marais et des Alpilles.",
      "Comprendre le développement durable : initiation à la permaculture et à l’équilibre homme-nature.",
      "Explorer des paysages uniques : Ocres du Luberon et patrimoine géologique.",
    ],
    program: [
      {
        day: "Jour 1",
        title: "Voyage aller - Marais du Vigueirat",
        text: "Départ en autocar le matin ou la veille, selon la distance. Déjeuner libre. Visite de la réserve naturelle des Marais du Vigueirat : en calèche puis visite commentée sur le sentier de la Palunette, tour d’observation du paysage au-dessus de la bergerie et sentier ethnobotanique. Dîner et nuit en hôtel ou en auberge de jeunesse.",
      },
      {
        day: "Jour 2",
        title: "Eyragues - Parc des Alpilles",
        text: "Route vers Eyragues et visite guidée par le créateur du jardin de bambous en permaculture totalement autonome. Le thème de la visite porte sur le développement durable et la sensibilisation au monde végétal à travers un échange de questions et de réponses sur le jardin. Déjeuner pique-nique. Randonnée guidée au parc des Alpilles : randonnée éducative et ludique pour découvrir la faune et la flore dans cet espace naturel remarquable et protégé, possible d’octobre à mai. Dîner et nuit en hôtel ou en auberge de jeunesse.",
      },
      {
        day: "Jour 3",
        title: "Ocres du Luberon - Voyage retour",
        text: "Route vers Roussillon, balade libre sur le sentier des Ocres puis découverte libre du village perché. Déjeuner pique-nique. Découverte libre du Colorado provençal de Rustrel. Retour à votre établissement en soirée.",
      },
    ],
    visitBudget: "Environ 35€ par personne. À ajouter au prix du voyage.",
    possibleVisits: "Visite du parc ornithologique de Pont de Gau.",
  },
  ];