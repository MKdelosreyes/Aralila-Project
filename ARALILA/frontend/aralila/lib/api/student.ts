import api from './index';

export const studentAPI = {
  getAllStudents: async () => {
    const response = await api.get('/api/students/');
    return response.data;
  },

  createStudent: async (studentData: any) => {
    const response = await api.post('/api/students/', studentData);
    return response.data;
  }
  // ... more student-related calls
};