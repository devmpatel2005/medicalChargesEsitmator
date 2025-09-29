import { useState, useEffect, useRef } from "react";
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    age: '',
    sex: '',
    bmi: '',
    children: '',
    smoker: '',
    region: ''
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [bmiCategory, setBmiCategory] = useState('');
  const [estimatedRisk, setEstimatedRisk] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  
  const formRef = useRef(null);
  const resultRef = useRef(null);

  // Real-time form validation
  useEffect(() => {
    const { age, sex, bmi, children, smoker, region } = formData;
    const errors = {};
    
    if (age && (age < 0 || age > 120)) {
      errors.age = 'Age must be between 0 and 120';
    }
    if (bmi && (bmi < 10 || bmi > 100)) {
      errors.bmi = 'BMI must be between 10 and 100';
    }
    if (children && (children < 0 || children > 20)) {
      errors.children = 'Children must be between 0 and 20';
    }
    
    setFieldErrors(errors);
    setIsFormValid(age && sex && bmi && children && smoker && region && Object.keys(errors).length === 0);
  }, [formData]);

  // BMI category calculation
  useEffect(() => {
    if (formData.bmi) {
      const bmi = parseFloat(formData.bmi);
      if (bmi < 18.5) setBmiCategory('Underweight');
      else if (bmi < 25) setBmiCategory('Normal weight');
      else if (bmi < 30) setBmiCategory('Overweight');
      else setBmiCategory('Obese');
    } else {
      setBmiCategory('');
    }
  }, [formData.bmi]);

  // Risk estimation
  useEffect(() => {
    if (formData.age && formData.smoker && formData.bmi) {
      let risk = 'Low';
      const age = parseInt(formData.age);
      const bmi = parseFloat(formData.bmi);
      
      if (formData.smoker === 'yes') risk = 'High';
      else if (age > 50 || bmi > 30) risk = 'Medium';
      else if (age > 40 || bmi > 25) risk = 'Low-Medium';
      
      setEstimatedRisk(risk);
    } else {
      setEstimatedRisk('');
    }
  }, [formData.age, formData.smoker, formData.bmi]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
    setShowSuccess(false);
  };

  const validateForm = () => {
    const { age, sex, bmi, children, smoker, region } = formData;
    if (!age || !sex || !bmi || !children || !smoker || !region) {
      setError('Please fill in all fields');
      return false;
    }
    if (Object.keys(fieldErrors).length > 0) {
      setError('Please fix the highlighted errors');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const data = await response.json();
      const predictionValue = data.predicted_charges;
      
      setPrediction(predictionValue);
      setShowSuccess(true);
      
      // Add to history
      const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        data: { ...formData },
        prediction: predictionValue,
        bmiCategory,
        risk: estimatedRisk
      };
      
      setPredictionHistory(prev => [historyEntry, ...prev.slice(0, 4)]); // Keep last 5
      
      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (err) {
      setError('Failed to get prediction. Please check if the backend server is running.');
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      age: '',
      sex: '',
      bmi: '',
      children: '',
      smoker: '',
      region: ''
    });
    setPrediction(null);
    setError(null);
    setShowSuccess(false);
    setFieldErrors({});
    setBmiCategory('');
    setEstimatedRisk('');
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low-Medium': return '#10b981';
      case 'Low': return '#059669';
      default: return '#6b7280';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const clearHistory = () => {
    setPredictionHistory([]);
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="header-content">
            <h1 className="title">
              <span className="title-icon">🏥</span>
              Medical Cost Estimator
            </h1>
            <p className="subtitle">
              Get an accurate estimate of your medical insurance charges
            </p>
          </div>
        </header>

        <main className="main-content">
          <div className="form-container">
            <form onSubmit={handleSubmit} className="prediction-form" ref={formRef}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="age" className="form-label">
                    <span className="label-icon">👤</span>
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    min="0"
                    max="120"
                    value={formData.age}
                    onChange={handleInputChange}
                    className={`form-input ${fieldErrors.age ? 'error' : ''}`}
                    placeholder="Enter your age"
                    required
                  />
                  {fieldErrors.age && <span className="field-error">{fieldErrors.age}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="sex" className="form-label">
                    <span className="label-icon">⚥</span>
                    Gender
                  </label>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="bmi" className="form-label">
                    <span className="label-icon">⚖️</span>
                    BMI
                    {bmiCategory && (
                      <span className="bmi-category" style={{ color: getRiskColor(estimatedRisk) }}>
                        ({bmiCategory})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    id="bmi"
                    name="bmi"
                    step="0.1"
                    min="10"
                    max="100"
                    value={formData.bmi}
                    onChange={handleInputChange}
                    className={`form-input ${fieldErrors.bmi ? 'error' : ''}`}
                    placeholder="Enter your BMI"
                    required
                  />
                  {fieldErrors.bmi && <span className="field-error">{fieldErrors.bmi}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="children" className="form-label">
                    <span className="label-icon">👶</span>
                    Children
                  </label>
                  <input
                    type="number"
                    id="children"
                    name="children"
                    min="0"
                    max="20"
                    value={formData.children}
                    onChange={handleInputChange}
                    className={`form-input ${fieldErrors.children ? 'error' : ''}`}
                    placeholder="Number of children"
                    required
                  />
                  {fieldErrors.children && <span className="field-error">{fieldErrors.children}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="smoker" className="form-label">
                    <span className="label-icon">🚭</span>
                    Smoker
                  </label>
                  <select
                    id="smoker"
                    name="smoker"
                    value={formData.smoker}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Option</option>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="region" className="form-label">
                    <span className="label-icon">🗺️</span>
                    Region
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Region</option>
                    <option value="northeast">Northeast</option>
                    <option value="northwest">Northwest</option>
                    <option value="southeast">Southeast</option>
                    <option value="southwest">Southwest</option>
                  </select>
                </div>
              </div>

              {/* Risk Assessment */}
              {estimatedRisk && (
                <div className="risk-assessment">
                  <div className="risk-indicator">
                    <span className="risk-label">Estimated Risk Level:</span>
                    <span 
                      className="risk-badge" 
                      style={{ backgroundColor: getRiskColor(estimatedRisk) }}
                    >
                      {estimatedRisk}
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !isFormValid}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Predicting...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">🔮</span>
                      Get Prediction
                    </>
                  )}
                </button>
              </div>
            </form>

            {prediction !== null && (
              <div className="prediction-result" ref={resultRef}>
                <div className="result-card">
                  <div className="result-header">
                    <h3 className="result-title">Predicted Medical Charges</h3>
                    <div className="result-icon">💰</div>
                  </div>
                  <div className="result-amount">
                    {formatCurrency(prediction)}
                  </div>
                  <div className="result-details">
                    <div className="detail-item">
                      <span className="detail-label">BMI Category:</span>
                      <span className="detail-value">{bmiCategory}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Risk Level:</span>
                      <span 
                        className="detail-value" 
                        style={{ color: getRiskColor(estimatedRisk) }}
                      >
                        {estimatedRisk}
                      </span>
                    </div>
                  </div>
                  <div className="result-note">
                    This is an estimated annual medical insurance cost based on your profile
                  </div>
                </div>
              </div>
            )}

            {/* Prediction History */}
            {predictionHistory.length > 0 && (
              <div className="history-section">
                <div className="history-header">
                  <h3>Recent Predictions</h3>
                  <div className="history-actions">
                    <button 
                      onClick={() => setShowHistory(!showHistory)}
                      className="btn btn-small"
                    >
                      {showHistory ? 'Hide' : 'Show'} History
                    </button>
                    <button 
                      onClick={clearHistory}
                      className="btn btn-small btn-danger"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                
                {showHistory && (
                  <div className="history-list">
                    {predictionHistory.map((entry) => (
                      <div key={entry.id} className="history-item">
                        <div className="history-time">{entry.timestamp}</div>
                        <div className="history-prediction">
                          {formatCurrency(entry.prediction)}
                        </div>
                        <div className="history-details">
                          {entry.data.age}y, {entry.data.sex}, BMI: {entry.data.bmi}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <footer className="footer">
          <p>© 2024 Medical Cost Estimator. Built with React & Machine Learning.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
