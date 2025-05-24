import api from './index';

export const classroomAPI = {
  // GET /api/classrooms/ - calls your Django get_classrooms view
  getAllClassrooms: async () => {
    const response = await api.get('/api/classrooms/');
    return response.data;
  },

  // POST /api/classrooms/ - calls your Django create_classroom view
  createClassroom: async (classroomData: any) => {
    const response = await api.post('/api/classroom/create/', classroomData);
    return response.data;
  },

  // GET /api/classrooms/{id}/ - calls your Django get_classroom_detail view
  getClassroomById: async (id: number) => {
    const response = await api.get(`/api/classroom/${id}/`);
    return response.data;
  },

  // GET /api/classrooms/{id}/ - calls your Django get_classroom_detail view
  getClassroomStudentList: async (id: number) => {
    const response = await api.get(`/api/classroom/${id}/students/`);
    return response.data;
  },

  // // PUT /api/classrooms/{id}/ - calls your Django update_classroom view
  // updateClassroom: async (id: string, classroomData: any) => {
  //   const response = await api.put(`/api/classrooms/${id}/`, classroomData);
  //   return response.data;
  // },

  // // DELETE /api/classrooms/{id}/ - calls your Django delete_classroom view
  // deleteClassroom: async (id: string) => {
  //   const response = await api.delete(`/api/classrooms/${id}/`);
  //   return response.data;
  // }
};