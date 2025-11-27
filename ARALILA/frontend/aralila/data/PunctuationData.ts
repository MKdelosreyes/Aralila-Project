// Mga pangungusap sa laro na may tamang posisyon ng bantas
export const sentences = {
  easy: [
    {
      text: "Kamusta kumusta ka ngayon",
      positions: [7, 23], // after "Kamusta" and at end
      punctuation: [",", "?"],
      solution: "Kamusta, kumusta ka ngayon?"
    },
    {
      text: "Mahilig ako sa pizza sorbetes at cookies",
      positions: [18, 28, 40], // after "pizza", "sorbetes", and at end
      punctuation: [",", ",", "."],
      solution: "Mahilig ako sa pizza, sorbetes, at cookies."
    },
    {
      text: "Kay gandang araw nito",
      positions: [21], // at end
      punctuation: ["!"],
      solution: "Kay gandang araw nito!"
    },
    {
      text: "Paborito kong kulay ay pula asul at berde",
      positions: [29, 34, 44], // after "pula", "asul", and at end
      punctuation: [",", ",", "."],
      solution: "Paborito kong kulay ay pula, asul, at berde."
    },
     {
    text: "Ako si Ana estudyante ako dito",
    positions: [9, 31], // after "Ana", and at end
    punctuation: [",", "."],
    solution: "Ako si Ana, estudyante ako dito."
  },
  {
    text: "Magandang umaga kuya at ate",
    positions: [16, 25, 31], // after "umaga", "kuya", and end
    punctuation: [",", ",", "."],
    solution: "Magandang umaga, kuya, at ate."
  },
  {
    text: "Nasaan ka",
    positions: [9], // at end
    punctuation: ["?"],
    solution: "Nasaan ka?"
  }
  ],
  medium: [
    {
      text: "Sabi ni John Ako ay darating agad",
      positions: [10, 12, 33], // after "John", before "Ako", and at end
      punctuation: [",", '"', '."'],
      solution: 'Sabi ni John, "Ako ay darating agad."'
    },
    {
      text: "Bumisita kami sa Paris France at Rome Italy",
      positions: [21, 29, 42], // after "Paris", "and", and at end
      punctuation: [",", ",", "."],
      solution: "Bumisita kami sa Paris, France, at Rome, Italy."
    },
    {
      text: "Ang libro na kawili wili ay maraming pahina",
      positions: [10, 31, 48], // around clause and at end
      punctuation: [",", ",", "."],
      solution: "Ang libro, na kawili-wili, ay maraming pahina."
    },
    {
    text: "Sinabi niya Gusto kong sumama",
    positions: [12, 14, 30],
    punctuation: [",", '"', '."'],
    solution: 'Sinabi niya, "Gusto kong sumama."'
  },
  {
    text: "Bumili kami ng bigas gulay at prutas",
    positions: [20, 26, 36],
    punctuation: [",", ",", "."],
    solution: "Bumili kami ng bigas, gulay, at prutas."
  },
  {
    text: "Ang aso na laging tahol ay nakatakas",
    positions: [8, 24, 37],
    punctuation: [",", ",", "."],
    solution: "Ang aso, na laging tahol, ay nakatakas."
  }
  ],
  hard: [
    {
      text: "Pagkatapos ng pulong gayunman nagpasya kaming umalis",
      positions: [22, 32, 52], // after "pulong", "gayunman", and at end
      punctuation: [",", ",", "."],
      solution: "Pagkatapos ng pulong, gayunman, nagpasya kaming umalis."
    },
    {
      text: "Mahal na Ginoong Smith Sana ay nasa mabuti kang kalagayan",
      positions: [22, 54], // after "Smith" and at end
      punctuation: [",", "."],
      solution: "Mahal na Ginoong Smith, Sana ay nasa mabuti kang kalagayan."
    },
    {
      text: "Ang mga kailangan ay lapis panulat at papel",
      positions: [21, 27, 35, 45], // after "ay", "lapis", "panulat", and at end
      punctuation: [":", ",", ",", "."],
      solution: "Ang mga kailangan ay: lapis, panulat, at papel."
    },
    {
    text: "Pagkatapos ng klase gayunpaman umalis kami agad",
    positions: [20, 32, 48],
    punctuation: [",", ",", "."],
    solution: "Pagkatapos ng klase, gayunpaman, umalis kami agad."
  },
  {
    text: "Ginoo Santos Umaasa po kami sa inyong tugon",
    positions: [13, 40],
    punctuation: [",", "."],
    solution: "Ginoo Santos, Umaasa po kami sa inyong tugon."
  },
  {
    text: "Ang kailangan ko ay papel lapis at pambura",
    positions: [21, 27, 35, 45],
    punctuation: [":", ",", ",", "."],
    solution: "Ang kailangan ko ay: papel, lapis, at pambura."
  }
  ]
};
