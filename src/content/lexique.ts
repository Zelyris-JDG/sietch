/**
 * Lexique vivant — définitions courtes, écrites pour ce site (aucune copie de wiki ni de résumé officiel).
 * Les termes sont ceux de l'univers de Dune ; les textes sont les nôtres.
 */
export type Term = { id: string; word: string; def: string; group: "lieux" | "peuples" | "objets" | "pouvoirs" | "histoire" };

export const TERMS: Term[] = [
  { id: "arrakis", word: "Arrakis", group: "lieux", def: "Troisième planète de l'étoile Canopus, surnommée Dune. Un désert d'un pôle à l'autre, et la seule source d'épice de l'univers connu." },
  { id: "sietch", word: "Sietch", group: "lieux", def: "Chez les Fremen, une communauté installée dans une caverne fortifiée du désert : un refuge, un lieu d'assemblée, une famille élargie." },
  { id: "arrakeen", word: "Arrakeen", group: "lieux", def: "Première ville d'Arrakis, au pied du Mur du Bouclier ; siège du gouvernement planétaire et de l'astroport." },
  { id: "carthag", word: "Carthag", group: "lieux", def: "Ville bâtie par les Harkonnen au nord d'Arrakeen pendant leur mandat sur Arrakis : industrielle, brutale, sans grâce." },
  { id: "mur-du-bouclier", word: "Mur du Bouclier", group: "lieux", def: "Chaîne de montagnes qui protège Arrakeen et les terres habitées du nord des grandes tempêtes du désert profond." },
  { id: "sietch-tabr", word: "Sietch Tabr", group: "lieux", def: "Le sietch le plus connu des récits : communauté du nord du désert et point de départ de la révolte fremen." },
  { id: "desert-profond", word: "Désert profond", group: "lieux", def: "Les étendues au sud du Mur du Bouclier, hors de portée des cartes officielles : territoire des grandes tempêtes, des vers et des Fremen." },
  { id: "caladan", word: "Caladan", group: "lieux", def: "Planète d'océans et de pluie, fief des Atréides depuis vingt-six générations avant leur départ pour Arrakis." },
  { id: "fremen", word: "Fremen", group: "peuples", def: "Le peuple libre du désert d'Arrakis. Descendants d'exilés, ils vivent dans les sietchs, récupèrent chaque goutte d'eau et chevauchent les vers." },
  { id: "atreides", word: "Atréides", group: "peuples", def: "Maison du duc Leto, venue de la planète océane Caladan. Loyauté, honneur et sens politique : des qualités qui attirent autant d'alliés que d'ennemis." },
  { id: "harkonnen", word: "Harkonnen", group: "peuples", def: "Maison de Giedi Prime, rivale héréditaire des Atréides. Richesse tirée d'Arrakis, cruauté assumée, intrigues patientes." },
  { id: "corrino", word: "Corrino", group: "peuples", def: "Maison impériale, maîtresse du trône du Lion d'Or depuis la bataille de Corrin. Son pouvoir repose sur ses légions, les Sardaukar." },
  { id: "sardaukar", word: "Sardaukar", group: "peuples", def: "Soldats d'élite de l'Empereur, formés sur une planète-prison. Pendant des siècles, aucune armée ne leur a tenu tête." },
  { id: "bene-gesserit", word: "Bene Gesserit", group: "peuples", def: "Ordre de femmes qui façonne la politique de l'Imperium dans l'ombre : maîtrise du corps et de l'esprit, la Voix, et un programme généalogique vieux de millénaires." },
  { id: "guilde", word: "Guilde spatiale", group: "peuples", def: "Le monopole du voyage interstellaire. Ses Navigateurs, saturés d'épice, voient le chemin sûr à travers l'espace replié." },
  { id: "navigateur", word: "Navigateur", group: "peuples", def: "Membre de la Guilde transformé par l'épice au point de ne plus pouvoir vivre hors d'une cuve de gaz orangé. Son don : entrevoir l'avenir assez pour guider un long-courrier." },
  { id: "mentat", word: "Mentat", group: "peuples", def: "Humain entraîné dès l'enfance à calculer, mémoriser et déduire à la place des machines pensantes, interdites. Les grandes Maisons en emploient comme conseillers." },
  { id: "fedaykin", word: "Fedaykin", group: "peuples", def: "Commandos de la mort fremen, voués à leur chef et aux coups les plus risqués." },
  { id: "landsraad", word: "Landsraad", group: "peuples", def: "L'assemblée des grandes Maisons de l'Imperium, seule force capable de s'opposer collectivement à l'Empereur." },
  { id: "chom", word: "CHOM", group: "peuples", def: "La compagnie commerciale qui contrôle les échanges de l'Imperium. Ses parts sont la vraie mesure du pouvoir d'une Maison." },
  { id: "honorees-matriarches", word: "Honorées Matriarches", group: "peuples", def: "Venues de la Dispersion, des femmes qui font du Bene Gesserit un adversaire : les mêmes talents, aucune retenue." },
  { id: "epice", word: "Épice", group: "objets", def: "Le mélange : une substance née du cycle des vers des sables, qui prolonge la vie, aiguise la conscience et rend possible la navigation entre les étoiles. Sa saveur rappelle la cannelle." },
  { id: "ver", word: "Ver des sables", group: "objets", def: "Shai-Hulud pour les Fremen : une créature colossale du désert profond, attirée par tout rythme régulier à la surface. Elle est au cœur du cycle qui produit l'épice. Ici, on ne la montre jamais." },
  { id: "truite-des-sables", word: "Truite des sables", group: "objets", def: "Petite créature du désert, première forme du cycle de vie du ver ; elle piège l'eau et peut transformer une planète entière en désert." },
  { id: "distille", word: "Distille", group: "objets", def: "Combinaison de survie fremen qui récupère la transpiration et les autres pertes d'eau du corps pour les filtrer et les rendre buvables. Bien réglée, elle ne laisse perdre qu'un dé à coudre par jour." },
  { id: "marteleur", word: "Marteleur", group: "objets", def: "Pieu enfoncé dans le sable, muni d'un mécanisme qui frappe en cadence : son battement régulier appelle un ver." },
  { id: "long-courrier", word: "Long-courrier", group: "objets", def: "Vaisseau géant de la Guilde spatiale, le seul capable de replier l'espace. Il ne se pose jamais : les vaisseaux des Maisons embarquent dans sa soute pour passer d'un système à l'autre." },
  { id: "ornithoptere", word: "Ornithoptère", group: "objets", def: "Appareil volant à ailes battantes, le véhicule le plus courant sur Arrakis. On le nomme ici ; on ne le dessine pas." },
  { id: "crochets", word: "Crochets de Fabricant", group: "objets", def: "Outils à bout recourbé qui soulèvent les anneaux d'un ver pour le diriger : le secret des chevaucheurs fremen." },
  { id: "coriolis", word: "Tempête de Coriolis", group: "objets", def: "Vent de sable des hautes latitudes d'Arrakis, capable d'atteindre plusieurs centaines de kilomètres à l'heure et de dépouiller un homme jusqu'à l'os." },
  { id: "kwisatz-haderach", word: "Kwisatz Haderach", group: "pouvoirs", def: "« Le raccourci » : l'être que le Bene Gesserit cherche à produire par sélection, capable de regarder là où les Révérendes Mères ne peuvent pas, et de relier passé et futur." },
  { id: "prescience", word: "Prescience", group: "pouvoirs", def: "Faculté de percevoir des futurs possibles. L'épice l'éveille ; les Navigateurs et le Kwisatz Haderach la poussent plus loin que quiconque." },
  { id: "ibad", word: "Yeux de l'Ibad", group: "pouvoirs", def: "Le bleu dans le bleu que prend le regard de qui vit saturé d'épice : la marque des Fremen." },
  { id: "holtzman", word: "Effet Holtzman", group: "pouvoirs", def: "La découverte à l'origine des boucliers, des suspenseurs et du repli de l'espace. Un bouclier arrête ce qui va vite et laisse passer ce qui va lentement : d'où le retour du combat au couteau." },
  { id: "lisan-al-gaib", word: "Lisan al-Gaib", group: "pouvoirs", def: "« La voix d'ailleurs » : figure messianique attendue par les Fremen, prophétie semée des siècles plus tôt par les missionnaires du Bene Gesserit." },
  { id: "muaddib", word: "Muad'Dib", group: "pouvoirs", def: "Nom fremen de la souris-kangourou du désert, et nom de guerre choisi par un jeune duc exilé." },
  { id: "imperium", word: "Imperium", group: "histoire", def: "L'ensemble des mondes connus, gouvernés par l'Empereur Padishah avec, en contrepoids, le Landsraad, la Guilde et le Bene Gesserit." },
  { id: "jihad-butlerien", word: "Jihad butlérien", group: "histoire", def: "Guerre menée des millénaires avant Dune contre les machines pensantes. Depuis, toute machine qui imite l'esprit humain est interdite : les Mentats, la Guilde et le Bene Gesserit sont nés de ce vide." },
  { id: "tyran", word: "Le Tyran", group: "histoire", def: "Leto II, l'Empereur-Dieu : il régna trois mille cinq cents ans en se fondant avec la truite des sables, pour imposer à l'humanité la paix forcée de son Sentier d'Or." },
  { id: "dispersion", word: "Dispersion", group: "histoire", def: "L'exode de l'humanité vers l'inconnu après la mort du Tyran. Ce qui en revient, des siècles plus tard, bouleverse l'ancien Imperium." },
  { id: "maison-des-meres", word: "Maison des Mères", group: "histoire", def: "La planète secrète du Bene Gesserit, dernier bastion de l'ordre dans le sixième roman, qui porte son nom en français." },
];

export const TERM_BY_ID: Record<string, Term> = Object.fromEntries(TERMS.map((t) => [t.id, t]));

export const TERM_GROUPS: { id: Term["group"]; label: string }[] = [
  { id: "lieux", label: "Lieux" },
  { id: "peuples", label: "Peuples, Maisons et ordres" },
  { id: "objets", label: "Objets et créatures" },
  { id: "pouvoirs", label: "Pouvoirs et prophéties" },
  { id: "histoire", label: "Histoire" },
];
