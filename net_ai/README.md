# NetSage AI – Network Troubleshooting Assistant

NetSage AI is a small, rule-based troubleshooting assistant for network engineers and students. It accepts symptom descriptions, topology notes, and Cisco IOS output, then suggests a likely cause, confidence score, OSI layer, evidence, a next command, and troubleshooting steps. Diagnoses are saved locally as JSON and can be reviewed by a human.

> This repository did not contain application source when inspected. This implementation was created from the supplied project specification. The diagnosis engine is an explainable starter ruleset, not a machine-learning model or a substitute for engineering judgment.

## Problem statement

Network troubleshooting often starts with scattered symptoms, topology details, and device output. NetSage AI brings those clues together in one place and gives learners a repeatable starting point for investigation.

## Objectives

- Capture symptoms, topology, and command output in one report.
- Return an explainable rule-based diagnosis with a confidence estimate.
- Recommend a useful next Cisco IOS command and concrete follow-up steps.
- Keep a local history and support human acceptance, editing, or rejection.
- Provide a simple authenticated web interface and JSON REST API.

## Key features

- Email/password registration and login with signed JWT bearer tokens.
- Rule checks for physical links, DHCP, DNS, routing, VLAN, and filtering symptoms.
- Confidence, OSI layer, supporting evidence, next command, and remediation steps.
- JSON-backed diagnosis history and reviewer decision endpoints.
- Optional `.pkt` / `.pka` upload (10 MB maximum). Files are stored locally in `backend/uploads/`; this version does not inspect Packet Tracer contents.
- Static responsive frontend served by the Express server.

## System architecture

```text
Browser (HTML/CSS/JavaScript)
        │  REST /api requests + JWT
        ▼
Express server ── auth routes (scrypt password hashes, JWT)
        ├──────── diagnosis routes ── ruleEngine.js
        ├──────── Multer local file intake
        └──────── db.js ── backend/data/*.json
```

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js 18+, Express, REST, JSON Web Tokens, Multer |
| Storage | Local JSON files |
| Diagnosis | Deterministic rule-based engine |

The current interface uses plain CSS and does not depend on Tailwind CSS or Chart.js. The JSON files are intended for a local prototype and are not a concurrent or production database.

## Project structure

```text
net_ai/
├── backend/
│   ├── data/
│   │   ├── diagnoses.json
│   │   └── users.json
│   ├── middleware/auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── diagnoses.js
│   ├── uploads/.gitkeep
│   ├── db.js
│   ├── ruleEngine.js
│   └── server.js
├── frontend/
│   ├── css/style.css
│   ├── js/{api.js,app.js}
│   └── index.html
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Installation

Requirements: Node.js 18 or newer and npm.

```bash
cd net_ai
npm install
```

Copy `.env.example` to `.env`, then set a unique, private JWT secret. Keep `.env` out of version control.

```env
PORT=5000
JWT_SECRET=replace_with_a_long_random_secret
```

## Run the application

```bash
npm start
```

Open [http://localhost:5000](http://localhost:5000). For automatic server restarts during development, use `npm run dev`.

## How to use

1. Create an account or sign in. The first account created in a fresh local data store is assigned the reviewer role; subsequent accounts are engineers.
2. Enter one or more of symptoms, topology, or Cisco IOS output, then choose **Analyze issue**.
3. Review the suggested cause, confidence, OSI layer, evidence, next command, and steps.
4. A reviewer can accept or reject pending reports. The API also supports editing a diagnosis using the `edited` review status and a replacement `diagnosis` object.
5. Optionally upload a Packet Tracer `.pkt` or `.pka` file for local reference. Uploaded files are not parsed or included in the diagnosis.

## Sample troubleshooting input

```text
Symptoms: Users on the office LAN cannot reach the internet. The router uplink reports line protocol down.
Topology: PCs → access switch → edge router → ISP
Cisco IOS output: GigabitEthernet0/1 is up, line protocol is down
```

## Example diagnosis

```json
{
  "cause": "Physical link or interface is down",
  "confidence": 0.91,
  "osiLayer": "Layer 1 – Physical",
  "evidence": "The symptoms indicate a missing carrier or an administratively/down interface.",
  "nextCommand": "show interfaces status",
  "steps": [
    "Check cable, transceiver, and peer port.",
    "Confirm the interface is enabled with no shutdown.",
    "Review speed and duplex settings at both ends."
  ]
}
```

## API overview

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/diagnoses` | List diagnoses (JWT required) |
| `POST` | `/api/diagnoses` | Create a diagnosis (JWT required) |
| `POST` | `/api/diagnoses/upload` | Upload a Packet Tracer file (JWT required) |
| `PATCH` | `/api/diagnoses/:id/review` | Accept, edit, or reject (reviewer JWT required) |

Send protected requests with `Authorization: Bearer <token>`. Registration and login return the token.

## Future enhancements

- Parse Packet Tracer project data where a safe, supported parser is available.
- Add richer rules, test fixtures, and evidence extraction from command output.
- Add database migrations, role administration, rate limiting, and audit history.
- Add reviewer editing controls and analytics charts to the interface.
- Add Tailwind CSS and Chart.js if utility styling and interactive charts are needed.
- Add deployment configuration, automated integration tests, and production security review.

## Contributors

- NetSage AI project contributors
