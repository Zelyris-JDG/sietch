/** Les Maisons et les ordres — textes originaux, emblèmes originaux (components/ui/Emblem.tsx). */
export type House = { id: string; kind: string; name: string; line: string; text: string; termId: string };

export const HOUSES: House[] = [
  { id: "atreides", kind: "Grande Maison", name: "Atréides", line: "Venus de l'eau, envoyés dans le sable.", text: "Caladan, ses océans, ses pluies : puis l'ordre impérial de reprendre Arrakis aux Harkonnen. Un duc qui croit à la loyauté, et une Maison tout entière prise dans un piège plus vieux qu'elle.", termId: "atreides" },
  { id: "harkonnen", kind: "Grande Maison", name: "Harkonnen", line: "Quatre-vingts ans à presser la planète.", text: "Giedi Prime, monde d'usines. Le mandat sur Arrakis a fait leur fortune ; le perdre est une humiliation, le reprendre une obsession. Ils comptent, ils attendent, ils frappent.", termId: "harkonnen" },
  { id: "corrino", kind: "Maison impériale", name: "Corrino", line: "Le trône, les Sardaukar, la peur.", text: "Dix mille ans sur le trône du Lion d'Or. L'Empereur Padishah arbitre les Maisons, redoute leur alliance, et garde en réserve des légions qu'aucune armée n'a battues.", termId: "corrino" },
  { id: "fremen", kind: "Peuple du désert", name: "Fremen", line: "L'eau d'un homme appartient à sa tribu.", text: "Ils vivent là où personne ne va : dans les sietchs du désert profond, sous la distille, au rythme des vers. L'Imperium les croit quelques milliers. Ils sont des millions.", termId: "fremen" },
  { id: "bene-gesserit", kind: "Ordre", name: "Bene Gesserit", line: "Dix mille ans de patience.", text: "Des femmes formées à tout contrôler : le corps, la voix, les lignées. Elles sèment des prophéties sur les mondes qu'elles visitent, au cas où l'une des leurs devrait un jour s'en servir.", termId: "bene-gesserit" },
  { id: "guilde", kind: "Monopole", name: "Guilde spatiale", line: "Aucune guerre ne se mène sans ses vaisseaux.", text: "La Guilde ne prend jamais parti ; elle fixe le prix du passage. Ses Navigateurs, baignés d'épice, replient l'espace. Sans Arrakis, l'Imperium redeviendrait un archipel de mondes isolés.", termId: "guilde" },
];
