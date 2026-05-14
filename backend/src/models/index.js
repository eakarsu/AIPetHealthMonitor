const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// User Model
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  plan: { type: DataTypes.ENUM('basic', 'pro', 'premium'), defaultValue: 'basic' }
}, { tableName: 'users', timestamps: true });

// Pet Profile
const Pet = sequelize.define('Pet', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  species: { type: DataTypes.STRING, allowNull: false },
  breed: { type: DataTypes.STRING },
  age: { type: DataTypes.FLOAT },
  weight: { type: DataTypes.FLOAT },
  gender: { type: DataTypes.STRING },
  color: { type: DataTypes.STRING },
  microchipId: { type: DataTypes.STRING },
  photo: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'pets', timestamps: true });

// Health Records
const HealthRecord = sequelize.define('HealthRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  vetName: { type: DataTypes.STRING },
  diagnosis: { type: DataTypes.TEXT },
  treatment: { type: DataTypes.TEXT },
  cost: { type: DataTypes.DECIMAL(10, 2) },
  followUp: { type: DataTypes.DATEONLY },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'health_records', timestamps: true });

// Behavior Tracking
const BehaviorLog = sequelize.define('BehaviorLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  behavior: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  severity: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'low' },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.STRING },
  duration: { type: DataTypes.STRING },
  triggers: { type: DataTypes.TEXT },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'behavior_logs', timestamps: true });

// Nutrition Plans
const NutritionPlan = sequelize.define('NutritionPlan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  foodName: { type: DataTypes.STRING, allowNull: false },
  brand: { type: DataTypes.STRING },
  type: { type: DataTypes.STRING },
  servingSize: { type: DataTypes.STRING },
  frequency: { type: DataTypes.STRING },
  calories: { type: DataTypes.INTEGER },
  protein: { type: DataTypes.FLOAT },
  fat: { type: DataTypes.FLOAT },
  fiber: { type: DataTypes.FLOAT },
  specialDiet: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'nutrition_plans', timestamps: true });

// Vaccinations
const Vaccination = sequelize.define('Vaccination', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  vaccineName: { type: DataTypes.STRING, allowNull: false },
  dateAdministered: { type: DataTypes.DATEONLY, allowNull: false },
  nextDueDate: { type: DataTypes.DATEONLY },
  vetName: { type: DataTypes.STRING },
  batchNumber: { type: DataTypes.STRING },
  manufacturer: { type: DataTypes.STRING },
  sideEffects: { type: DataTypes.TEXT },
  cost: { type: DataTypes.DECIMAL(10, 2) },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'vaccinations', timestamps: true });

// Medications
const Medication = sequelize.define('Medication', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  dosage: { type: DataTypes.STRING },
  frequency: { type: DataTypes.STRING },
  startDate: { type: DataTypes.DATEONLY },
  endDate: { type: DataTypes.DATEONLY },
  prescribedBy: { type: DataTypes.STRING },
  reason: { type: DataTypes.TEXT },
  sideEffects: { type: DataTypes.TEXT },
  refillDate: { type: DataTypes.DATEONLY },
  cost: { type: DataTypes.DECIMAL(10, 2) },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'medications', timestamps: true });

// Vet Appointments
const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  vetName: { type: DataTypes.STRING, allowNull: false },
  clinicName: { type: DataTypes.STRING },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.STRING },
  reason: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'), defaultValue: 'scheduled' },
  cost: { type: DataTypes.DECIMAL(10, 2) },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'appointments', timestamps: true });

// Weight Tracking
const WeightLog = sequelize.define('WeightLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  weight: { type: DataTypes.FLOAT, allowNull: false },
  unit: { type: DataTypes.STRING, defaultValue: 'lbs' },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  bodyConditionScore: { type: DataTypes.INTEGER },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'weight_logs', timestamps: true });

// Activity Monitor
const Activity = sequelize.define('Activity', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  duration: { type: DataTypes.INTEGER },
  distance: { type: DataTypes.FLOAT },
  intensity: { type: DataTypes.ENUM('low', 'moderate', 'high'), defaultValue: 'moderate' },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  calories: { type: DataTypes.INTEGER },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'activities', timestamps: true });

// Symptoms (for AI Symptom Checker)
const Symptom = sequelize.define('Symptom', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  symptom: { type: DataTypes.STRING, allowNull: false },
  severity: { type: DataTypes.ENUM('mild', 'moderate', 'severe'), defaultValue: 'mild' },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  duration: { type: DataTypes.STRING },
  bodyArea: { type: DataTypes.STRING },
  aiDiagnosis: { type: DataTypes.TEXT },
  aiRecommendation: { type: DataTypes.TEXT },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'symptoms', timestamps: true });

