import api from './index';

export const emojiSentenceAPI = {
  checkAnswer: async (answer:any, emojis:any) => {
    const response = await api.post("api/games/sentence-construction/emoji-evaluate/", {
      answer: answer,
      emojis: emojis
    });
    return response.data;
  }, 
};