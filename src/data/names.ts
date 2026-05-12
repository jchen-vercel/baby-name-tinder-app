export interface BabyName {
  name: string;
  gender: "boy" | "girl" | "neutral";
  origin: string;
  meaning: string;
}

export const babyNames: BabyName[] = [
  { name: "Luna", gender: "girl", origin: "Latin", meaning: "Moon" },
  { name: "Oliver", gender: "boy", origin: "Latin", meaning: "Olive tree" },
  { name: "Aria", gender: "girl", origin: "Italian", meaning: "Air; melody" },
  { name: "Liam", gender: "boy", origin: "Irish", meaning: "Strong-willed warrior" },
  { name: "Sage", gender: "neutral", origin: "Latin", meaning: "Wise one" },
  { name: "Amara", gender: "girl", origin: "Igbo", meaning: "Grace; eternal" },
  { name: "Felix", gender: "boy", origin: "Latin", meaning: "Happy; fortunate" },
  { name: "Rowan", gender: "neutral", origin: "Gaelic", meaning: "Little red-haired one" },
  { name: "Isla", gender: "girl", origin: "Scottish", meaning: "Island" },
  { name: "Jasper", gender: "boy", origin: "Persian", meaning: "Bringer of treasure" },
  { name: "Wren", gender: "neutral", origin: "English", meaning: "Small bird" },
  { name: "Elara", gender: "girl", origin: "Greek", meaning: "Bright; shining" },
  { name: "Theo", gender: "boy", origin: "Greek", meaning: "Gift of God" },
  { name: "Nova", gender: "girl", origin: "Latin", meaning: "New" },
  { name: "Kai", gender: "neutral", origin: "Hawaiian", meaning: "Sea" },
  { name: "Sienna", gender: "girl", origin: "Italian", meaning: "Reddish-brown" },
  { name: "Ezra", gender: "boy", origin: "Hebrew", meaning: "Helper" },
  { name: "Ivy", gender: "girl", origin: "English", meaning: "Faithfulness" },
  { name: "Atlas", gender: "boy", origin: "Greek", meaning: "Bearer of the heavens" },
  { name: "Willow", gender: "neutral", origin: "English", meaning: "Graceful; slender" },
];
