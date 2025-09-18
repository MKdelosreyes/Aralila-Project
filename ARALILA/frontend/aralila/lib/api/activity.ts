import api from './index';

export const activityAPI = {
  // Get the list of activities for a specific classroom
  getClassroomActivities: async (classroomId: number) => {
    try {
      const response = await api.get(`/api/classroom/${classroomId}/activities/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching classroom activities:', error);
      throw error; 
    }
  },

  // Create a new activity for a specific classroom
  createClassroomActivity: async (classroomId: number, data: any) => {
    try {
      const response = await api.post(`/api/classroom/${classroomId}/activities/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating classroom activity:', error);
      throw error; 
    }
  },
};