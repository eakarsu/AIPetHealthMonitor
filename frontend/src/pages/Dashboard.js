import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPets } from '../services/api';

const features = [
  { path: '/pets', icon: '🐾', title: 'My Pets', desc: 'Manage pet profiles, photos, and details' },
  { path: '/analytics', icon: '📈', title: 'Analytics', desc: 'Charts, trends, and insights across all pets' },
  { path: '/calendar', icon: '📅', title: 'Calendar', desc: 'View all upcoming events and reminders' },
  { path: '/health-records', icon: '🏥', title: 'Health Records', desc: 'Track vet visits, diagnoses, and treatments' },
  { path: '/vaccinations', icon: '💉', title: 'Vaccinations', desc: 'Track vaccine history and upcoming due dates' },
  { path: '/medications', icon: '💊', title: 'Medications', desc: 'Monitor prescriptions, dosages, and refills' },
  { path: '/appointments', icon: '🗓️', title: 'Vet Appointments', desc: 'Schedule and track veterinary visits' },
  { path: '/symptoms', icon: '🤒', title: 'Symptoms Log', desc: 'Record symptoms for AI analysis' },
  { path: '/allergies', icon: '🤧', title: 'Allergy Tracker', desc: 'Track known allergies and reactions' },
  { path: '/dental', icon: '🦷', title: 'Dental Care', desc: 'Monitor dental health and cleanings' },
  { path: '/lab-results', icon: '🔬', title: 'Lab Results', desc: 'Track lab tests and diagnostic results' },
  { path: '/parasite-prevention', icon: '🛡️', title: 'Parasite Prevention', desc: 'Flea, tick, and heartworm prevention tracking' },
  { path: '/behaviors', icon: '🧩', title: 'Behavior Tracking', desc: 'Log and analyze pet behavior patterns' },
  { path: '/nutrition', icon: '🥗', title: 'Nutrition Plans', desc: 'Manage diets and calorie goals' },
  { path: '/feeding', icon: '🍽️', title: 'Feeding Schedule', desc: 'Track daily meals, portions, and treats' },
  { path: '/weight', icon: '⚖️', title: 'Weight Tracking', desc: 'Monitor weight trends and body condition' },
  { path: '/activities', icon: '🏃', title: 'Activity Monitor', desc: 'Track exercise, walks, and playtime' },
  { path: '/sleep', icon: '😴', title: 'Sleep Tracker', desc: 'Monitor sleep patterns and quality' },
  { path: '/grooming', icon: '✂️', title: 'Grooming Schedule', desc: 'Track grooming appointments and care' },
  { path: '/training', icon: '🎓', title: 'Training Log', desc: 'Track commands, skills, and progress' },
  { path: '/socialization', icon: '🐕‍🦺', title: 'Socialization Log', desc: 'Track social interactions and reactions' },
  { path: '/expenses', icon: '💵', title: 'Expense Tracker', desc: 'Track all pet-related spending' },
  { path: '/insurance', icon: '🛡️', title: 'Pet Insurance', desc: 'Manage policies, premiums, and claims' },
  { path: '/documents', icon: '📄', title: 'Pet Documents', desc: 'Store adoption papers, licenses, and records' },
  { path: '/supplies', icon: '🛒', title: 'Pet Supplies', desc: 'Track inventory and reorder supplies' },
  { path: '/milestones', icon: '🏆', title: 'Pet Milestones', desc: 'Record special moments and achievements' },
  { path: '/travel', icon: '✈️', title: 'Travel & Boarding', desc: 'Track boarding stays and travel history' },
  { path: '/health-reports', icon: '📑', title: 'Health Reports', desc: 'View AI-generated health assessments' },
  { path: '/emergency-contacts', icon: '📞', title: 'Emergency Contacts', desc: 'Vets, hospitals, and emergency numbers' },
  { path: '/settings', icon: '⚙️', title: 'Settings', desc: 'Profile, data export, and preferences' },
  { path: '/ai-symptom-checker', icon: '🔬', title: 'AI Symptom Checker', desc: 'Get AI-powered symptom analysis' },
  { path: '/ai-diet', icon: '🥑', title: 'AI Diet Advisor', desc: 'Personalized nutrition recommendations' },
  { path: '/ai-behavior', icon: '🧠', title: 'AI Behavior Analysis', desc: 'Understand your pet\'s behavior with AI' },
  { path: '/ai-health-report', icon: '📋', title: 'AI Health Report', desc: 'Comprehensive AI health assessment' },
  { path: '/ai-emergency', icon: '🚨', title: 'AI Emergency Advice', desc: 'Immediate AI-guided emergency help' },
  { path: '/ai-insurance', icon: '💰', title: 'AI Insurance Advisor', desc: 'Get insurance recommendations from AI' },
];

function Dashboard() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);

  useEffect(() => {
    getPets().then(res => setPets(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome to PetHealth AI</h1>
          <p>Your AI-powered pet health management platform</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🐾</div>
          <div className="stat-value">{pets.length}</div>
          <div className="stat-label">Total Pets</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-value">30</div>
          <div className="stat-label">Features Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-value">6</div>
          <div className="stat-label">AI Features</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">Premium</div>
          <div className="stat-label">Your Plan</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {features.map(f => (
          <div key={f.path} className="dashboard-card" onClick={() => navigate(f.path)}>
            <div className="card-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
