import React, { useState, useEffect, useCallback } from 'react';
import { getPets, healthRecordsApi, behaviorsApi, nutritionApi, vaccinationsApi,
  medicationsApi, appointmentsApi, weightApi, activitiesApi, symptomsApi,
  insuranceApi, groomingApi, healthReportsApi, allergiesApi, trainingApi,
  sleepApi, dentalApi, parasitePreventionApi, travelApi, milestonesApi,
  documentsApi, expensesApi, feedingApi, labResultsApi, socializationApi,
  suppliesApi } from '../services/api';
import Toast from '../components/Toast';

const apiMap = {
  'health-records': healthRecordsApi,
  'behaviors': behaviorsApi,
  'nutrition': nutritionApi,
  'vaccinations': vaccinationsApi,
  'medications': medicationsApi,
  'appointments': appointmentsApi,
  'weight': weightApi,
  'activities': activitiesApi,
  'symptoms': symptomsApi,
  'insurance': insuranceApi,
  'grooming': groomingApi,
  'health-reports': healthReportsApi,
  'allergies': allergiesApi,
  'training': trainingApi,
  'sleep': sleepApi,
  'dental': dentalApi,
  'parasite-prevention': parasitePreventionApi,
  'travel': travelApi,
  'milestones': milestonesApi,
  'documents': documentsApi,
  'expenses': expensesApi,
  'feeding': feedingApi,
  'lab-results': labResultsApi,
  'socialization': socializationApi,
  'supplies': suppliesApi,
};