// Emergency Contacts
const EmergencyContact = sequelize.define('EmergencyContact', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  hours: { type: DataTypes.STRING },
  isEmergency24h: { type: DataTypes.BOOLEAN, defaultValue: false },
  distance: { type: DataTypes.FLOAT },
  rating: { type: DataTypes.FLOAT },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'emergency_contacts', timestamps: true });

// Insurance
const Insurance = sequelize.define('Insurance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  provider: { type: DataTypes.STRING, allowNull: false },
  policyNumber: { type: DataTypes.STRING },
  planType: { type: DataTypes.STRING },
  monthlyPremium: { type: DataTypes.DECIMAL(10, 2) },
  deductible: { type: DataTypes.DECIMAL(10, 2) },
  coverageLimit: { type: DataTypes.DECIMAL(10, 2) },
  startDate: { type: DataTypes.DATEONLY },
  endDate: { type: DataTypes.DATEONLY },
  coveredItems: { type: DataTypes.TEXT },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'insurances', timestamps: true });

// Grooming
const Grooming = sequelize.define('Grooming', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  service: { type: DataTypes.STRING, allowNull: false },
  provider: { type: DataTypes.STRING },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  nextDate: { type: DataTypes.DATEONLY },
  cost: { type: DataTypes.DECIMAL(10, 2) },
  duration: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'groomings', timestamps: true });

// AI Health Reports
const HealthReport = sequelize.define('HealthReport', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  reportType: { type: DataTypes.STRING, allowNull: false },
  generatedDate: { type: DataTypes.DATEONLY, allowNull: false },
  summary: { type: DataTypes.TEXT },
  details: { type: DataTypes.TEXT },
  recommendations: { type: DataTypes.TEXT },
  riskLevel: { type: DataTypes.ENUM('low', 'moderate', 'high'), defaultValue: 'low' },
  aiGenerated: { type: DataTypes.BOOLEAN, defaultValue: true },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'health_reports', timestamps: true });

// Allergies
const Allergy = sequelize.define('Allergy', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  allergen: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING },
  severity: { type: DataTypes.ENUM('mild', 'moderate', 'severe') },
  dateIdentified: { type: DataTypes.DATEONLY },
  reaction: { type: DataTypes.TEXT },
  treatment: { type: DataTypes.TEXT },
  avoidanceNotes: { type: DataTypes.TEXT },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'allergies', timestamps: true });

// Training Logs
const TrainingLog = sequelize.define('TrainingLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  command: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('learning', 'practicing', 'mastered') },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  duration: { type: DataTypes.INTEGER },
  trainer: { type: DataTypes.STRING },
  method: { type: DataTypes.STRING },
  successRate: { type: DataTypes.INTEGER },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'training_logs', timestamps: true });

// Sleep Logs
const SleepLog = sequelize.define('SleepLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  sleepTime: { type: DataTypes.STRING },
  wakeTime: { type: DataTypes.STRING },
  duration: { type: DataTypes.FLOAT },
  quality: { type: DataTypes.ENUM('poor', 'fair', 'good', 'excellent') },
  location: { type: DataTypes.STRING },
  interruptions: { type: DataTypes.INTEGER },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'sleep_logs', timestamps: true });

// Dental Care
const DentalCare = sequelize.define('DentalCare', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  vetName: { type: DataTypes.STRING },
  findings: { type: DataTypes.TEXT },
  treatment: { type: DataTypes.TEXT },
  nextDate: { type: DataTypes.DATEONLY },
  cost: { type: DataTypes.DECIMAL(10, 2) },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'dental_care', timestamps: true });

// Parasite Prevention
const ParasitePrevention = sequelize.define('ParasitePrevention', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  productName: { type: DataTypes.STRING },
  dateAdministered: { type: DataTypes.DATEONLY, allowNull: false },
  nextDueDate: { type: DataTypes.DATEONLY },
  brand: { type: DataTypes.STRING },
  dosage: { type: DataTypes.STRING },
  method: { type: DataTypes.STRING },
  cost: { type: DataTypes.DECIMAL(10, 2) },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'parasite_prevention', timestamps: true });

// Travel Logs
const TravelLog = sequelize.define('TravelLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  destination: { type: DataTypes.STRING },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY },
  providerName: { type: DataTypes.STRING },
  providerPhone: { type: DataTypes.STRING },
  cost: { type: DataTypes.DECIMAL(10, 2) },
  rating: { type: DataTypes.FLOAT },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'travel_logs', timestamps: true });

// Milestones
const Milestone = sequelize.define('Milestone', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  description: { type: DataTypes.TEXT },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'milestones', timestamps: true });

