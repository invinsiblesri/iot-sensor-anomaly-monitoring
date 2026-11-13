# IoT Sensor Data Anomaly Monitoring System

[![Node.js Version](https://img.shields.io/badge/Node.js-v24.x-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v19.x-blue.svg)](https://react.dev/)
[![Express Version](https://img.shields.io/badge/Express-v4.x-lightgrey.svg)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

> **Academic Department-Level Comprehensive Assessment Project (Academic Year 2026–2027)**  
> **Student Specialization:** Information Technology  
> **Interdisciplinary Integration:** Full-Stack Web Development (FSWD) + Computer Networks (CN) + Formal Languages and Automata Theory (FLAT)

---

## 1. Project Overview

The **IoT Sensor Data Anomaly Monitoring System** is an industrial-grade simulated IoT management and telemetry anomaly platform. It continuously receives multi-parameter sensor readings (Temperature, Humidity, Pressure) from distributed IoT devices (`IOT-001` through `IOT-005`), validates the incoming frames using strict **Formal Regular Expressions**, and classifies operational health using a **4-State Deterministic Finite Automaton (DFA)** with zero non-determinism.

### Monitored Sensor Metrics & Initial Ranges
- **Temperature (°C):** Normal (18°C – 30°C) | Warning (5°C – 18°C or 30°C – 40°C) | Faulty (< 5°C or > 40°C)
- **Humidity (%):** Normal (30% – 60%) | Warning (15% – 30% or 60% – 80%) | Faulty (< 15% or > 80%)
- **Atmospheric Pressure (hPa):** Normal (980 – 1030 hPa) | Warning (950 – 980 hPa or 1030 – 1050 hPa) | Faulty (< 950 or > 1050 hPa)

---

## 2. Directory Structure

```
PROJECT1/
├── frontend/                   # React 18 / Vite SPA Client
│   ├── public/                 # Static web assets
│   ├── src/
│   │   ├── assets/             # Images, SVGs, and branding assets
│   │   ├── components/         # Reusable UI widgets & status badges
│   │   ├── context/            # React Context (Device, Alerts, Telemetry)
│   │   ├── hooks/              # Custom React hooks (usePolling, useNetworkStats)
│   │   ├── layouts/            # Sidebar navigation and header wrappers
│   │   ├── pages/              # 10 dedicated application pages
│   │   ├── services/           # Axios REST API client modules
│   │   ├── utils/              # Client-side formatting & threshold helpers
│   │   ├── App.jsx             # SPA Route Router configuration
│   │   ├── index.css           # Global industrial dark theme design tokens
│   │   └── main.jsx            # React root mount
│   ├── .env.example            # Frontend environment variable template
│   ├── package.json            # Frontend dependencies & scripts
│   ├── vercel.json             # Vercel SPA routing rewrite rules
│   └── vite.config.js          # Vite build and plugin configurations
│
├── backend/                    # Node.js & Express.js REST API Server
│   ├── config/                 # DB connection and system presets
│   ├── models/                 # Mongoose schema definitions
│   ├── controllers/            # HTTP request/response handlers
│   ├── routes/                 # REST API route endpoints
│   ├── services/               # Core business logic services
│   ├── middleware/             # Error handlers, CORS, logging, validators
│   ├── automata/               # FLAT: 4-State DFA Class and Alphabet Evaluator
│   ├── validators/             # FLAT: Formal Regular Expression Engine
│   ├── simulation/             # IoT Synthetic Sensor Generation Engine
│   ├── utils/                  # Date helpers, formatters, and loggers
│   ├── server.js               # Express server entry point
│   ├── .env.example            # Backend environment template
│   └── package.json            # Backend dependencies & scripts
│
├── database/                   # Database scripts
│   ├── seed.js                 # Initial device and settings seeding script
│   └── README.md               # Seeding and connection instructions
│
├── docs/                       # Project academic documentation
│   ├── architecture/           # System architecture documents
│   ├── diagrams/               # Mermaid & UML diagrams
│   ├── api-documentation/      # REST API contracts and payloads
│   ├── flat-documentation/     # Automata & Regex proofs and matrices
│   ├── cn-documentation/       # OSI & TCP/IP layer mapping reports
│   ├── screenshots/            # Demonstration and test evidence
│   └── test-cases/             # Test execution matrices
│
├── .gitignore                  # Git repository exclusion rules
└── README.md                   # Project master documentation
```

---

## 3. Quick Start Guide (Local Development)

### Prerequisites
- **Node.js** (v18.x or newer, tested on v24.11.1)
- **npm** (v9.x or newer, tested on 11.6.4)
- **Git**

### Installation

1. **Clone or Open Project:**
   ```bash
   cd C:\Users\sradh\Desktop\PROJECT1
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm start
   # Server listens on http://localhost:5000
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   npm run dev
   # Vite dev server runs at http://localhost:5173
   ```

---

## 4. Phase Roadmap

- [x] **Phase 1:** Project analysis and system architecture blueprint.
- [x] **Phase 2:** GitHub folder structure, dependencies, and environment setup.
- [ ] **Phase 3:** MongoDB Atlas configuration and Mongoose schemas.
- [ ] **Phase 4:** Express backend and REST APIs.
- [ ] **Phase 5:** Regular Expression validation implementation.
- [ ] **Phase 6:** DFA implementation and transition engine.
- [ ] **Phase 7:** IoT sensor simulation engine.
- [ ] **Phase 8:** Alert generation and state transition history.
- [ ] **Phase 9:** React frontend development.
- [ ] **Phase 10:** Frontend and backend integration.
- [ ] **Phase 11:** Comprehensive testing and bug fixing.
- [ ] **Phase 12:** Vercel deployment.
- [ ] **Phase 13:** Render deployment.
- [ ] **Phase 14:** MongoDB Atlas production configuration.
- [ ] **Phase 15:** Final documentation, diagrams, screenshots, and faculty demonstration preparation.
