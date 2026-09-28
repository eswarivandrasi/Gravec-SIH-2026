# CYCLONEFUSION AI

> **Tagline:** *Detect. Understand. Predict. Explain. Alert.*  
> **Smart India Hackathon 2026 — Problem Statement SIH26070**  
> **Topic:** AI/ML Based Identification, Classification and Prediction of Tropical Cyclone Patterns Using Multi-Source Satellite Data with Inclusive Voice Alert System.

---

## 🌟 Key Highlights & SIH Innovations

1. **Multi-Source Satellite & Atmospheric Fusion:** Fuses INSAT-3DR thermal infrared, Doppler radar imagery, and ocean thermodynamic observations (SST, barometric pressure anomaly, 10-minute sustained winds).
2. **Cyclone Fingerprint Generation:** Computes standardized 8-dimensional normalized feature embeddings representing spatial-temporal cyclone states for instant similarity matching.
3. **Historical Pattern Similarity Engine:** Vector cosine and Euclidean similarity search over North Indian Ocean historical ground-truth archive (Amphan, Fani, Hudhud, Vardah, Michaung, Phailin) with mandatory disclaimer: *"Historical similarity does not guarantee future behavior."*
4. **Explainable AI (XAI) Attribution Module:** Decomposes prediction into human-interpretable feature contribution weights (SHAP/Rule hybrid) with explicit meteorological evidence points.
5. **Inclusive Voice Alert System (IVR):** Delivers automated emergency voice calls to non-smartphone and feature-phone users in **Telugu**, **Hindi**, and **English** with real-time interactive DTMF keypad navigation.
6. **Live Geospatial Tracking (Leaflet):** Real-time storm eye track, 70% confidence cone of uncertainty, destructive gale wind radii (64kt, 50kt, 34kt), and coastal shelter occupancy map.
7. **Offline Demo Mode:** Fully functional out-of-the-box without requiring live satellite APIs or paid third-party services, clearly labeled as **DEMO DATA**.

---

## 🏗️ System Architecture

```
Multi-Source Ingestion (INSAT-3DR TIR1 / CSV Telemetry)
                     │
                     ▼
          Data Validation & Quality Checks
                     │
                     ▼
     Feature Extraction & Multi-Source Fusion
                     │
                     ▼
        Cyclone Fingerprint Generator (8D Vector)
        ┌────────────┴────────────┐
        ▼                         ▼
IMD Classification       Historical Similarity Engine
(Dvorak Category 1-5)    (Top 5 Analogues: Amphan, Fani...)
        │                         │
        ▼                         ▼
Sequential Trend Model   Explainable AI (XAI Attribution)
(12h/24h/48h Forecast)   (Thermodynamic & Satellite Evidence)
        └────────────┬────────────┘
                     ▼
       Disaster Command Dashboard & Map
                     │
                     ▼
       Emergency Multi-Channel Alert Engine
                     │
                     ▼
 Inclusive Voice Alert System (IVR) / Keypad Simulation
        [ 1: Repeat | 2: Safety | 3: Shelters | 4: Language | 5: End ]
        (Telugu / Hindi / English Live Speech Synthesis)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Run Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Swagger Documentation: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### 2. Run Frontend (React + Vite + Leaflet)
```bash
cd frontend
npm install
npm run dev
```
- Open browser at: `http://localhost:5173`

---

## 🎬 3–5 Minute Hackathon Presentation Demo Flow

Follow this exact sequence to demonstrate the entire working prototype to evaluators:

| Step | Action | Feature Highlight |
| :--- | :--- | :--- |
| **1** | Open `http://localhost:5173` | **Dashboard**: Active storm count, live status badges, Doppler radar overview. |
| **2** | Inspect **Active Storms Table** | Shows **Cyclone VAYU-26 (VSCS Cat 3)** in the Bay of Bengal. |
| **3** | Click **"Launch AI Cyclone Studio"** | Opens **Cyclone Studio & XAI Inspection Page** (`/cyclones/1`). |
| **4** | Inspect **Satellite Imagery** | High-resolution synthetic INSAT-3DR Thermal IR view with spiral rainbands & eyewall crosshairs. |
| **5** | Inspect **Environmental Data Table** | Sequential barometric pressure drop (-4.2 hPa) and elevated SST (30.5°C). |
| **6** | Click **"Run AI Analysis"** | Executes the full multi-source AI/ML pipeline in real time. |
| **7** | View **Cyclone Identification** | Model reports: `Cyclone Detected` with **96.5% Probability**. |
| **8** | View **IMD Classification** | Classified as **Very Severe Cyclonic Storm (VSCS - Category 3)**. |
| **9** | View **Cyclone Fingerprint** | Displays structured 8-D normalized embedding matrix & vector payload. |
| **10** | View **Historical Pattern Matches** | Top 5 historical analogues (Amphan, Fani, Hudhud...) with mandatory disclaimer. |
| **11** | View **Trend Prediction** | Predicts **Intensifying** with 24h projected wind of **160 km/h**. |
| **12** | View **Explainable AI (XAI)** | Feature contribution bars and scientific meteorological evidence bullet points. |
| **13** | View **Geospatial Tracking Map** | Interactive Leaflet track, 70% cone of uncertainty, gale wind radii, coastal shelters. |
| **14** | Click **"Generate Alert"** | Selects high-risk coastal districts (*Visakhapatnam, Kakinada, Srikakulam*). |
| **15** | Broadcast alert & launch **IVR** | Triggers automated mass alert; launches simulated keypad feature phone. |
| **16** | Click **"Call User"** on Phone | Simulates incoming emergency call with live browser voice audio! |
| **17** | Listen to **Voice Message** | Audio synthesizer reads out official cyclone advisory. |
| **18** | Press **Keypad Buttons (1–5)** | Keypad interaction: `1` Repeat Alert, `2` Safety Dos & Don'ts, `3` Shelters. |
| **19** | Press **Key `4` → Key `1`** | Switches language to **Telugu (తెలుగు)**. |
| **20** | Listen to **Telugu Voice Alert** | Speaks *"నమస్కారం. మీ ప్రాంతానికి తుఫాను తీవ్ర హెచ్చరిక జారీ చేయబడింది..."* |
| **21** | Open **Alert Center** (`/alerts`) | Verifies dispatched alert and complete DTMF audit trail stored in history. |

---

## 🔒 Security & RBAC Personas

- **NDRF Admin Officer:** `9876543210` / `adminpassword123` (Full broadcast, threshold tuning, audit logs).
- **IMD Lead Analyst:** `9876543211` / `analystpassword123` (AI analysis, XAI attribution, model metrics).
- **Coastal Citizen (Telugu):** `9876543212` / `citizen123` (IVR voice alerts, shelter locator).

---

## 🐳 Docker Deployment

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
