# DiagnoGuide 🏥

> An interactive 3D virtual diagnostic hospital explainer, walkthrough, and patient guidance platform.

DiagnoGuide provides patients with an interactive, source-backed virtual walkthrough of modern clinical diagnostic rooms. It features detailed equipment breakdowns, technical principles, interactive checklists, accessibility controls, and a hospital directory.

---

## 🌟 Key Features

- **Interactive 3D Virtual Hospital Walkthrough**: Navigate through specialized diagnostic imaging and laboratory rooms with smooth camera controls and direct room jumping.
- **9 Diagnostic Specialty Suites**:
  1. **Digital 3D Mammography (Tomosynthesis)**: Low-dose arc imaging and reconstructed thin planes.
  2. **Pelvic Ultrasound**: Real-time high-frequency acoustic imaging.
  3. **Breast Ultrasound**: Targeted radiation-free soft tissue characterization.
  4. **LBC & HPV Screening Lab**: Liquid-based cytology and molecular assay workflows.
  5. **Pelvic MRI at 3 T**: High-field non-ionizing multiparametric visualization.
  6. **Ultrasound-Guided Breast Core Biopsy**: Live target tracking and precise tissue sampling.
  7. **DEXA (Dual-Energy X-ray Absorptiometry)**: Bone mineral density quantification.
  8. **Fetal Anatomy & Doppler Ultrasound**: Developmental assessment and hemodynamics.
  9. **Endocrine & Metabolic Analyzer**: Automated immunoassay and clinical chemistry.
- **Patient Preparedness Checklists**: Pre-appointment prompt checklists (dietary, attire, implants/metal, medication consultation, and results follow-up).
- **Hospital & Diagnostic Center Directory**: Search and explore nearby medical centers, equipment availability, and facility contact details.
- **Accessibility Modes**: Integrated controls for reduced motion, high-contrast reading mode, and adjustable text sizing.
- **Authentication & Secure Session Management**: User login, registration, and credential migration support.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **TypeScript**
- **Vite 7**
- **Tailwind CSS 4** + **Radix UI** primitives
- **Lucide Icons**
- **Wouter** (Client-side routing)
- **tRPC Client** + **TanStack React Query**
- **Framer Motion** & **Embla Carousel**

### Backend
- **Node.js** with **Express**
- **tRPC v11** for end-to-end type-safe APIs
- **Drizzle ORM** with MySQL / relational schema migrations
- **Jose** for secure authentication tokens and session cookies
- **Vitest** for unit and integration testing

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ installed
- pnpm (recommended) or npm / yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kodurumanideep78-create/diagnoguide.git
   cd diagnoguide
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory (refer to `server/_core/env.ts` for configuration variables).

4. Push the database schema:
   ```bash
   pnpm db:push
   ```

5. (Optional) Seed room data:
   ```bash
   pnpm db:seed
   ```

6. Start the development server:
   ```bash
   pnpm dev
   ```

---

## 📁 Project Structure

```
diagnoguide/
├── client/                     # Frontend client application
│   ├── public/                 # Static assets
│   └── src/
│       ├── _core/              # Authentication and core client hooks
│       ├── components/         # Reusable UI & 3D scene components
│       ├── contexts/           # Theme and state providers
│       ├── lib/                # Room definitions, tRPC client, utilities
│       └── pages/              # Application pages (Home, Auth, Showcase)
├── drizzle/                    # Database schema and SQL migrations
├── server/                     # Backend API server
│   ├── _core/                  # Server configuration, context, tRPC engine
│   ├── routers/                # API routers (auth, room data, hospital listings)
│   ├── db.ts                   # Database connection
│   └── seedRooms.ts            # Seed script for diagnostic rooms
├── shared/                     # Shared TypeScript types and constants
└── patches/                    # Package patches (e.g. wouter)
```

---

## 📜 License

This project is licensed under the MIT License - see the [package.json](package.json) file for details.
