import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import PetsPage from './pages/PetsPage';
import FeaturePage from './pages/FeaturePage';
import AIFeaturePage from './pages/AIFeaturePage';
import AIPredictivePage from './pages/AIPredictivePage';
import EmergencyPage from './pages/EmergencyPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';
import BacklogToolsPage from './pages/BacklogToolsPage';
import CustomViewsPage from './pages/CustomViewsPage';

// // === Batch 06 Gaps & Frontend Mounts ===
import CFAgenticWellnessMonitoringPage from './pages/CFAgenticWellnessMonitoringPage';
import CFPhotoBasedHealthScreeningPage from './pages/CFPhotoBasedHealthScreeningPage';
import CFEmergencyDecisionSupportPage from './pages/CFEmergencyDecisionSupportPage';
import CFBreedAgeSpecificCareAutomationPage from './pages/CFBreedAgeSpecificCareAutomationPage';
import CFVeterinaryCostNegotiationPage from './pages/CFVeterinaryCostNegotiationPage';
import GapPetsWithoutGeneticPage from './pages/GapPetsWithoutGeneticPage';
import GapMedicalHistoryWithoutHealthPage from './pages/GapMedicalHistoryWithoutHealthPage';
import GapBackendCollapsesEverythingIntoCrudJsPage from './pages/GapBackendCollapsesEverythingIntoCrudJsPage';
import GapNoVeterinaryClinicIntegrationMedicalRecordsIPage from './pages/GapNoVeterinaryClinicIntegrationMedicalRecordsIPage';
import GapNoPharmacyIntegrationMedicationRefillsCostTrPage from './pages/GapNoPharmacyIntegrationMedicationRefillsCostTrPage';
import GapNoBreedDatabaseBreedPage from './pages/GapNoBreedDatabaseBreedPage';
import GapLimitedCommunityFeaturesPeerSupportExperiencePage from './pages/GapLimitedCommunityFeaturesPeerSupportExperiencePage';
import GapNoNotificationsModuleGrep0Page from './pages/GapNoNotificationsModuleGrep0Page';
import GapNoAuditLoggingGrep0Page from './pages/GapNoAuditLoggingGrep0Page';
import GapNoWebhooksForClinicEventsPage from './pages/GapNoWebhooksForClinicEventsPage';
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return null;

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pets" element={<PetsPage />} />
          <Route path="/health-records" element={<FeaturePage feature="health-records" title="Health Records" icon="🏥" />} />
          <Route path="/behaviors" element={<FeaturePage feature="behaviors" title="Behavior Tracking" icon="🐾" />} />
          <Route path="/nutrition" element={<FeaturePage feature="nutrition" title="Nutrition Plans" icon="🥗" />} />
          <Route path="/vaccinations" element={<FeaturePage feature="vaccinations" title="Vaccinations" icon="💉" />} />
          <Route path="/medications" element={<FeaturePage feature="medications" title="Medications" icon="💊" />} />
          <Route path="/appointments" element={<FeaturePage feature="appointments" title="Vet Appointments" icon="📅" />} />
          <Route path="/weight" element={<FeaturePage feature="weight" title="Weight Tracking" icon="⚖️" />} />
          <Route path="/activities" element={<FeaturePage feature="activities" title="Activity Monitor" icon="🏃" />} />
          <Route path="/symptoms" element={<FeaturePage feature="symptoms" title="Symptoms Log" icon="🤒" />} />
          <Route path="/insurance" element={<FeaturePage feature="insurance" title="Pet Insurance" icon="🛡️" />} />
          <Route path="/grooming" element={<FeaturePage feature="grooming" title="Grooming Schedule" icon="✂️" />} />
          <Route path="/health-reports" element={<FeaturePage feature="health-reports" title="Health Reports" icon="📊" />} />
          <Route path="/allergies" element={<FeaturePage feature="allergies" title="Allergy Tracker" icon="🤧" />} />
          <Route path="/training" element={<FeaturePage feature="training" title="Training Log" icon="🎓" />} />
          <Route path="/sleep" element={<FeaturePage feature="sleep" title="Sleep Tracker" icon="😴" />} />
          <Route path="/dental" element={<FeaturePage feature="dental" title="Dental Care" icon="🦷" />} />
          <Route path="/parasite-prevention" element={<FeaturePage feature="parasite-prevention" title="Parasite Prevention" icon="🛡️" />} />
          <Route path="/travel" element={<FeaturePage feature="travel" title="Travel & Boarding" icon="✈️" />} />
          <Route path="/milestones" element={<FeaturePage feature="milestones" title="Pet Milestones" icon="🏆" />} />
          <Route path="/documents" element={<FeaturePage feature="documents" title="Pet Documents" icon="📄" />} />
          <Route path="/expenses" element={<FeaturePage feature="expenses" title="Expense Tracker" icon="💵" />} />
          <Route path="/feeding" element={<FeaturePage feature="feeding" title="Feeding Schedule" icon="🍽️" />} />
          <Route path="/lab-results" element={<FeaturePage feature="lab-results" title="Lab Results" icon="🔬" />} />
          <Route path="/socialization" element={<FeaturePage feature="socialization" title="Socialization Log" icon="🐕‍🦺" />} />
          <Route path="/supplies" element={<FeaturePage feature="supplies" title="Pet Supplies" icon="🛒" />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/emergency-contacts" element={<EmergencyPage />} />
          <Route path="/ai-symptom-checker" element={<AIFeaturePage type="symptom-check" title="AI Symptom Checker" icon="🔬" />} />
          <Route path="/ai-diet" element={<AIFeaturePage type="diet-recommendation" title="AI Diet Advisor" icon="🥑" />} />
          <Route path="/ai-behavior" element={<AIFeaturePage type="behavior-analysis" title="AI Behavior Analysis" icon="🧠" />} />
          <Route path="/ai-health-report" element={<AIFeaturePage type="health-report" title="AI Health Report" icon="📋" />} />
          <Route path="/ai-emergency" element={<AIFeaturePage type="emergency-advice" title="AI Emergency Advice" icon="🚨" />} />
          <Route path="/ai-insurance" element={<AIFeaturePage type="insurance-advice" title="AI Insurance Advisor" icon="💰" />} />
          <Route path="/ai-find-specialists" element={<AIFeaturePage type="find-specialists" title="Find Specialists" icon="🏥" />} />
          <Route path="/ai-vaccination-schedule" element={<AIFeaturePage type="vaccination-schedule" title="AI Vaccination Schedule" icon="💉" />} />
          <Route path="/ai-genetic-disease-risk" element={<AIPredictivePage type="genetic" />} />
          <Route path="/ai-health-trend-detect" element={<AIPredictivePage type="trends" />} />
          <Route path="/backlog-tools" element={<BacklogToolsPage />} />
          <Route path="/custom-views" element={<CustomViewsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        
          {/* // === Batch 06 Gaps & Frontend Mounts === */}
          <Route path="/cf-agentic-wellness-monitoring" element={<CFAgenticWellnessMonitoringPage />} />
          <Route path="/cf-photo-based-health-screening" element={<CFPhotoBasedHealthScreeningPage />} />
          <Route path="/cf-emergency-decision-support" element={<CFEmergencyDecisionSupportPage />} />
          <Route path="/cf-breed-age-specific-care-automation" element={<CFBreedAgeSpecificCareAutomationPage />} />
          <Route path="/cf-veterinary-cost-negotiation" element={<CFVeterinaryCostNegotiationPage />} />
          <Route path="/gap-pets-without-genetic" element={<GapPetsWithoutGeneticPage />} />
          <Route path="/gap-medical-history-without-health" element={<GapMedicalHistoryWithoutHealthPage />} />
          <Route path="/gap-backend-collapses-everything-into-crud-js" element={<GapBackendCollapsesEverythingIntoCrudJsPage />} />
          <Route path="/gap-no-veterinary-clinic-integration-medical-records-i" element={<GapNoVeterinaryClinicIntegrationMedicalRecordsIPage />} />
          <Route path="/gap-no-pharmacy-integration-medication-refills-cost-tr" element={<GapNoPharmacyIntegrationMedicationRefillsCostTrPage />} />
          <Route path="/gap-no-breed-database-breed" element={<GapNoBreedDatabaseBreedPage />} />
          <Route path="/gap-limited-community-features-peer-support-experience" element={<GapLimitedCommunityFeaturesPeerSupportExperiencePage />} />
          <Route path="/gap-no-notifications-module-grep-0" element={<GapNoNotificationsModuleGrep0Page />} />
          <Route path="/gap-no-audit-logging-grep-0" element={<GapNoAuditLoggingGrep0Page />} />
          <Route path="/gap-no-webhooks-for-clinic-events" element={<GapNoWebhooksForClinicEventsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
