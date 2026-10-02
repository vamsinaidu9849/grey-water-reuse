import React from 'react';
import { NavLink } from 'react-router-dom';
import { FlaskConical, Brain, Database, Faucet, Leaf, Globe, Shield, AlertTriangle, ArrowRight, Table } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import heroImg from '../assets/hero_water_ai.jpg';

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg-dark)', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <span className="section-subtitle"><FlaskConical size={16} /> Intelligent Environmental Analytics</span>
          <h1>AI-Powered <span className="gradient-text">Greywater Reuse</span> Intelligence</h1>
          <p className="hero-description">
            Analyze greywater quality parameters, evaluate reuse suitability across non-potable pathways, and generate intelligent, data-driven reuse recommendations.
          </p>

          <div className="hero-buttons">
            <NavLink to="/recommendations" className="btn btn-primary btn-lg"><Brain size={20} /> Start AI Analysis</NavLink>
            <NavLink to="/dataset" className="btn btn-secondary btn-lg"><Table size={20} /> Explore Dataset</NavLink>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">16+</span>
              <span className="stat-label">Parameters</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">94.5%</span>
              <span className="stat-label">AI Confidence</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5</span>
              <span className="stat-label">Reuse Pathways</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Data-Driven</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-img-card glass-card">
            <img src={heroImg} alt="GreyAI Hero Visual" />
          </div>
        </div>
      </header>

      {/* How GreyAI Works */}
      <section className="section">
        <div className="section-header">
          <span className="section-subtitle">System Workflow</span>
          <h2 className="section-title">How GreyAI Works</h2>
          <p className="section-desc">Five seamless steps from raw greywater quality measurements to decision-support recommendations.</p>
        </div>

        <div className="workflow-grid">
          <div className="glass-card step-card">
            <div className="step-number">1</div>
            <h3 className="step-title">Upload Dataset</h3>
            <p className="step-desc">Upload your CSV dataset containing physical, chemical & biological parameters.</p>
          </div>
          <div className="glass-card step-card">
            <div className="step-number">2</div>
            <h3 className="step-title">Analyze Quality</h3>
            <p class="step-desc">System computes mean, std dev, and compares pH, Turbidity, BOD, COD with standard ranges.</p>
          </div>
          <div className="glass-card step-card">
            <div className="step-number">3</div>
            <h3 className="step-title">AI Prediction</h3>
            <p className="step-desc">Model evaluates parameters to compute Water Quality Score and suitability class.</p>
          </div>
          <div className="glass-card step-card">
            <div className="step-number">4</div>
            <h3 className="step-title">Recommendation</h3>
            <p className="step-desc">Provides approved reuse applications (flushing, garden, landscaping) and treatment steps.</p>
          </div>
          <div className="glass-card step-card">
            <div className="step-number">5</div>
            <h3 className="step-title">Generate Report</h3>
            <p className="step-desc">Export comprehensive research reports and print PDF summaries for presentation.</p>
          </div>
        </div>
      </section>

      {/* Why Greywater Reuse */}
      <section className="section">
        <div className="section-header">
          <span className="section-subtitle">Sustainability & Impact</span>
          <h2 class="section-title">Why Greywater Reuse?</h2>
          <p className="section-desc">Greywater recycling is a critical sustainable water management strategy to combat freshwater scarcity.</p>
        </div>

        <div className="features-grid">
          <div className="glass-card feature-card">
            <div className="feature-icon"><Faucet size={28} /></div>
            <h3>Water Conservation</h3>
            <p>Recycles up to 60% of domestic household wastewater from bathroom washbasins, showers, and laundry.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon"><Leaf size={28} /></div>
            <h3>Reduced Freshwater Demand</h3>
            <p>Substitutes high-grade potable municipal water with treated greywater for toilet flushing and irrigation.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon"><Globe size={28} /></div>
            <h3>Sustainable Management</h3>
            <p>Supports circular water economy principles and urban water sustainability goals.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon"><Shield size={28} /></div>
            <h3>Environmental Protection</h3>
            <p>Prevents untreated greywater discharge into natural streams, reducing nutrient overload and eutrophication.</p>
          </div>
        </div>

        <div className="disclaimer-banner">
          <AlertTriangle className="disclaimer-icon" size={28} />
          <div className="disclaimer-text">
            <h4>Academic Decision-Support Prototype Notice</h4>
            <p>
              This system provides an AI-assisted recommendation based on available water-quality parameters. Real-world greywater reuse decisions require laboratory validation, appropriate physical/chemical treatment, and compliance with applicable local environmental standards and regulations.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
