// export const grammarAccuracyQuestions = [
  // {
  //   id: 1,
  //   sentence: "Ang mga bata ay naglalaro sa hardin kahapon.",
  //   errors: [
  //     {
  //       word: "naglalaro",
  //       errorType: "Verb Tense",
  //       explanation: "Dapat gamitin ang 'naglaro' para sa nakaraang pangyayari (past tense).",
  //       correct: "naglaro"
  //     }
  //   ],
  //   category: "Verb Usage",
  //   difficulty: "Easy"
  // },
  // {
  //   id: 2,
  //   sentence: "Si Maria at ako ay pumunta sa palengke, at bumili ng gulay.",
  //   errors: [
  //     {
  //       word: ",",
  //       errorType: "Punctuation",
  //       explanation: "Hindi kailangan ng kuwit bago ang 'at' sa compound sentence.",
  //       correct: ""
  //     }
  //   ],
  //   category: "Punctuation",
  //   difficulty: "Easy"
  // },
  // {
  //   id: 3,
  //   sentence: "Ang mga estudyante ay nag-aaral ng mabuti para sa kanilang pagsusulit.",
  //   errors: [
  //     {
  //       word: "ng",
  //       errorType: "Particle Usage",
  //       explanation: "Dapat gamitin ang 'nang' para sa paraan o intensidad.",
  //       correct: "nang"
  //     }
  //   ],
  //   category: "Particles",
  //   difficulty: "Medium"
  // },
  // {
  //   id: 4,
  //   sentence: "Ang aming mga guro ay nagtuturo ng mahusay sa aming paaralan.",
  //   errors: [
  //     {
  //       word: "ng",
  //       errorType: "Particle Usage",
  //       explanation: "Dapat gamitin ang 'nang' para sa paraan kung paano nagtuturo.",
  //       correct: "nang"
  //     }
  //   ],
  //   category: "Particles",
  //   difficulty: "Medium"
  // },
  // {
  //   id: 5,
  //   sentence: "Sila ay kumakain sa kusina habang nanonood ng telebisyon.",
  //   errors: [],
  //   category: "No Errors",
  //   difficulty: "Easy"
  // },
  // {
  //   id: 6,
  //   sentence: "Ang mga libro na nasa mesa ay kay Pedro at Maria.",
  //   errors: [
  //     {
  //       word: "kay",
  //       errorType: "Possessive Marker",
  //       explanation: "Dapat gamitin ang 'nina' para sa dalawa o higit pang tao.",
  //       correct: "nina"
  //     }
  //   ],
  //   category: "Possessive Markers",
  //   difficulty: "Hard"
  // },
  // {
  //   id: 7,
  //   sentence: "Kumain na ako ng agahan bago pumasok sa paaralan.",
  //   errors: [],
  //   category: "No Errors",
  //   difficulty: "Medium"
  // },
  // {
  //   id: 8,
  //   sentence: "Ang mga bulaklak sa hardin ay nagiging maganda dahil sa ulan.",
  //   errors: [
  //     {
  //       word: "nagiging",
  //       errorType: "Verb Usage",
  //       explanation: "Dapat gamitin ang 'naging' para sa nakaraang pangyayari na may resulta sa kasalukuyan.",
  //       correct: "naging"
  //     }
  //   ],
  //   category: "Verb Usage",
  //   difficulty: "Hard"
  // },
  // {
  //   id: 9,
  //   sentence: "Pupunta kami sa tindahan mamaya ng hapon.",
  //   errors: [
  //     {
  //       word: "ng",
  //       errorType: "Particle Usage",
  //       explanation: "Dapat gamitin ang 'nang' para sa oras.",
  //       correct: "nang"
  //     }
  //   ],
  //   category: "Particles",
  //   difficulty: "Easy"
  // },
  // {
  //   id: 10,
  //   sentence: "Nakita ko ang mga kaibigan ko sa paaralan.",
  //   errors: [],
  //   category: "No Errors",
  //   difficulty: "Easy"
  // },
  // {
  //   id: 11,
  //   sentence: "Siya ay magaling manamit ng kanyang paboritong damit.",
  //   errors: [
  //     {
  //       word: "ng",
  //       errorType: "Particle Usage",
  //       explanation: "Dapat gamitin ang 'nang' bago ang pandiwa ('manamit').",
  //       correct: "nang"
  //     }
  //   ],
  //   category: "Particles",
  //   difficulty: "Medium"
  // },
  // {
  //   id: 12,
  //   sentence: "Ang bahay na iyon ay mas malaki sa aming bahay.",
  //   errors: [
  //     {
  //       word: "sa",
  //       errorType: "Preposition Usage",
  //       explanation: "Dapat gamitin ang 'kaysa' para sa paghahambing (comparison).",
  //       correct: "kaysa"
  //     }
  //   ],
  //   category: "Prepositions",
  //   difficulty: "Hard"
  // },
  // {
  //   id: 13,
  //   sentence: "Kailangan natin ng kumain ng gulay para lumakas.",
  //   errors: [
  //     {
  //       word: "ng",
  //       errorType: "Particle Usage",
  //       explanation: "Dapat gamitin ang 'na' bago ang pandiwa na nagsisimula sa katinig ('kumain').",
  //       correct: "na"
  //     }
  //   ],
  //   category: "Particles",
  //   difficulty: "Medium"
  // },
  // {
  //   id: 14,
  //   sentence: "Maraming tao ang pumunta sa pista kahapon.",
  //   errors: [],
  //   category: "No Errors",
  //   difficulty: "Easy"
  // },
  // {
  //   id: 15,
  //   sentence: "Ang mga bata ay matatalino at masipag mag-aral.",
  //   errors: [],
  //   category: "No Errors",
  //   difficulty: "Medium"
  // },
  // {
  //   id: 16,
  //   sentence: "Kumain ako ng mansanas, at uminom ng tubig.",
  //   errors: [
  //     {
  //       word: ",",
  //       errorType: "Punctuation",
  //       explanation: "Hindi kailangan ng kuwit bago ang 'at' sa compound sentence.",
  //       correct: ""
  //     }
  //   ],
  //   category: "Punctuation",
  //   difficulty: "Easy"
  // },
  // {
  //   id: 17,
  //   sentence: "Umalis na siya kahapon papunta sa palengke.",
  //   errors: [],
  //   category: "No Errors",
  //   difficulty: "Easy"
  // },
  // {
  //   id: 18,
  //   sentence: "Nag-aaral siya ng mabuti kaya’t mataas ang kanyang grado.",
  //   errors: [
  //     {
  //       word: "ng",
  //       errorType: "Particle Usage",
  //       explanation: "Dapat gamitin ang 'nang' para ipakita ang paraan kung paano siya nag-aaral.",
  //       correct: "nang"
  //     }
  //   ],
  //   category: "Particles",
  //   difficulty: "Medium"
  // },
  // {
  //   id: 19,
  //   sentence: "Ang guro estudyante at prinsipal ay nasa silid-aralan.",
  //   errors: [
  //     {
  //       word: "estudyante",
  //       errorType: "Punctuation",
  //       explanation: "Kailangang gumamit ng kuwit upang paghiwalayin ang mga elemento sa listahan.",
  //       correct: "estudyante,"
  //     },
  //     {
  //       word: "prinsipal",
  //       errorType: "Punctuation",
  //       explanation: "Kailangang gumamit ng kuwit bago ang 'at' sa seryeng may tatlong elemento.",
  //       correct: ", at prinsipal"
  //     }
  //   ],
  //   category: "Punctuation",
  //   difficulty: "Hard"
  // }