// Pet Documents
const PetDocument = sequelize.define('PetDocument', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING },
  documentDate: { type: DataTypes.DATEONLY },
  expiryDate: { type: DataTypes.DATEONLY },
  issuedBy: { type: DataTypes.STRING },
  referenceNumber: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'pet_documents', timestamps: true });

// Expenses
const Expense = sequelize.define('Expense', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  vendor: { type: DataTypes.STRING },
  paymentMethod: { type: DataTypes.STRING },
  isRecurring: { type: DataTypes.BOOLEAN, defaultValue: false },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'expenses', timestamps: true });

// Feeding Logs
const FeedingLog = sequelize.define('FeedingLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.STRING, allowNull: false },
  foodType: { type: DataTypes.STRING },
  foodName: { type: DataTypes.STRING },
  amount: { type: DataTypes.STRING },
  calories: { type: DataTypes.INTEGER },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'feeding_logs', timestamps: true });

// Lab Results
const LabResult = sequelize.define('LabResult', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  testName: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  vetName: { type: DataTypes.STRING },
  lab: { type: DataTypes.STRING },
  result: { type: DataTypes.TEXT },
  normalRange: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('normal', 'abnormal', 'critical') },
  followUp: { type: DataTypes.TEXT },
  cost: { type: DataTypes.DECIMAL(10, 2) },
  aiInterpretation: { type: DataTypes.TEXT },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'lab_results', timestamps: true });

// Socialization Logs
const SocializationLog = sequelize.define('SocializationLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  event: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  location: { type: DataTypes.STRING },
  withPets: { type: DataTypes.STRING },
  withPeople: { type: DataTypes.STRING },
  duration: { type: DataTypes.STRING },
  reaction: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'socialization_logs', timestamps: true });

// Pet Supplies
const PetSupply = sequelize.define('PetSupply', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  petId: { type: DataTypes.INTEGER, allowNull: false },
  item: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  brand: { type: DataTypes.STRING },
  purchaseDate: { type: DataTypes.DATEONLY },
  expiryDate: { type: DataTypes.DATEONLY },
  cost: { type: DataTypes.DECIMAL(10, 2) },
  quantity: { type: DataTypes.INTEGER },
  reorderAt: { type: DataTypes.INTEGER },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'pet_supplies', timestamps: true });

// Associations
User.hasMany(Pet, { foreignKey: 'userId' });
Pet.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(EmergencyContact, { foreignKey: 'userId' });

Pet.hasMany(HealthRecord, { foreignKey: 'petId' });
Pet.hasMany(BehaviorLog, { foreignKey: 'petId' });
Pet.hasMany(NutritionPlan, { foreignKey: 'petId' });
Pet.hasMany(Vaccination, { foreignKey: 'petId' });
Pet.hasMany(Medication, { foreignKey: 'petId' });
Pet.hasMany(Appointment, { foreignKey: 'petId' });
Pet.hasMany(WeightLog, { foreignKey: 'petId' });
Pet.hasMany(Activity, { foreignKey: 'petId' });
Pet.hasMany(Symptom, { foreignKey: 'petId' });
Pet.hasMany(Insurance, { foreignKey: 'petId' });
Pet.hasMany(Grooming, { foreignKey: 'petId' });
Pet.hasMany(HealthReport, { foreignKey: 'petId' });
Pet.hasMany(Allergy, { foreignKey: 'petId' });
Pet.hasMany(TrainingLog, { foreignKey: 'petId' });
Pet.hasMany(SleepLog, { foreignKey: 'petId' });
Pet.hasMany(DentalCare, { foreignKey: 'petId' });
Pet.hasMany(ParasitePrevention, { foreignKey: 'petId' });
Pet.hasMany(TravelLog, { foreignKey: 'petId' });
Pet.hasMany(Milestone, { foreignKey: 'petId' });
Pet.hasMany(PetDocument, { foreignKey: 'petId' });
Pet.hasMany(Expense, { foreignKey: 'petId' });
Pet.hasMany(FeedingLog, { foreignKey: 'petId' });
Pet.hasMany(LabResult, { foreignKey: 'petId' });
Pet.hasMany(SocializationLog, { foreignKey: 'petId' });
Pet.hasMany(PetSupply, { foreignKey: 'petId' });

module.exports = {
  sequelize, User, Pet, HealthRecord, BehaviorLog, NutritionPlan,
  Vaccination, Medication, Appointment, WeightLog, Activity,
  Symptom, EmergencyContact, Insurance, Grooming, HealthReport,
  Allergy, TrainingLog, SleepLog, DentalCare, ParasitePrevention,
  TravelLog, Milestone, PetDocument, Expense, FeedingLog,
  LabResult, SocializationLog, PetSupply
};
