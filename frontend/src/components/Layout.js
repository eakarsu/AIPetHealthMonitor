import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { section: 'Overview' },
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/pets', label: 'My Pets', icon: '🐾' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/calendar', label: 'Calendar', icon: '📅' },
  { path: '/custom-views', label: 'Pet Views', icon: '🐾' },
  { section: 'Health & Care' },
  { path: '/health-records', label: 'Health Records', icon: '🏥' },
  { path: '/vaccinations', label: 'Vaccinations', icon: '💉' },
  { path: '/medications', label: 'Medications', icon: '💊' },
  { path: '/appointments', label: 'Appointments', icon: '🗓️' },
  { path: '/symptoms', label: 'Symptoms', icon: '🤒' },
  { path: '/allergies', label: 'Allergies', icon: '🤧' },
  { path: '/dental', label: 'Dental Care', icon: '🦷' },
  { path: '/lab-results', label: 'Lab Results', icon: '🔬' },
  { path: '/parasite-prevention', label: 'Parasite Prevention', icon: '🛡️' },
  { section: 'Wellness' },
  { path: '/behaviors', label: 'Behavior', icon: '🧩' },
  { path: '/nutrition', label: 'Nutrition', icon: '🥗' },
  { path: '/feeding', label: 'Feeding', icon: '🍽️' },
  { path: '/weight', label: 'Weight', icon: '⚖️' },
  { path: '/activities', label: 'Activities', icon: '🏃' },
  { path: '/sleep', label: 'Sleep', icon: '😴' },
  { path: '/grooming', label: 'Grooming', icon: '✂️' },
  { path: '/training', label: 'Training', icon: '🎓' },
  { path: '/socialization', label: 'Socialization', icon: '🐕‍🦺' },
  { section: 'AI Features' },
  { path: '/ai-symptom-checker', label: 'Symptom Checker', icon: '🔬' },
  { path: '/ai-diet', label: 'Diet Advisor', icon: '🥑' },
  { path: '/ai-behavior', label: 'Behavior Analysis', icon: '🧠' },
  { path: '/ai-health-report', label: 'Health Report', icon: '📋' },
  { path: '/ai-emergency', label: 'Emergency AI', icon: '🚨' },
  { path: '/ai-insurance', label: 'Insurance Advisor', icon: '💰' },
  { path: '/ai-find-specialists', label: 'Find Specialists', icon: '🏥' },
  { path: '/ai-vaccination-schedule', label: 'Vaccination Schedule', icon: '💉' },
  { path: '/ai-genetic-disease-risk', label: 'Genetic Disease Risk', icon: '🧬' },
  { path: '/ai-health-trend-detect', label: 'Health Trend Detect', icon: '📈' },
  { section: 'Records & Finance' },
  { path: '/expenses', label: 'Expenses', icon: '💵' },
  { path: '/insurance', label: 'Insurance', icon: '🛡️' },
  { path: '/documents', label: 'Documents', icon: '📄' },
  { path: '/supplies', label: 'Supplies', icon: '🛒' },
  { section: 'More' },
  { path: '/milestones', label: 'Milestones', icon: '🏆' },
  { path: '/travel', label: 'Travel & Boarding', icon: '✈️' },
  { path: '/health-reports', label: 'Report History', icon: '📑' },
  { path: '/emergency-contacts', label: 'Emergency Contacts', icon: '📞' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

function Layout({ user, onLogout, children }) {
  const location = useLocation();

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">🐕</span>
          <div>
            <h2>PetHealth AI</h2>
            <span>Smart Pet Care</span>
          </div>
        </div>

        <ul className="sidebar-nav">
          {navItems.map((item, i) =>
            item.section ? (
              <div key={i} className="sidebar-section">{item.section}</div>
            ) : (
              <li key={item.path}>
                <Link to={item.path} className={location.pathname === item.path ? 'active' : ''}>
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            )
          )}
          <div className="sidebar-section">Account</div>
          <li>
            <button onClick={onLogout}>
              <span className="nav-icon">🚪</span>
              Logout ({user?.name})
            </button>
          </li>
        </ul>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
