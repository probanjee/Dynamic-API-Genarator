# ⚡ API Forge

**API Forge** is a full-stack, visual API modeling, AI-assisted development, and endpoint management workspace built for modern engineering teams. It bridges the gap between visual API prototyping, real-time mock server generation, schema design, security auditing, and production code generation.

---

## 💡 Why This Project Was Chosen & The Reason Behind It

Modern backend and API development is often fragmented across multiple disparate tools:
- **API Spec Design**: Writing raw OpenAPI/Swagger YAML or JSON by hand is error-prone and tedious.
- **Frontend-Backend Collaboration**: Frontend teams frequently wait for backend endpoints to be deployed before building interfaces.
- **Schema & Validation Drift**: Keeping database tables, API schemas, and frontend TypeScript interfaces in sync is a constant maintenance headache.
- **Security Bottlenecks**: Vulnerabilities like missing authentication, unhandled CORS, or missing rate-limiting are often caught late in production reviews.

### **The Mission Behind API Forge**
API Forge was created to solve these exact pain points by providing a unified, visual-first platform that accelerates the API lifecycle from concept to code:
1. **Accelerate API Prototyping**: Visually model RESTful endpoints, query parameters, request bodies, and response contracts in seconds.
2. **Eliminate Frontend Blockers**: Instantly generate live mock servers with realistic response payloads and simulated network latency.
3. **AI-Assisted Engineering**: Leverage built-in AI capabilities to generate complete API schemas, optimize middleware configurations, and recommend security hardening techniques from natural language prompts.
4. **Automated Security Guardrails**: Scan API configurations continuously against common OWASP vulnerabilities and receive actionable risk scores (0–100).
5. **Zero Vendor Lock-In**: Export clean, production-ready backend code (Express.js, FastAPI), OpenAPI 3.0 definitions, and client SDKs as standalone ZIP packages.

---

## 🛠️ Tech Stack & Technologies

API Forge is engineered using modern web technologies:

