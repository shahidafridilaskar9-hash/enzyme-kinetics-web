import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Activity } from 'lucide-react'
import './index.css'

function App() {
  const [params, setParams] = useState({
    k1: 0.5,
    k_1: 0.2,
    k2: 0.1,
    E0: 10.0,
    S0: 100.0,
    duration: 100.0
  })

  const [data, setData] = useState([])
  const [constants, setConstants] = useState({ Km: 0, Vmax: 0 })
  const [loading, setLoading] = useState(false)

  const handleParamChange = (e) => {
    const { name, value } = e.target
    setParams(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }))
  }

  const simulateKinetics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })

      if (response.ok) {
        const json = await response.json()
        setData(json.chartData)
        setConstants(json.constants)
      } else {
        console.error("Failed to fetch simulation data")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    simulateKinetics()
  }, []) // Empty dependency array means this runs once on mount

  return (
    <>
      <header>
        <h1><Activity className="inline-block mr-2" /> EnzymeKinetics.io</h1>
        <p>Advanced Michaelis-Menten ODE Simulation Engine</p>
      </header>

      <div className="dashboard">
        <aside className="panel">
          <h2 className="panel-title">Reaction Parameters</h2>
          
          <div className="form-group">
            <label>
              <span>k₁ (E+S binding)</span> 
              <span className="range-val">{params.k1}</span>
            </label>
            <input type="range" name="k1" min="0.01" max="2.0" step="0.01" value={params.k1} onChange={handleParamChange} />
          </div>

          <div className="form-group">
            <label>
              <span>k₋₁ (ES dissociation)</span> 
              <span className="range-val">{params.k_1}</span>
            </label>
            <input type="range" name="k_1" min="0.01" max="2.0" step="0.01" value={params.k_1} onChange={handleParamChange} />
          </div>

          <div className="form-group">
            <label>
              <span>k₂ (Catalytic rate)</span> 
              <span className="range-val">{params.k2}</span>
            </label>
            <input type="range" name="k2" min="0.01" max="2.0" step="0.01" value={params.k2} onChange={handleParamChange} />
          </div>

          <div className="form-group">
            <label>
              <span>[E]₀ Initial Enzyme</span> 
              <span className="range-val">{params.E0}</span>
            </label>
            <input type="range" name="E0" min="1" max="50" step="1" value={params.E0} onChange={handleParamChange} />
          </div>

          <div className="form-group">
            <label>
              <span>[S]₀ Initial Substrate</span> 
              <span className="range-val">{params.S0}</span>
            </label>
            <input type="range" name="S0" min="10" max="500" step="10" value={params.S0} onChange={handleParamChange} />
          </div>
          
          <div className="form-group">
            <label>
              <span>Duration (s)</span> 
              <span className="range-val">{params.duration}</span>
            </label>
            <input type="range" name="duration" min="20" max="300" step="10" value={params.duration} onChange={handleParamChange} />
          </div>

          <button onClick={simulateKinetics} disabled={loading}>
            {loading ? 'Simulating...' : 'Run Simulation'}
          </button>
        </aside>

        <main className="panel">
          <h2 className="panel-title">Kinetics Dynamics Visualization</h2>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#a1a1aa" label={{ value: 'Time (s)', position: 'insideBottom', offset: -10, fill: '#a1a1aa' }} />
                <YAxis stroke="#a1a1aa" label={{ value: 'Concentration (μM)', angle: -90, position: 'insideLeft', offset: 0, fill: '#a1a1aa' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Legend verticalAlign="top" height={36}/>
                <Line type="monotone" dataKey="E" stroke="#3b82f6" strokeWidth={3} dot={false} name="[E] Free Enzyme" />
                <Line type="monotone" dataKey="S" stroke="#ef4444" strokeWidth={3} dot={false} strokeDasharray="5 5" name="[S] Substrate" />
                <Line type="monotone" dataKey="ES" stroke="#8b5cf6" strokeWidth={3} dot={false} name="[ES] Complex" />
                <Line type="monotone" dataKey="P" stroke="#10b981" strokeWidth={3} dot={false} name="[P] Product" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="results-grid">
            <div className="result-card pulse">
              <h3>Michaelis Constant (Km)</h3>
              <p>{constants.Km} μM</p>
            </div>
            <div className="result-card pulse">
              <h3>Max Velocity (Vmax)</h3>
              <p>{constants.Vmax} μM/s</p>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default App
