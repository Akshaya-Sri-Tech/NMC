# 🚀 SANGAM-IN

### **Standardised And National Gateway for All Materials — INdia**

> **AI-driven material standardization, probabilistic matching, and cross-CPSE material intelligence.**

**Smart India Hackathon 2026 · SIH26099 · Team ByteBeez · Team ID 158808**

---

## 🔥 What We Built

**SANGAM-IN** transforms fragmented material records across CPSEs into **standardized, explainable, and traceable material identities**.

The platform combines:

* **Deterministic data processing**
* **Probabilistic material matching**
* **AI-assisted reasoning**
* **Human validation**
* **NMC mapping**
* **Legacy material traceability**

### **Core Workflow**

```text
Material Data
      ↓
Standardization & Extraction
      ↓
UNSPSC / Category Blocking
      ↓
Probabilistic Matching
      ↓
Confidence + AI Reasoning
      ↓
Human Validation
      ↓
NMC / Standard Material Mapping
      ↓
Legacy Traceability
```

> **Our core principle:** AI assists the system — it does not replace the underlying engineering.

---

# 🧠 Our Approach

## **01 · Standardize**

Material descriptions are converted into structured, comparable data using:

* **Registry-backed terminology**
* **Rule-based normalization**
* **Unit standardization**
* **Parameter extraction**
* **AI assistance for unresolved cases**

### **AI Is Not Used Blindly**

Known registries and deterministic rules are checked first. AI is used only when additional reasoning is required.

This helps reduce:

**Unnecessary AI calls → Lower inference cost → Lower latency**

---

## **02 · Match**

Instead of comparing every material with every other material, SANGAM-IN narrows the search space first.

**UNSPSC / Category Blocking**
↓
**Attribute-Level Comparison**
↓
**Splink 4 + DuckDB**
↓
**Fellegi-Sunter Probabilistic Scoring**

This gives us a **CPU-first matching architecture** without making GPU-based semantic search a requirement for the core matching engine.

---

## **03 · Explain**

For uncertain relationships, the AI reasoning layer helps identify:

* **Similar attributes**
* **Differences**
* **Relevant technical parameters**
* **Reasoning behind the proposed relationship**

The AI explanation supports the decision — it does not replace the matching evidence.

---

## **04 · Validate**

Ambiguous material relationships are routed through a **Human-in-the-Loop** workflow.

```text
Machine Analysis
      ↓
Confidence + Evidence
      ↓
AI Explanation
      ↓
Human Validation
      ↓
Approved Master Mapping
```

This is important for industrial material data where **similar descriptions do not necessarily mean technical equivalence**.

---

## **05 · Map**

Validated materials are connected to their standardized identity while retaining their original identifiers.

### **Traceability**

```text
CPSE
 ↓
SAP / ERP Plant
 ↓
Legacy Material Number
 ↓
NMC
 ↓
Standard Material
```

This provides a structured migration path without losing historical material relationships.

---

# ⚡ What Makes SANGAM-IN Different?

| **Typical AI Approach**   | **SANGAM-IN**                               |
| ------------------------- | ------------------------------------------- |
| LLM everywhere            | **Deterministic processing + selective AI** |
| LLM as matching engine    | **Dedicated probabilistic matching**        |
| Pure text similarity      | **Attribute-level comparison**              |
| Brute-force comparison    | **Candidate blocking**                      |
| Black-box decisions       | **Confidence + supporting evidence**        |
| Fully automated decisions | **Human validation for ambiguity**          |
| Replace legacy data       | **Preserve legacy traceability**            |
| GPU-heavy matching        | **CPU-first core matching**                 |

### **The Engineering Idea**

> **Use deterministic logic where possible, probabilistic intelligence where useful, and AI where it adds reasoning value.**

---

# 🏭 Enterprise-Oriented Design

SANGAM-IN is designed around **enterprise master-data principles**, rather than treating the project as an LLM application.

### **Key Design Decisions**

**Deterministic-first processing**
Known transformations are handled through rules and registries.

**Probabilistic entity resolution**
Material relationships are determined using statistical record linkage.

**Human-in-the-loop governance**
Ambiguous cases can be reviewed before entering the standardized master.

**Centralized master data**
Standard materials, NMC mappings, evaluations, and legacy relationships are maintained centrally.

**API-first architecture**
The backend exposes REST APIs suitable for future enterprise integration.

**Integration-ready design**
The architecture is designed with SAP/ERP integration in mind. The current prototype does **not** claim live SAP integration.

---

# 💡 Beyond Material Matching

SANGAM-IN extends beyond duplicate detection into broader **cross-CPSE material intelligence**.

### 🔄 **Smart Substitution**

Surfaces potential alternatives across CPSE inventories based on material attributes and availability for **procurement/engineering validation**.

### 🗺️ **Material Intelligence Map**

Provides a foundation for visualizing relationships between materials, classifications, and CPSEs.

### 📈 **Demand Analytics**

Supports demand-oriented analysis for standardized materials.

### 💰 **Price Anomaly Detection**

Provides a foundation for identifying unusual procurement pricing.