// Field configs for each feature
const fieldConfigs = {
  'health-records': {
    columns: ['type', 'description', 'date', 'vetName', 'diagnosis', 'cost'],
    fields: [
      { name: 'type', label: 'Type', type: 'select', options: ['Checkup', 'Illness', 'Injury', 'Surgery', 'Dental', 'Eye', 'Allergy', 'Chronic', 'Emergency'], required: true },
      { name: 'description', label: 'Description', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'vetName', label: 'Vet Name', type: 'text' },
      { name: 'diagnosis', label: 'Diagnosis', type: 'text' },
      { name: 'treatment', label: 'Treatment', type: 'textarea' },
      { name: 'cost', label: 'Cost ($)', type: 'number' },
      { name: 'followUp', label: 'Follow-up Date', type: 'date' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'behaviors': {
    columns: ['behavior', 'category', 'severity', 'date', 'triggers'],
    fields: [
      { name: 'behavior', label: 'Behavior', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['Aggression', 'Anxiety', 'Compulsive', 'Destructive', 'Training', 'Vocalization', 'Communication', 'Comfort', 'Pain'] },
      { name: 'severity', label: 'Severity', type: 'select', options: ['low', 'medium', 'high'], required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'time', label: 'Time', type: 'text' },
      { name: 'duration', label: 'Duration', type: 'text' },
      { name: 'triggers', label: 'Triggers', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'nutrition': {
    columns: ['foodName', 'brand', 'type', 'servingSize', 'frequency', 'calories'],
    fields: [
      { name: 'foodName', label: 'Food Name', type: 'text', required: true },
      { name: 'brand', label: 'Brand', type: 'text' },
      { name: 'type', label: 'Type', type: 'select', options: ['Dry Kibble', 'Wet Food', 'Raw', 'Freeze-Dried', 'Hay', 'Pellets', 'Fish Flakes', 'Other'] },
      { name: 'servingSize', label: 'Serving Size', type: 'text' },
      { name: 'frequency', label: 'Frequency', type: 'text' },
      { name: 'calories', label: 'Calories', type: 'number' },
      { name: 'protein', label: 'Protein (%)', type: 'number' },
      { name: 'fat', label: 'Fat (%)', type: 'number' },
      { name: 'fiber', label: 'Fiber (%)', type: 'number' },
      { name: 'specialDiet', label: 'Special Diet', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'vaccinations': {
    columns: ['vaccineName', 'dateAdministered', 'nextDueDate', 'vetName', 'manufacturer', 'cost'],
    fields: [
      { name: 'vaccineName', label: 'Vaccine Name', type: 'text', required: true },
      { name: 'dateAdministered', label: 'Date Given', type: 'date', required: true },
      { name: 'nextDueDate', label: 'Next Due Date', type: 'date' },
      { name: 'vetName', label: 'Vet Name', type: 'text' },
      { name: 'batchNumber', label: 'Batch Number', type: 'text' },
      { name: 'manufacturer', label: 'Manufacturer', type: 'text' },
      { name: 'sideEffects', label: 'Side Effects', type: 'textarea' },
      { name: 'cost', label: 'Cost ($)', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'medications': {
    columns: ['name', 'dosage', 'frequency', 'startDate', 'reason', 'cost'],
    fields: [
      { name: 'name', label: 'Medication Name', type: 'text', required: true },
      { name: 'dosage', label: 'Dosage', type: 'text' },
      { name: 'frequency', label: 'Frequency', type: 'text' },
      { name: 'startDate', label: 'Start Date', type: 'date' },
      { name: 'endDate', label: 'End Date', type: 'date' },
      { name: 'prescribedBy', label: 'Prescribed By', type: 'text' },
      { name: 'reason', label: 'Reason', type: 'textarea' },
      { name: 'sideEffects', label: 'Side Effects', type: 'textarea' },
      { name: 'refillDate', label: 'Refill Date', type: 'date' },
      { name: 'cost', label: 'Cost ($)', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'appointments': {
    columns: ['vetName', 'clinicName', 'date', 'time', 'reason', 'status'],
    fields: [
      { name: 'vetName', label: 'Vet Name', type: 'text', required: true },
      { name: 'clinicName', label: 'Clinic Name', type: 'text' },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'time', label: 'Time', type: 'text' },
      { name: 'reason', label: 'Reason', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['scheduled', 'completed', 'cancelled'] },
      { name: 'cost', label: 'Cost ($)', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'weight': {
    columns: ['weight', 'unit', 'date', 'bodyConditionScore', 'notes'],
    fields: [
      { name: 'weight', label: 'Weight', type: 'number', required: true },
      { name: 'unit', label: 'Unit', type: 'select', options: ['lbs', 'kg'], required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'bodyConditionScore', label: 'Body Condition Score (1-9)', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'activities': {
    columns: ['type', 'duration', 'distance', 'intensity', 'date', 'calories'],
    fields: [
      { name: 'type', label: 'Activity Type', type: 'select', options: ['Walk', 'Run', 'Fetch', 'Swimming', 'Play', 'Training', 'Free Roam', 'Flight Training', 'Other'], required: true },
      { name: 'duration', label: 'Duration (min)', type: 'number' },
      { name: 'distance', label: 'Distance (miles)', type: 'number' },
      { name: 'intensity', label: 'Intensity', type: 'select', options: ['low', 'moderate', 'high'] },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'calories', label: 'Calories Burned', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'symptoms': {
    columns: ['symptom', 'severity', 'date', 'duration', 'bodyArea'],
    fields: [
      { name: 'symptom', label: 'Symptom', type: 'text', required: true },
      { name: 'severity', label: 'Severity', type: 'select', options: ['mild', 'moderate', 'severe'], required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'duration', label: 'Duration', type: 'text' },
      { name: 'bodyArea', label: 'Body Area', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'insurance': {
    columns: ['provider', 'policyNumber', 'planType', 'monthlyPremium', 'deductible', 'coverageLimit'],
    fields: [
      { name: 'provider', label: 'Provider', type: 'text', required: true },
      { name: 'policyNumber', label: 'Policy Number', type: 'text' },
      { name: 'planType', label: 'Plan Type', type: 'text' },
      { name: 'monthlyPremium', label: 'Monthly Premium ($)', type: 'number' },
      { name: 'deductible', label: 'Deductible ($)', type: 'number' },
      { name: 'coverageLimit', label: 'Coverage Limit ($)', type: 'number' },
      { name: 'startDate', label: 'Start Date', type: 'date' },
      { name: 'endDate', label: 'End Date', type: 'date' },
      { name: 'coveredItems', label: 'Covered Items', type: 'textarea' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'grooming': {
    columns: ['service', 'provider', 'date', 'nextDate', 'cost', 'duration'],
    fields: [
      { name: 'service', label: 'Service', type: 'text', required: true },
      { name: 'provider', label: 'Provider', type: 'text' },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'nextDate', label: 'Next Date', type: 'date' },
      { name: 'cost', label: 'Cost ($)', type: 'number' },
      { name: 'duration', label: 'Duration', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'health-reports': {
    columns: ['reportType', 'generatedDate', 'riskLevel', 'aiGenerated'],
    fields: [
      { name: 'reportType', label: 'Report Type', type: 'text', required: true },
      { name: 'generatedDate', label: 'Date', type: 'date', required: true },
      { name: 'summary', label: 'Summary', type: 'textarea' },
      { name: 'details', label: 'Details', type: 'textarea' },
      { name: 'recommendations', label: 'Recommendations', type: 'textarea' },
      { name: 'riskLevel', label: 'Risk Level', type: 'select', options: ['low', 'moderate', 'high'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'allergies': {
    columns: ['allergen', 'type', 'severity', 'dateIdentified', 'reaction'],
    fields: [
      { name: 'allergen', label: 'Allergen', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'select', options: ['Food', 'Environmental', 'Medication', 'Contact', 'Seasonal'] },
      { name: 'severity', label: 'Severity', type: 'select', options: ['mild', 'moderate', 'severe'], required: true },
      { name: 'dateIdentified', label: 'Date Identified', type: 'date' },
      { name: 'reaction', label: 'Reaction', type: 'textarea' },
      { name: 'treatment', label: 'Treatment', type: 'textarea' },
      { name: 'avoidanceNotes', label: 'Avoidance Notes', type: 'textarea' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'training': {
    columns: ['command', 'category', 'status', 'date', 'successRate'],
    fields: [
      { name: 'command', label: 'Command/Skill', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['Obedience', 'Tricks', 'Agility', 'Behavior', 'Socialization', 'House Training'] },
      { name: 'status', label: 'Status', type: 'select', options: ['learning', 'practicing', 'mastered'], required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'duration', label: 'Duration (min)', type: 'number' },
      { name: 'trainer', label: 'Trainer', type: 'text' },
      { name: 'method', label: 'Method', type: 'text' },
      { name: 'successRate', label: 'Success Rate (%)', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'sleep': {
    columns: ['date', 'sleepTime', 'wakeTime', 'duration', 'quality'],
    fields: [
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'sleepTime', label: 'Sleep Time', type: 'text' },
      { name: 'wakeTime', label: 'Wake Time', type: 'text' },
      { name: 'duration', label: 'Duration (hours)', type: 'number' },
      { name: 'quality', label: 'Quality', type: 'select', options: ['poor', 'fair', 'good', 'excellent'] },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'interruptions', label: 'Interruptions', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'dental': {
    columns: ['type', 'date', 'vetName', 'findings', 'cost'],
    fields: [
      { name: 'type', label: 'Type', type: 'select', options: ['Cleaning', 'Extraction', 'Checkup', 'Treatment', 'Brushing'], required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'vetName', label: 'Vet Name', type: 'text' },
      { name: 'findings', label: 'Findings', type: 'textarea' },
      { name: 'treatment', label: 'Treatment', type: 'textarea' },
      { name: 'nextDate', label: 'Next Date', type: 'date' },
      { name: 'cost', label: 'Cost ($)', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'parasite-prevention': {
    columns: ['type', 'productName', 'dateAdministered', 'nextDueDate', 'method'],
    fields: [
      { name: 'type', label: 'Type', type: 'select', options: ['Flea', 'Tick', 'Heartworm', 'Deworming', 'Flea & Tick'], required: true },
      { name: 'productName', label: 'Product Name', type: 'text' },
      { name: 'dateAdministered', label: 'Date Administered', type: 'date', required: true },
      { name: 'nextDueDate', label: 'Next Due Date', type: 'date' },
      { name: 'brand', label: 'Brand', type: 'text' },
      { name: 'dosage', label: 'Dosage', type: 'text' },
      { name: 'method', label: 'Method', type: 'select', options: ['Oral', 'Topical', 'Collar', 'Injection'] },
      { name: 'cost', label: 'Cost ($)', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'travel': {
    columns: ['type', 'destination', 'startDate', 'endDate', 'providerName', 'cost'],
    fields: [
      { name: 'type', label: 'Type', type: 'select', options: ['Boarding', 'Travel', 'Pet Hotel', 'Daycare', 'Pet Sitting'], required: true },
      { name: 'destination', label: 'Destination/Facility', type: 'text' },
      { name: 'startDate', label: 'Start Date', type: 'date', required: true },
      { name: 'endDate', label: 'End Date', type: 'date' },
      { name: 'providerName', label: 'Provider Name', type: 'text' },
      { name: 'providerPhone', label: 'Provider Phone', type: 'text' },
      { name: 'cost', label: 'Cost ($)', type: 'number' },
      { name: 'rating', label: 'Rating (1-5)', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'milestones': {
    columns: ['title', 'category', 'date', 'description'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['Health', 'Training', 'Social', 'Growth', 'Adventure', 'Birthday'] },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'documents': {
    columns: ['title', 'type', 'documentDate', 'expiryDate', 'issuedBy'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'select', options: ['Adoption Papers', 'Registration', 'License', 'Medical Record', 'Insurance', 'Microchip', 'Vaccination Certificate', 'Other'] },
      { name: 'documentDate', label: 'Document Date', type: 'date' },
      { name: 'expiryDate', label: 'Expiry Date', type: 'date' },
      { name: 'issuedBy', label: 'Issued By', type: 'text' },
      { name: 'referenceNumber', label: 'Reference Number', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'expenses': {
    columns: ['category', 'description', 'amount', 'date', 'vendor'],
    fields: [
      { name: 'category', label: 'Category', type: 'select', options: ['Veterinary', 'Food', 'Supplies', 'Grooming', 'Training', 'Insurance', 'Medication', 'Boarding', 'Other'], required: true },
      { name: 'description', label: 'Description', type: 'text', required: true },
      { name: 'amount', label: 'Amount ($)', type: 'number', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'vendor', label: 'Vendor', type: 'text' },
      { name: 'paymentMethod', label: 'Payment Method', type: 'text' },
      { name: 'isRecurring', label: 'Recurring', type: 'select', options: ['false', 'true'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'feeding': {
    columns: ['date', 'time', 'foodType', 'foodName', 'amount', 'calories'],
    fields: [
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'time', label: 'Time', type: 'text', required: true },
      { name: 'foodType', label: 'Meal Type', type: 'select', options: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Treat'] },
      { name: 'foodName', label: 'Food Name', type: 'text' },
      { name: 'amount', label: 'Amount', type: 'text' },
      { name: 'calories', label: 'Calories', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'lab-results': {
    columns: ['testName', 'date', 'status', 'vetName', 'cost'],
    fields: [
      { name: 'testName', label: 'Test Name', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'vetName', label: 'Vet Name', type: 'text' },
      { name: 'lab', label: 'Lab', type: 'text' },
      { name: 'result', label: 'Result', type: 'textarea' },
      { name: 'normalRange', label: 'Normal Range', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['normal', 'abnormal', 'critical'] },
      { name: 'followUp', label: 'Follow Up', type: 'textarea' },
      { name: 'cost', label: 'Cost ($)', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'socialization': {
    columns: ['event', 'date', 'location', 'reaction', 'duration'],
    fields: [
      { name: 'event', label: 'Event', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'withPets', label: 'With Pets', type: 'text' },
      { name: 'withPeople', label: 'With People', type: 'text' },
      { name: 'duration', label: 'Duration', type: 'text' },
      { name: 'reaction', label: 'Reaction', type: 'select', options: ['Positive', 'Neutral', 'Negative', 'Fearful', 'Aggressive'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'supplies': {
    columns: ['item', 'category', 'brand', 'cost', 'quantity'],
    fields: [
      { name: 'item', label: 'Item', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['Food', 'Toys', 'Bedding', 'Collar & Leash', 'Health', 'Grooming', 'Travel', 'Clothing', 'Other'] },
      { name: 'brand', label: 'Brand', type: 'text' },
      { name: 'purchaseDate', label: 'Purchase Date', type: 'date' },
      { name: 'expiryDate', label: 'Expiry Date', type: 'date' },
      { name: 'cost', label: 'Cost ($)', type: 'number' },
      { name: 'quantity', label: 'Quantity', type: 'number' },
      { name: 'reorderAt', label: 'Reorder At', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
};

function formatValue(val) {
  if (val === null || val === undefined || val === '') return '-';
  if (val === true) return '✅ Yes';
  if (val === false) return '❌ No';
  if (typeof val === 'number') return val.toLocaleString();
  return String(val);
}

function FeaturePage({ feature, title, icon }) {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const api = apiMap[feature];
  const config = fieldConfigs[feature];

  useEffect(() => {
    getPets().then(r => {
      setPets(r.data);
      if (r.data.length > 0) setSelectedPet(r.data[0]);
    }).catch(() => {});
  }, []);

  const loadRecords = useCallback(async () => {
    if (!selectedPet) return;
    setLoading(true);
    try {
      const r = await api.getAll(selectedPet.id);
      setRecords(r.data);
    } catch (err) {
      setRecords([]);
    }
    setLoading(false);
  }, [selectedPet, api]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const getEmptyForm = () => {
    const empty = { petId: selectedPet?.id };
    config.fields.forEach(f => { empty[f.name] = f.type === 'date' ? new Date().toISOString().split('T')[0] : ''; });
    return empty;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, petId: selectedPet.id };
      if (editId) {
        await api.update(editId, data);
        setToast({ type: 'success', msg: 'Record updated' });
      } else {
        await api.create(data);
        setToast({ type: 'success', msg: 'Record created' });
      }
      setShowForm(false);
      setEditId(null);
      setSelected(null);
      loadRecords();
    } catch (err) {
      setToast({ type: 'error', msg: err.response?.data?.error || 'Error saving' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.remove(id);
      setToast({ type: 'success', msg: 'Record deleted' });
      setSelected(null);
      loadRecords();
    } catch (err) {
      setToast({ type: 'error', msg: 'Error deleting' });
    }
  };

  const openEdit = (record) => {
    const data = {};
    config.fields.forEach(f => { data[f.name] = record[f.name] || ''; });
    setFormData(data);
    setEditId(record.id);
    setShowForm(true);
    setSelected(null);
  };

  const openNew = () => {
    setFormData(getEmptyForm());
    setEditId(null);
    setShowForm(true);
  };

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="page-header">
        <div>
          <h1>{icon} {title}</h1>
          <p>Manage {title.toLowerCase()} for your pets</p>
        </div>
        <button className="btn btn-primary" onClick={openNew} disabled={!selectedPet}>+ Add New</button>
      </div>

      {/* Pet Selector */}
      <div className="pet-selector">
        {pets.map(pet => (
          <button key={pet.id} className={`pet-chip ${selectedPet?.id === pet.id ? 'active' : ''}`}
            onClick={() => setSelectedPet(pet)}>
            {pet.species === 'Dog' ? '🐕' : pet.species === 'Cat' ? '🐱' : pet.species === 'Bird' ? '🦜' : pet.species === 'Fish' ? '🐟' : pet.species === 'Rabbit' ? '🐰' : '🐾'} {pet.name}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className="data-section">
        <div className="data-header">
          <h2>{selectedPet ? `${selectedPet.name}'s ${title}` : 'Select a pet'}</h2>
          <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>{records.length} records</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              {config.columns.map(col => (
                <th key={col}>{col.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.id} onClick={() => setSelected(record)}>
                {config.columns.map(col => (
                  <td key={col}>
                    {['severity', 'riskLevel', 'intensity', 'status', 'quality', 'reaction'].includes(col)
                      ? <span className={`badge badge-${record[col]}`}>{record[col]}</span>
                      : col === 'cost' || col === 'monthlyPremium' || col === 'deductible' || col === 'coverageLimit'
                        ? record[col] ? `$${Number(record[col]).toLocaleString()}` : '-'
                        : formatValue(record[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && records.length === 0 && selectedPet && (
          <div className="empty-state">
            <div className="empty-icon">{icon}</div>
            <p>No {title.toLowerCase()} for {selectedPet.name} yet.</p>
            <button className="btn btn-primary" onClick={openNew}>+ Add First Record</button>
          </div>
        )}
        {loading && <div className="empty-state"><div className="ai-loading"><div className="spinner"></div><p>Loading...</p></div></div>}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="detail-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="detail-panel">
            <div className="detail-header">
              <h2>{icon} Record Details</h2>
              <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="detail-body">
              {config.fields.map(f => (
                <div className="detail-row" key={f.name}>
                  <div className="detail-label">{f.label}</div>
                  <div className="detail-value">
                    {['severity', 'riskLevel', 'intensity', 'status', 'quality', 'reaction'].includes(f.name)
                      ? <span className={`badge badge-${selected[f.name]}`}>{selected[f.name] || '-'}</span>
                      : formatValue(selected[f.name])}
                  </div>
                </div>
              ))}
              {/* Show AI fields if they exist */}
              {selected.aiDiagnosis && (
                <div className="ai-response" style={{ marginTop: 16 }}>
                  <div className="ai-response-content" dangerouslySetInnerHTML={{ __html: formatAIContent(selected.aiDiagnosis) }} />
                </div>
              )}
              {selected.details && feature === 'health-reports' && (
                <div className="ai-response" style={{ marginTop: 16 }}>
                  <div className="ai-response-content" dangerouslySetInnerHTML={{ __html: formatAIContent(selected.details) }} />
                </div>
              )}
            </div>
            <div className="detail-actions">
              <button className="btn btn-primary btn-sm" onClick={() => openEdit(selected)}>✏️ Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="detail-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="detail-panel">
            <div className="detail-header">
              <h2>{editId ? 'Edit' : 'New'} {title}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="detail-body">
              <form onSubmit={handleSubmit} className="modal-form">
                {config.fields.map((f, i) => {
                  const isHalf = f.type !== 'textarea' && i < config.fields.length - 1 && config.fields[i + 1]?.type !== 'textarea';
                  return (
                    <div key={f.name} className={`form-group`}>
                      <label>{f.label} {f.required && '*'}</label>
                      {f.type === 'select' ? (
                        <select value={formData[f.name] || ''} onChange={e => setFormData({...formData, [f.name]: e.target.value})} required={f.required}>
                          <option value="">Select...</option>
                          {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : f.type === 'textarea' ? (
                        <textarea value={formData[f.name] || ''} onChange={e => setFormData({...formData, [f.name]: e.target.value})} required={f.required} />
                      ) : (
                        <input type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                          step={f.type === 'number' ? 'any' : undefined}
                          value={formData[f.name] || ''} onChange={e => setFormData({...formData, [f.name]: e.target.value})} required={f.required} />
                      )}
                    </div>
                  );
                })}
                <div className="detail-actions" style={{ padding: 0, borderTop: 'none', marginTop: 16 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatAIContent(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
    .replace(/#{1,3}\s(.*?)(<br\/>|$)/g, '<h3>$1</h3>');
}

export default FeaturePage;
