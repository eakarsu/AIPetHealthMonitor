import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);

// Pets
export const getPets = () => api.get('/pets');
export const getPet = (id) => api.get(`/pets/${id}`);
export const createPet = (data) => api.post('/pets', data);
export const updatePet = (id, data) => api.put(`/pets/${id}`, data);
export const deletePet = (id) => api.delete(`/pets/${id}`);

// Generic CRUD for pet-related resources
const createCrudApi = (resource) => ({
  getAll: (petId, page = 1, limit = 20) => api.get(`/${resource}/pet/${petId}`, { params: { page, limit } }),
  getOne: (id) => api.get(`/${resource}/${id}`),
  create: (data) => api.post(`/${resource}`, data),
  update: (id, data) => api.put(`/${resource}/${id}`, data),
  remove: (id) => api.delete(`/${resource}/${id}`)
});

export const healthRecordsApi = createCrudApi('health-records');
export const behaviorsApi = createCrudApi('behaviors');
export const nutritionApi = createCrudApi('nutrition');
export const vaccinationsApi = createCrudApi('vaccinations');
export const medicationsApi = createCrudApi('medications');
export const appointmentsApi = createCrudApi('appointments');
export const weightApi = createCrudApi('weight');
export const activitiesApi = createCrudApi('activities');
export const symptomsApi = createCrudApi('symptoms');
export const insuranceApi = createCrudApi('insurance');
export const groomingApi = createCrudApi('grooming');
export const healthReportsApi = createCrudApi('health-reports');

// New feature CRUD APIs
export const allergiesApi = createCrudApi('allergies');
export const trainingApi = createCrudApi('training');
export const sleepApi = createCrudApi('sleep');
export const dentalApi = createCrudApi('dental');
export const parasitePreventionApi = createCrudApi('parasite-prevention');
export const travelApi = createCrudApi('travel');
export const milestonesApi = createCrudApi('milestones');
export const documentsApi = createCrudApi('documents');
export const expensesApi = createCrudApi('expenses');
export const feedingApi = createCrudApi('feeding');
export const labResultsApi = createCrudApi('lab-results');
export const socializationApi = createCrudApi('socialization');
export const suppliesApi = createCrudApi('supplies');

// Emergency Contacts (user-level, not pet-level)
export const getEmergencyContacts = () => api.get('/emergency-contacts');
export const getEmergencyContact = (id) => api.get(`/emergency-contacts/${id}`);
export const createEmergencyContact = (data) => api.post('/emergency-contacts', data);
export const updateEmergencyContact = (id, data) => api.put(`/emergency-contacts/${id}`, data);
export const deleteEmergencyContact = (id) => api.delete(`/emergency-contacts/${id}`);

// AI
export const aiSymptomCheck = (data) => api.post('/ai/symptom-check', data);
export const aiSymptomCheckPhoto = (formData) => api.post('/ai/symptom-check-photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const aiDietRecommendation = (data) => api.post('/ai/diet-recommendation', data);
export const aiBehaviorAnalysis = (data) => api.post('/ai/behavior-analysis', data);
export const aiHealthReport = (data) => api.post('/ai/health-report', data);
export const aiEmergencyAdvice = (data) => api.post('/ai/emergency-advice', data);
export const aiInsuranceAdvice = (data) => api.post('/ai/insurance-advice', data);
export const aiInterpretLabResult = (labResultId) => api.post('/ai/interpret-lab-result', { labResultId });
export const aiFindSpecialists = (data) => api.post('/ai/find-specialists', data);
export const aiVaccinationSchedule = (data) => api.post('/ai/vaccination-schedule', data);

// Apply pass 5 backlog endpoints
export const aiVetCostNegotiate = (data) => api.post('/ai/vet-cost-negotiate', data);
export const aiAgenticWellness = (data) => api.post('/ai/agentic-wellness', data);
export const aiEmergencyTriage = (data) => api.post('/ai/emergency-triage', data);
export const aiPhotoRegression = (formData) => api.post('/ai/photo-regression', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const aiVetClinicStatus = () => api.get('/ai/integrations/vet-clinic/status');
export const aiPharmacyStatus = () => api.get('/ai/integrations/pharmacy/status');
export const aiWearableStatus = () => api.get('/ai/integrations/wearable/status');
export const communityListTopics = () => api.get('/ai/community/topics');
export const communityCreateTopic = (data) => api.post('/ai/community/topics', data);
export const communityListPosts = (topicId) => api.get(`/ai/community/topics/${topicId}/posts`);
export const communityCreatePost = (topicId, data) => api.post(`/ai/community/topics/${topicId}/posts`, data);

// Analytics
export const getAnalyticsSummary = () => api.get('/analytics/summary');

// Calendar
export const getCalendarEvents = () => api.get('/calendar/events');

// Export
export const exportData = (resource, petId) => api.get(`/export/${resource}/pet/${petId}`);

// Profile
export const updateProfile = (data) => api.put('/auth/profile', data);
export const changePassword = (data) => api.put('/auth/password', data);

export default api;