### 🤖 **AI Reasoning**

Provides human-readable explanations for uncertain material relationships.

### 🔗 **Legacy Mapping**

Connects historical material codes to standardized material identities.

---

# 🏗️ Technical Architecture

```text
                    ┌──────────────────┐
                    │    CPSE DATA     │
                    │ SAP / ERP / File │
                    └────────┬─────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  FastAPI Ingestion  │
                  └──────────┬──────────┘
                             │
                             ▼
               ┌──────────────────────────┐
               │ Standardization &        │
               │ Attribute Extraction     │
               └────────────┬─────────────┘
                            │
                            ▼
               ┌──────────────────────────┐
               │ Splink 4 + DuckDB        │
               │ Probabilistic Matching   │
               └────────────┬─────────────┘
                            │
                            ▼
               ┌──────────────────────────┐
               │ Confidence / Decision    │
               └────────────┬─────────────┘
                            │
                            ▼
               ┌──────────────────────────┐
               │ AI Reasoning +           │
               │ Human Validation         │
               └────────────┬─────────────┘
                            │
                            ▼
               ┌──────────────────────────┐
               │ PostgreSQL / Supabase    │
               │ Standard Master + NMC    │
               └──────────────────────────┘
```

---

# 🧩 Technology Stack

| **Layer**          | **Technology**        | **Purpose**                         |
| ------------------ | --------------------- | ----------------------------------- |
| **Frontend**       | React                 | Interactive dashboard               |
| **Backend**        | FastAPI + Python      | API & processing layer              |
| **Database**       | PostgreSQL / Supabase | Material master & mappings          |
| **Matching**       | Splink 4              | Probabilistic record linkage        |
| **Processing**     | DuckDB                | Analytical computation              |
| **Classification** | UNSPSC                | Candidate blocking                  |
| **AI**             | Groq + LLM            | Reasoning & selective AI processing |
| **Deployment**     | Vercel + Render       | Cloud deployment                    |
| **API**            | REST                  | Enterprise integration boundary     |

---

# ⚙️ Why This Stack?

### **Splink + DuckDB**

Enables fast probabilistic record linkage using a **CPU-first analytical architecture**.

### **UNSPSC Blocking**

Reduces the candidate search space before detailed comparison.

### **FastAPI**

Provides a lightweight and scalable **API boundary** between the frontend, ML pipeline, database, and future enterprise systems.

### **PostgreSQL**

Provides structured relational storage for **material masters, mappings, evaluations, and traceability**.

### **Selective AI**

AI is used where it provides additional reasoning value instead of processing every record unnecessarily.

---

# 🛡️ Governance & Explainability

SANGAM-IN is designed to retain the context behind material standardization decisions.

### **Tracked Information**

* **Source material**
* **Extracted attributes**
* **Candidate relationships**
* **Confidence information**
* **Human decisions**
* **NMC mappings**
* **Legacy mappings**

### **Decision Chain**

**Source → Evidence → Validation → Standard Master**

This creates a traceable foundation for **master-data governance and audit-oriented workflows**.

---

# 📊 Performance-Oriented Matching

SANGAM-IN reduces computational work **before** detailed probabilistic comparison.

```text
All Possible Comparisons
          ↓
UNSPSC / Category Blocking
          ↓
Candidate Set
          ↓
Attribute Comparison
          ↓
Probabilistic Scoring
```

The architecture is designed to avoid unrestricted pairwise comparison across the entire material master.

> **Benchmark results are dependent on dataset size, hardware, configuration, and test methodology.**

---

# 🌐 Deployment

```text
                         USER
                           │
                           ▼
                  ┌─────────────────┐
                  │ React Frontend  │
                  │     Vercel      │
                  └────────┬────────┘
                           │
                       REST API
                           │
                           ▼
                  ┌─────────────────┐
                  │ FastAPI Backend │
                  │     Render      │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ PostgreSQL      │
                  │    Supabase     │
                  └─────────────────┘
```

### **Production Deployment**

**Production Branch:** `production-branch`

The frontend and backend are independently deployable, providing a clean foundation for future enterprise integrations.

---

# 🔬 Technical Foundations

SANGAM-IN combines established techniques across **data engineering, entity resolution, and AI**:

* **Fellegi-Sunter probabilistic record linkage**
* **Splink 4**
* **DuckDB**
* **UNSPSC classification**
* **Rule-based normalization**
* **Registry-backed processing**
* **LLM-assisted reasoning**
* **Human-in-the-loop validation**
* **PostgreSQL master data**
* **REST APIs**

---

# 🚀 Prototype → Enterprise

The current prototype establishes the core material harmonization workflow.

Future extensions can include:

* **Direct SAP/ERP connectors**
* **Enterprise authentication & RBAC**
* **Larger material masters**
* **Workflow orchestration**
* **Advanced observability**
* **Versioned taxonomies**
* **Enterprise audit infrastructure**
* **Scaled human-review queues**

---

## SANGAM-IN

> ### **Standardize intelligently. Match probabilistically. Explain with AI. Validate with humans.**

**One material identity. Multiple legacy systems. One connected intelligence layer.**
