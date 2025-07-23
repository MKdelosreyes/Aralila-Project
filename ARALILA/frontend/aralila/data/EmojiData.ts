// Mock data for demonstration - replace with your actual EMOJI_SENTENCE_DATABASE
export const EMOJI_SENTENCE_DATABASE = [
  // EASY (3 emojis each)
  {
    id: 1,
    emojis: ["👦", "🏫", "📚"],
    correctSentence: "Ang bata ay nag-aaral sa paaralan",
    hint: "Lugar ng pag-aaral at gawain ng estudyante",
    translation: "The child is studying at school",
    category: "Education",
    difficulty: "easy"
  },
  {
    id: 2,
    emojis: ["🍎", "👩‍🏫", "📖"],
    correctSentence: "Ang guro ay nagtuturo gamit ang aklat",
    hint: "Guro at libro",
    translation: "The teacher is teaching using a book",
    category: "Education",
    difficulty: "easy"
  },
  {
    id: 3,
    emojis: ["👦", "⚽", "🐶"],
    correctSentence: "Ang bata ay naglalaro ng bola kasama ang aso",
    hint: "Laro ng bata at alagang hayop",
    translation: "The child is playing ball with the dog",
    category: "Recreation",
    difficulty: "easy"
  },
  {
    id: 4,
    emojis: ["👩", "☔", "🌧️"],
    correctSentence: "Ang babae ay may payong sa ulan",
    hint: "Gamit tuwing umuulan",
    translation: "The woman has an umbrella in the rain",
    category: "Weather",
    difficulty: "easy"
  },
  {
    id: 5,
    emojis: ["👨", "🚗" , "🛣️"],
    correctSentence: "Ang lalaki ay nagmamaneho sa kalsada",
    hint: "Gamit sa paglalakbay",
    translation: "The man is driving on the road",
    category: "Transport",
    difficulty: "easy"
  },
  {
    id: 6,
    emojis: ["👵", "🍽️", "👦"],
    correctSentence: "Ang lola ay naghahain ng pagkain sa bata",
    hint: "Pagkain mula sa matanda",
    translation: "The grandmother is serving food to the child",
    category: "Family",
    difficulty: "easy"
  },
  {
    id: 7,
    emojis: [ "👧", "🛏️", "🌙"],
    correctSentence: "Ang bata ay natutulog sa gabi",
    hint: "Gawain tuwing gabi",
    translation: "The child is sleeping at night",
    category: "Routine",
    difficulty: "easy"
  },
  {
    id: 8,
    emojis: ["👨‍🍳", "🔥", "🍲"],
    correctSentence: "Ang kusinero ay nagluluto ng pagkain",
    hint: "Gawain sa kusina",
    translation: "The cook is preparing food",
    category: "Food",
    difficulty: "easy"
  },
  {
    id: 9,
    emojis: ["📱", "📞", "👩"],
    correctSentence: "Ang babae ay tumatawag sa telepono",
    hint: "Komunikasyon gamit ang device",
    translation: "The woman is making a call on the phone",
    category: "Communication",
    difficulty: "easy"
  },
  {
    id: 10,
    emojis: ["🚿", "🧼", "👦"],
    correctSentence: "Ang bata ay naliligo sa banyo",
    hint: "Kalinisang personal",
    translation: "The child is bathing in the bathroom",
    category: "Hygiene",
    difficulty: "easy"
  },

  // MEDIUM (4 emojis each)
  {
    id: 11,
    emojis: ["🛒", "👩", "🥬", "🍅"],
    correctSentence: "Namimili ng gulay at prutas ang babae sa palengke",
    hint: "Gawain sa palengke",
    translation: "The woman is buying vegetables and fruits at the market",
    category: "Errands",
    difficulty: "medium"
  },
  {
    id: 12,
    emojis: ["📆", "🎉", "🎂", "👧"],
    correctSentence: "Ipinagdiriwang ang kaarawan ng bata",
    hint: "Espesyal na araw",
    translation: "The child's birthday is being celebrated",
    category: "Celebration",
    difficulty: "medium"
  },
  {
    id: 13,
    emojis: ["🌄", "👣", "🌳", "🎒"],
    correctSentence: "Naglalakad sa kagubatan ang estudyante tuwing umaga",
    hint: "Aktibidad sa kalikasan",
    translation: "The student walks in the forest every morning",
    category: "Nature",
    difficulty: "medium"
  },
  {
    id: 14,
    emojis: ["💻", "👨", "🏠", "☕"],
    correctSentence: "Ang lalaki ay nagtatrabaho mula sa bahay habang umiinom ng kape",
    hint: "Trabaho gamit ang computer",
    translation: "The man works from home while drinking coffee",
    category: "Work",
    difficulty: "medium"
  },
  {
    id: 15,
    emojis: ["🎬", "👨‍👩‍👧", "🍿", "🛋️"],
    correctSentence: "Nanood ng sine ang pamilya habang nakaupo sa sofa",
    hint: "Pampamilyang libangan",
    translation: "The family watched a movie while sitting on the couch",
    category: "Entertainment",
    difficulty: "medium"
  },
  {
    id: 16,
    emojis: ["📖", "🕯️", "🌃", "👓"],
    correctSentence: "Nagbabasa ng libro ang lalaki sa gabi gamit ang kandila at salamin",
    hint: "Pagbabasa sa dilim",
    translation: "The man is reading a book at night using a candle and glasses",
    category: "Routine",
    difficulty: "medium"
  },
  {
    id: 17,
    emojis: ["👩‍🔬", "🔬", "🧪", "📋"],
    correctSentence: "Ang siyentipiko ay nagsusulat habang gumagawa ng eksperimento",
    hint: "Gawain sa laboratoryo",
    translation: "The scientist is writing while conducting an experiment",
    category: "Science",
    difficulty: "medium"
  },
  {
    id: 18,
    emojis: ["👷", "🏗️", "🔧", "🧱"],
    correctSentence: "Ang manggagawa ay nagkukumpuni gamit ang mga gamit sa konstruksyon",
    hint: "Pag-aayos sa gusali",
    translation: "The worker is repairing using construction tools",
    category: "Labor",
    difficulty: "medium"
  },

  // HARD (4+ emojis each)
  {
    id: 19,
    emojis: ["🌪️", "🏠", "😨", "📢", "📺"],
    correctSentence: "Nagbabala ang awtoridad sa paparating na bagyo sa telebisyon",
    hint: "Babala sa kalamidad",
    translation: "The authorities warned about the coming storm on television",
    category: "Disaster",
    difficulty: "hard"
  },
  {
    id: 20,
    emojis: ["🗳️", "👥", "🇵🇭", "📃", "🕊️"],
    correctSentence: "Ang mga mamamayan ay bumoto para sa kapayapaan at kinabukasan",
    hint: "Gawain tuwing halalan",
    translation: "Citizens voted for peace and the future",
    category: "Civic",
    difficulty: "hard"
  },
  {
    id: 21,
    emojis: ["🚑", "👨‍⚕️", "💉", "🧍‍♂️", "🏥"],
    correctSentence: "Nagbigay ng lunas ang doktor sa ospital para sa pasyente",
    hint: "Medikal na interbensyon",
    translation: "The doctor gave treatment in the hospital for the patient",
    category: "Health",
    difficulty: "hard"
  },
  {
    id: 22,
    emojis: ["🚀", "🌌", "👨‍🚀", "🛰️", "🌍"],
    correctSentence: "Naglakbay sa kalawakan ang astronaut upang pag-aralan ang mundo",
    hint: "Paglalakbay at pananaliksik sa kalawakan",
    translation: "The astronaut traveled through space to study the Earth",
    category: "Space",
    difficulty: "hard"
  },
  {
    id: 23,
    emojis: ["🏛️", "⚖️", "👨‍⚖️", "📜", "🔍"],
    correctSentence: "Ang hukom ay nagdesisyon base sa ebidensyang sinuri",
    hint: "Usaping legal sa korte",
    translation: "The judge made a decision based on the examined evidence",
    category: "Law",
    difficulty: "hard"
  },
  {
    id: 24,
    emojis: ["📉", "💼", "👔", "📊", "🧠"],
    correctSentence: "Ang negosyante ay nag-analisa ng pagbagsak ng merkado gamit ang talino",
    hint: "Ekonomiyang paksa",
    translation: "The businessman analyzed the market crash using intellect",
    category: "Business",
    difficulty: "hard"
  }
];