### **Frontend Architecture**
- **Core Framework**: [React 19](https://react.dev/) & [TypeScript 5.9](https://www.typescriptlang.org/)
- **Build System**: [Vite 7](https://vitejs.dev/) with Fast Refresh
- **Styling & UI Components**:
  - [TailwindCSS v4](https://tailwindcss.com/) — Next-gen utility-first CSS engine
  - [Radix UI](https://www.radix-ui.com/) — Accessible primitive UI components (Accordion, Alert Dialog, Dialog, Popover, Select, Tooltip, etc.)
  - [Lucide React](https://lucide.dev/) — Modern icon set
- **State & Data Fetching**:
  - [TanStack React Query v5](https://tanstack.com/query/latest) — Asynchronous state management & caching
  - [tRPC React Query Client](https://trpc.io/) — End-to-end type-safe client calls
- **Visualization & Animation**:
  - [Recharts](https://recharts.org/) — Interactive charts for API performance and security analytics
  - [Framer Motion](https://www.framer.com/motion/) — Fluid UI transitions and micro-animations
- **Routing & Forms**:
  - [Wouter](https://github.com/molefrog/wouter) — Lightweight, hook-based routing
  - [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) — Schema-driven form validation

### **Backend Architecture**
- **Runtime & Server**: Node.js with [Express 4](https://expressjs.com/)
- **API Engine**: [tRPC v11](https://trpc.io/) — Type-safe RPC router eliminating manual API client code
- **Data Serialization**: [SuperJSON](https://github.com/blitz-js/superjson) — Preserves Dates, BigInts, and complex objects over the wire
- **Auth & Security**: [Jose](https://github.com/panva/jose) (JWT signing & verification) and environment-controlled session security

### **Database & ORM**
- **Database Engine**: [MySQL](https://www.mysql.com/) / [MariaDB](https://mariadb.org/)
- **ORM Layer**: [Drizzle ORM v0.44](https://orm.drizzle.team/) — Lightweight, SQL-like TypeScript ORM
- **Migration Engine**: [Drizzle Kit v0.31](https://orm.drizzle.team/kit-docs/overview) — Database schema migrations and generation

### **Cloud, Storage & Testing**
- **Object Storage**: AWS S3 SDK (`@aws-sdk/client-s3`) & Supabase JS Client (`@supabase/supabase-js`)
- **Testing Framework**: [Vitest 2.1](https://vitest.dev/) — Fast unit and integration testing engine
- **Bundling & Execution**: ESBuild & `tsx`

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Client ["Client Layer (React 19 + Vite)"]
        UI["Visual Designer & Dashboard"]
        TRPC_Client["tRPC Client Engine"]
        FormVal["Zod Schema Validator"]
        UI --> TRPC_Client
        UI --> FormVal
    end

    subgraph Server ["Server Layer (Express + tRPC Router)"]
        TRPC_Server["tRPC API Gateway"]
        ProjectRouter["Project & Endpoint Service"]
        SchemaRouter["JSON Schema Generator"]
        AIRouter["AI Assistant Engine"]
        SecurityScanner["Automated Security Auditor"]
        StorageProxy["Mock Engine & Storage Proxy"]
        
        TRPC_Server --> ProjectRouter
        TRPC_Server --> SchemaRouter
        TRPC_Server --> AIRouter
        TRPC_Server --> SecurityScanner
        TRPC_Server --> StorageProxy
    end

    subgraph Storage ["Data & External Services"]
        DB[(MySQL Database / Drizzle ORM)]
        LLM[("OpenAI-Compatible LLM API")]
        S3[("AWS S3 / Storage Provider")]
    end

    TRPC_Client <-->|Type-Safe Queries & Mutations| TRPC_Server
    ProjectRouter <--> DB
    SchemaRouter <--> DB
    SecurityScanner <--> DB
    AIRouter <--> LLM
    StorageProxy <--> S3
```

---

## 📁 Folder Structure

```
api-forge/
├── client/                      # Frontend Application (React 19 + Vite)
│   ├── public/                  # Static assets & client-side scripts
│   │   └── __debug__/           # Browser telemetry & debug collector script
│   └── src/                     # React source files
│       ├── _core/               # Core hooks (useAuth, tRPC provider)
│       ├── components/          # Reusable UI components (AuthDialog, Navigation, Form controls)
│       ├── pages/               # Application view routes (Dashboard, Visual Designer, AI Assistant, etc.)
│       ├── App.tsx              # Main entry layout & wouter route switcher
│       ├── const.ts             # Client constants & auth helpers
│       ├── index.css            # TailwindCSS v4 design system tokens & styles
│       └── main.tsx             # Application bootstrap & DOM root mount
├── drizzle/                     # Database ORM Layer
│   ├── schema.ts                # Drizzle ORM table schema definitions (MySQL)
│   └── drizzle.config.ts        # Drizzle Kit configuration
├── server/                      # Backend Server Engine (Express + tRPC)
│   ├── _core/                   # Framework infrastructure
│   │   ├── context.ts           # tRPC context setup (User session, Express request/response)
│   │   ├── db.ts                # Drizzle ORM client initialization
│   │   ├── index.ts             # Express server setup & middleware
│   │   ├── llm.ts               # AI Assistant integration module
│   │   ├── notification.ts      # Project notification handler
│   │   ├── sdk.ts               # System integration SDK helpers
│   │   ├── storageProxy.ts      # Dynamic asset & mock storage proxy
│   │   └── types/               # Core TypeScript definitions (sdkTypes.ts)
│   ├── apiforge.test.ts         # Integration testing suite
│   ├── auth.logout.test.ts      # Authentication tests
│   ├── db.ts                    # Database connection manager
│   ├── routers.ts               # tRPC API endpoints (projects, endpoints, schemas, AI, scans)
│   └── storage.ts               # Storage helpers & mock response proxy
├── shared/                      # Shared Contracts & Schemas
│   ├── const.ts                 # Cross-platform constants
│   └── schema.ts                # Shared types & Zod validation rules
├── .gitignore                   # Version control exclusion rules
├── components.json              # Shadcn UI configuration manifest
├── package.json                 # Project manifest, scripts, and dependencies
├── README.md                    # Project documentation
├── tsconfig.json                # TypeScript compiler configuration
└── vite.config.ts               # Vite bundler & dev server config
```

---

## 🔥 Skills & Key Capabilities

| Capability | Description |
| :--- | :--- |
| 🎨 **Visual Endpoint Designer** | Graphically model RESTful endpoints with custom paths (`/api/v1/users`), methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`), headers, query params, and status codes. |
| 🧠 **AI-Powered API Generator** | Describe desired APIs in natural language and let the built-in AI Assistant model endpoints, generate Zod/JSON schemas, and suggest security hardening. |
| ⚡ **Live Mock Server & Testing Sandbox** | Dynamic mock responses with customizable payloads and simulated latency so frontend engineers can begin integration immediately. |
| 🛡️ **Automated Security Auditor** | Evaluates API configurations for security flaws (e.g. missing auth, unrestricted CORS, missing rate limits) and provides an instant 0–100 security score with remediation steps. |
| 🔒 **Middleware & Governance** | Configure authentication schemes (JWT, API Key, OAuth2), rate-limiting rules (`100/min`), CORS headers, and audit logs. |
| 📦 **Code & Artifact Exporter** | Package and download OpenAPI 3.0 specifications, production-ready Express.js or FastAPI projects, and TypeScript client SDKs in a single click. |
| 👥 **Team Workspace & RBAC** | Multi-user collaboration with Role-Based Access Control (`OWNER`, `ADMIN`, `DEVELOPER`, `VIEWER`) and detailed audit logging. |

---

## 🚀 Getting Started

### **Prerequisites**
- **Node.js**: `v20.x` or higher
- **Package Manager**: `pnpm` (recommended) or `npm`
- **Database**: MySQL 8.0+ or MariaDB 10.5+

### **1. Clone & Install Dependencies**
```bash
git clone https://github.com/your-username/api-forge.git
cd api-forge
pnpm install
```

### **2. Environment Setup**
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Connection
DATABASE_URL="mysql://user:password@localhost:3306/apiforge"

# Built-in LLM Integration (Optional)
BUILTIN_LLM_URL="https://api.openai.com/v1/chat/completions"
BUILTIN_LLM_KEY="your-llm-api-key"
```

### **3. Push Database Schema**
```bash
pnpm run db:push
```

### **4. Start Development Server**
```bash
pnpm run dev
```
Navigate to `http://localhost:5000` to access API Forge!

---

## 📜 Available NPM Scripts

| Command | Action |
| :--- | :--- |
| `pnpm run dev` | Starts the Express backend + Vite dev server concurrently with hot reload. |
| `pnpm run build` | Builds the client bundle with Vite and compiles server code with ESBuild into `dist/`. |
| `pnpm start` | Launches the compiled production server (`dist/index.js`). |
| `pnpm run check` | Runs `tsc --noEmit` to verify type safety across client and server. |
| `pnpm run test` | Executes the Vitest test suite (`apiforge.test.ts`, `auth.logout.test.ts`). |
| `pnpm run db:push` | Generates and applies Drizzle ORM database migrations. |
| `pnpm run format` | Formats codebase using Prettier. |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
