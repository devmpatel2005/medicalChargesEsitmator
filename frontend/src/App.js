import { useState } from "react";
import './App.css';

function App() {

  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [bmi, setBmi] = useState('');
  const [children, setChildren] = useState('');
  const [smoker, setSmoker] = useState('');
  const [region, setRegion] = useState('');

  const handleSubmit = (submit) => {
    submit.preventDefault();
    const formData = { age, sex, bmi, children, smoker, region };
    console.log("Form data:", formData);
  };

  return (
    <div className="App">
      <h1>Medical Cost Estimator</h1>
      <form onSubmit={handleSubmit}>

        <div id='Age'>
          <label>Age: </label>
          <input 
          type='number' 
          name='age' 
          min='0' 
          value={age} 
          onChange={(submit) => setAge(submit.target.value)}
          />
        </div>

        <div id='Sex'>
          <label>Sex: </label>
          <select 
          name='sexDropdown'
          value={sex}
          onChange={(submit) => setSex(submit.target.value)}
          >
            <option value='Choose Below'></option>
            <option value='male'>Male</option>
            <option value='female'>Female</option>
          </select>
        </div>

        <div id='BMI'>
          <label>BMI: </label>
          <input 
          type='number' 
          step='0.1' 
          name='bmi' 
          min='0'
          value={bmi}
          onChange={(submit) => setBmi(submit.target.value)}
          />
        </div>

        <div id='children'>
          <label>Children: </label>
          <input 
          type='number' 
          name='children' 
          min='0'
          value={children}
          onChange={(submit) => setChildren(submit.target.value)}
          />
        </div>

        <div id='smoker'>
          <label>Smoker: </label>
          <select 
          name='smokerDropdown'
          value={sex}
          onChange={(submit) => setSmoker(submit.target.value)}
          >
            <option value='Choose Below'></option>
            <option value='yes'>Yes</option>
            <option value='no'>No</option>
          </select>
        </div>

        <div id="region">
          <label>Region: </label>
          <select 
          name='regionDropdown'
          value={region}
          onChange={(submit) => setRegion(submit.target.value)}
          >
            <option value='Choose Below'></option>
            <option value='northeast'>Northeast</option>
            <option value='northeast'>Northwest</option>
            <option value='northeast'>Southeast</option>
            <option value='northeast'>Southwest</option>
          </select>
        </div>
        <button type='submit'>Predict</button>

      </form>
    </div>
  );
}

export default App;