// ];

// export const grammarAccuracyQuestions = [
//   {
//     id: 1,
//     jumbled: ["eats", "She", "apple", "an"],
//     correct: ["She", "eats", "an", "apple"],
//   },
//   {
//     id: 2,
//     jumbled: ["dog", "The", "sleeping", "is"],
//     correct: ["The", "dog", "is", "sleeping"],
//   },
//   {
//     id: 3,
//     jumbled: ["going", "to", "am", "school", "I"],
//     correct: ["I", "am", "going", "to", "school"],
//   },
//   {
//     id: 4,
//     jumbled: ["friends", "My", "playing", "are", "outside"],
//     correct: ["My", "friends", "are", "playing", "outside"],
//   },
//   {
//     id: 5,
//     jumbled: ["book", "reading", "is", "She", "a"],
//     correct: ["She", "is", "reading", "a", "book"],
//   },
//   // {
//   //   id: 6,
//   //   jumbled: ["at", "morning", "runs", "the", "He"],
//   //   correct: ["He", "runs", "at", "the", "morning"],
//   // },
//   // {
//   //   id: 7,
//   //   jumbled: ["cat", "sleeping", "the", "is", "sofa", "on", "the"],
//   //   correct: ["The", "cat", "is", "sleeping", "on", "the", "sofa"],
//   // },
//   // {
//   //   id: 8,
//   //   jumbled: ["have", "We", "lunch", "already", "eaten"],
//   //   correct: ["We", "have", "already", "eaten", "lunch"],
//   // },
//   // {
//   //   id: 9,
//   //   jumbled: ["teacher", "our", "kind", "is", "very"],
//   //   correct: ["Our", "teacher", "is", "very", "kind"],
//   // },
//   // {
//   //   id: 10,
//   //   jumbled: ["playing", "the", "piano", "She", "is"],
//   //   correct: ["She", "is", "playing", "the", "piano"],
//   // },
// ];

export const grammarAccuracyQuestions = [
  { id: 1, sentence: "She eats an apple." },
  { id: 2, sentence: "The dog is sleeping." },
  { id: 3, sentence: "I am going to school." },
  { id: 4, sentence: "My friends are playing outside." },
  { id: 5, sentence: "She is reading a book." },
];
