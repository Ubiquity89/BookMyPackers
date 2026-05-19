# BookMyPackers - Mini Lead Distribution System

A robust full-stack lead generation and fair distribution engine built with **Next.js (App Router)** and **MongoDB/Mongoose**. This application simulates a real-world platform where customer service enquiries are captured, validated against strict duplication constraints, and systematically allocated to service providers in real time according to rigid business priorities and rotation rules.

Focusing strictly on production-grade backend engineering correctness, this system maintains absolute data consistency under concurrent spikes, provides atomic quota guardrails, and guarantees webhook idempotency.

---

## 🌐 Live Deployment
- **Live Demo URL**: [Insert your deployed Vercel link here, e.g., https://book-my-packers.vercel.app]
- **GitHub Repository**: `https://github.com/Ubiquity89/BookMyPackers.git`

---

## 🚀 Key Architectural Features

- **Atomic Quota Controls**: Enforces a strict monthly quota limit (max 10 leads) directly at the database level, avoiding the flaws of application-state dirty reads.
- **Stateful Round-Robin Engine**: Distributes non-mandatory slots fairly across provider pools, persisting rotation states in the database to survive server restarts.
- **Database-Enforced De-duplication**: Implements a compound unique index constraint preventing identical client contact numbers from requesting the same service category twice.
- **Dual-Layered Consistency Operations**: Wraps multi-document creation and distribution logic inside atomic database sessions to completely isolate concurrent mutations.
- **Real-Time Data Sync**: Employs an efficient background polling sync layer (3s intervals) reflecting active provider dashboard tracking seamlessly.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15.2.6 (App Router)
- **Runtime Environment**: Node.js 20+
- **Database Engine**: MongoDB Atlas (Replica Set required for Transactions)
- **ODM Wrapper**: Mongoose 8.24.0
- **Styling Architecture**: Tailwind CSS 4
- **Language**: TypeScript 5

---

## 📁 Project Structure


```

├── app/
│   ├── api/
│   │   ├── dashboard/       # Aggregated state provider metrics
│   │   ├── leads/           # Core ingestion & transactional distribution pipeline
│   │   ├── webhook/         # Idempotent quota reset handler
│   │   ├── seed/            # Pre-inserted bootstrap engine
│   │   └── test/            # High-velocity testing utilities
│   ├── dashboard/           # Active provider real-time monitor panel
│   ├── request-service/     # Public customer enquiry form interface
│   ├── test-tools/          # System simulation dashboard (evaluator cockpit)
│   ├── layout.tsx
│   └── page.tsx
├── models/                  # Strictly structured database data schemas
│   ├── Provider.ts
│   ├── Lead.ts
│   ├── Assignment.ts
│   └── AllocationState.ts
├── services/                # Decoupled core business domain logic
│   └── allocator.ts         # Multi-tiered atomic assignment router
└── lib/                     # Connections, initializers, and static rules

```

---

## 🧠 Core Engineering Explanations (Evaluator Reference)

### 1. Allocation Algorithm & Fairness
The distribution engine runs a deterministic three-tier hierarchy to attach **exactly 3 unique providers** per lead:
1. **Mandatory Allocation**: Evaluates the incoming `serviceType` against business prerequisites (e.g., Service 3 forces Provider 1 & 4). If they have remaining capacity, they are assigned immediately.
2. **Fair Rotational Distribution**: Unfilled slots are completed using a stateful Round-Robin sequence across strict provider subsets. The last allocation tracking index (`currentIndex`) is safely locked inside an `AllocationState` document, preventing identical providers from being repeatedly favored.
3. **Fallback Exhaustion Search**: If pool limits are reached, a comprehensive secondary loop sweeps the wider provider network to find any active open slots.

### 2. Concurrency & Race-Condition Defense
Traditional architectures introduce a "Read-Then-Write" flaw where multiple concurrent requests check a provider's capacity, see open availability, and double-allocate, plunging quotas into negative balances (e.g., `-2/10`).

This system eliminates race conditions through two critical layers:
- **Database Atomic Matching**: The application does not check quotas in memory. It passes a native conditional statement `$expr` directly into an atomic Mongo `findOneAndUpdate` action:
  ```typescript
  { $expr: { $lt: ["$leadsAssigned", "$monthlyQuota"] } }

```

If 10 requests hit a provider with 1 open slot simultaneously, only one succeeds the database update. The remaining 9 immediately return `null` and safely cycle to the next rotational candidate.

* **Managed Sessions & Transactions**: Lead generation and allocator updates are tightly coupled inside `session.withTransaction()`. Any database collision or downstream assignment drop initiates a total rollback, preventing orphaned "phantom leads" from polluting database structures.

### 3. Webhook Idempotency Assurance

The `/api/webhook` subscription reset framework guarantees that receiving duplicate API flags from external payment gateways will never duplicate backend side effects:

* Every event processes alongside an external unique transaction token.
* A dedicated tracking collection validates the token atomically prior to resetting quota models. If the unique signature is detected a second time, the action is bypassed, returning a clean `200 OK` handshake response without executing redundant mutations.

---

## ⚙️ Getting Started

### Installation & Prerequisites

Ensure you have **Node.js 20+** and access to a **MongoDB Replica Set** cluster (such as a free MongoDB Atlas instance) to allow transactional multi-document operations.

1. **Clone the project repository:**
```bash
git clone [https://github.com/Ubiquity89/BookMyPackers.git](https://github.com/Ubiquity89/BookMyPackers.git)
cd BookMyPackers

```


2. **Install project dependencies:**
```bash
npm install

```


3. **Configure Environment Variables:**
Create a `.env.local` file directly inside the root folder:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/bookmypackers?retryWrites=true&w=majority

```


4. **Boot the Local Server:**
```bash
npm run dev

```


Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) inside your local web browser.

---

## 📋 Evaluation Walkthrough Manual

Navigate to `/test-tools` (the simulation panel) to instantly trigger system behavior metrics:

1. **Seed Base State**: Hit the reset button to instantly establish the base 8 providers populated with clean `10/10` open quotas.
2. **Concurrency Verification**: Hit the **"Generate 10 leads instantly"** button. This fires massive parallel requests inside the exact same millisecond window. Navigate to `/dashboard` to observe the quotas perfectly capping exactly at `0/10 Remaining Quota` with **zero** negative values.
3. **De-duplication Check**: Attempt to submit two leads utilizing identical phone contacts targeting the same service branch via `/request-service`. The application safely rejects the entry at the database level with a `400 Bad Request` validation message.
4. **Idempotency Check**: Trigger the webhook simulation repeatedly. The state updates smoothly once and completely ignores duplicate incoming payloads.

```

```
