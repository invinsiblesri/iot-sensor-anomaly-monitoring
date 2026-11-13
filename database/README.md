# Database Configuration & Seeding Guide

## Overview
This directory contains the database seeding scripts and initialization routines for the **IoT Sensor Data Anomaly Monitoring System**.

## Collections Managed
1. `devices`: Holds registered IoT device records (e.g., `IOT-001` through `IOT-005`).
2. `sensorreadings`: Stores time-series telemetry records (Temperature, Humidity, Pressure, Validation Status).
3. `alerts`: Stores anomaly alerts (Warning, Faulty, Disconnected) with severity and acknowledgement flags.
4. `statetransitions`: Stores deterministic state transition audit logs from the DFA.
5. `systemsettings`: Persists threshold parameters and operational timeouts.

## Running the Seed Script
To populate initial devices and baseline system configuration:
```bash
# From the backend directory:
npm run seed
```

## Security Best Practice
- Never commit credentials to version control.
- Always use the `MONGODB_URI` environment variable defined in `backend/.env`.
