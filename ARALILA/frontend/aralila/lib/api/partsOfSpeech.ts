import api from './index';

export const partOfSpeechAPI = {
    // Get the list of parts of speech questions
    getPartsOfSpeechQuestions: async () => {
        try {
            const response = await api.get('/api/games/parts-of-speech');
            return response.data;
        } catch (error) {
            console.error('Error fetching parts of speech questions:', error);
            throw error; 
        }
    },
    
    // Submit answers for parts of speech game
    submitPartsOfSpeechAnswers: async (data: any) => {
        try {
            const response = await api.post('/api/games/parts-of-speech', data);
            return response.data;
        } catch (error) {
            console.error('Error submitting parts of speech answers:', error);
            throw error; 
        }
    },

    
};