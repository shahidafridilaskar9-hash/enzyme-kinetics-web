from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from scipy.integrate import odeint

app = FastAPI(title="EnzymeKinetics.io API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to actual frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimulationRequest(BaseModel):
    k1: float = 0.5
    k_1: float = 0.2
    k2: float = 0.1
    E0: float = 10.0
    S0: float = 100.0
    duration: float = 100.0

def michaelis_menten(y, t, k1, k_1, k2):
    E, S, ES, P = y
    dE_dt  = -k1 * E * S + k_1 * ES + k2 * ES
    dS_dt  = -k1 * E * S + k_1 * ES
    dES_dt =  k1 * E * S - k_1 * ES - k2 * ES
    dP_dt  =  k2 * ES
    return [dE_dt, dS_dt, dES_dt, dP_dt]

@app.post("/simulate")
def simulate_kinetics(req: SimulationRequest):
    # Initial conditions
    y0 = [req.E0, req.S0, 0.0, 0.0] 
    
    # Time points
    # Render 200 points for a smooth frontend chart
    t = np.linspace(0, req.duration, 200)
    
    # Solve ODE
    solution = odeint(michaelis_menten, y0, t, args=(req.k1, req.k_1, req.k2))
    
    E_t  = solution[:, 0].tolist()
    S_t  = solution[:, 1].tolist()
    ES_t = solution[:, 2].tolist()
    P_t  = solution[:, 3].tolist()
    
    Km = (req.k_1 + req.k2) / req.k1
    Vmax = req.k2 * req.E0
    
    # We zip the series into a format Recharts consumes easily
    chart_data = []
    for i in range(len(t)):
        chart_data.append({
            "time": round(t[i], 2),
            "E": round(E_t[i], 2),
            "S": round(S_t[i], 2),
            "ES": round(ES_t[i], 2),
            "P": round(P_t[i], 2)
        })
        
    return {
        "constants": {
            "Km": round(Km, 3),
            "Vmax": round(Vmax, 3)
        },
        "chartData": chart_data
    }
