# Software Requirements Specification (SRS)
## RubyGYM — Fitness Center Management System
### Version 1.0 | April 2026

---

## 1. Introduction

### 1.1 Purpose
This document describes the software requirements for RubyGYM, a web-based fitness center management system. It is intended for the development team, the instructor, and stakeholders involved in the project evaluation.

### 1.2 Scope
RubyGYM automates the management of trainers, members, training schedules, monthly evaluations, membership plans, and promotional events for a fitness center. The system also integrates automated security testing into its CI/CD pipeline.

### 1.3 Definitions and Acronyms
- **HLV**: Huấn luyện viên (Trainer)
- **BMI**: Body Mass Index
- **MVP**: Minimum Viable Product
- **SAST**: Static Application Security Testing
- **DAST**: Dynamic Application Security Testing
- **CI/CD**: Continuous Integration / Continuous Deployment

### 1.4 References
- Project 12 Requirements Document (RubyGYM)
- Project 2 Requirements (Web application security & CI/CD security testing)
- Architecture Decision Records — `docs/reports/architecture-decisions.md`
- OWASP Top 10 (2021)
- IEEE 830 SRS Standard

---

## 2. Overall Description

### 2.1 Product Perspective
RubyGYM is a standalone web application consisting of:
- A React frontend for user interaction
- A Node.js + Express backend API
- A MySQL database for persistent storage
- Docker containers for deployment
- GitHub Actions for CI/CD with integrated security scanning

### 2.2 User Classes and Characteristics

#### Admin
- Manages trainers, membership plans, promotions, and events
- Views dashboard with revenue and membership statistics
- Has full access to all system functions

#### Trainer (HLV)
- Manages assigned clients and their training schedules
- Reads each member's self-defined training goal (read-only) and performs monthly evaluations against it
- Works maximum 8 hours/day, handles maximum 3 clients simultaneously per session

#### Member
- Views personal training schedule and evaluation results
- Registers for membership plans (quarterly, semi-annual, annual)
- Completes onboarding with body metrics, trainer preference, and package
- Sets and updates their own training goal on the dedicated Goals page (single source of truth)
- Receives loyalty rewards and referral bonuses

#### Guest
- Views public information: gym details, events, trainer profiles
- Can register as a new member

### 2.3 Operating Environment
- **Client**: Modern web browsers (Chrome, Firefox, Edge, Safari)
- **Server**: Node.js 18+ runtime, MySQL 8.0
- **Deployment**: Docker containers, GitHub Actions CI/CD

### 2.4 Constraints
- Training sessions limited to 05:00–11:30 and 13:30–20:00
- Maximum session duration: 2 hours
- Trainer daily limit: 8 hours
- Maximum 3 members per training session
- Schedule cycle: 1 month
- Membership evaluation cycle: 1 month

### 2.5 Assumptions
- Users have stable internet access
- Trainers and members have basic computer literacy
- Online payment is out of scope (MVP)

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization

| ID | Requirement | Priority |
|----|------------|----------|
| FR-AUTH-01 | System shall allow users to register with email, password, name, phone, current weight, and height | High |
| FR-AUTH-02 | System shall authenticate users via email and password | High |
| FR-AUTH-03 | System shall issue JWT tokens upon successful login | High |
| FR-AUTH-04 | System shall enforce role-based access control (Admin, Trainer, Member) | High |
| FR-AUTH-05 | System shall hash passwords using bcrypt before storage | High |

### 3.2 Trainer Management

| ID | Requirement | Priority |
|----|------------|----------|
| FR-TRN-01 | Admin shall be able to add, edit, and remove trainers | High |
| FR-TRN-02 | System shall display list of all trainers with specialization | High |
| FR-TRN-03 | Each trainer shall have a profile showing assigned clients | Medium |
| FR-TRN-04 | Members shall be able to choose a trainer or be assigned one by admin | High |
| FR-TRN-05 | Member onboarding shall allow trainer preference without requiring immediate assignment | Medium |

### 3.3 Schedule Management

| ID | Requirement | Priority |
|----|------------|----------|
| FR-SCH-01 | Trainers shall create training sessions with date, start time, end time | High |
| FR-SCH-02 | System shall enforce session duration maximum of 2 hours | High |
| FR-SCH-03 | System shall enforce operating hours: 05:00–11:30, 13:30–20:00 | High |
| FR-SCH-04 | System shall enforce trainer daily limit of 8 hours | High |
| FR-SCH-05 | System shall enforce maximum 3 members per session | High |
| FR-SCH-06 | Members shall view their weekly schedule in their account | High |
| FR-SCH-07 | Members can train up to 3 sessions per day (morning, afternoon, evening) | Medium |
| FR-SCH-08 | Schedule cycle shall be 1 month with review at end of cycle | Medium |

### 3.4 Training Goals & Monthly Evaluation

> Ownership rule (see ADR-001): the **member** owns and edits the training goal; trainers/admins read it but cannot modify it.

| ID | Requirement | Priority |
|----|------------|----------|
| FR-GOAL-01 | Members shall set and update their own training goal (goal type, target weight, target BMI, target date, notes) as the single source of truth | High |
| FR-GOAL-02 | Trainers and admins shall be able to view a member's training goal (read-only) and shall not modify it | High |
| FR-EVL-01 | Trainers shall record monthly actual weight and BMI for each assigned member | High |
| FR-EVL-02 | The system shall pre-fill target weight/BMI from the member's training goal during evaluation | Medium |
| FR-EVL-03 | The system shall compare actual vs target metrics (improved / maintained / declined) | Medium |
| FR-EVL-04 | Members shall be able to view their evaluation results and trainer notes | Medium |
| FR-EVL-05 | The system shall calculate current BMI from member weight and height when both are available | Medium |
| FR-EVL-06 | The system shall enforce at most one evaluation per member per month | Medium |

### 3.5 Membership & Subscription

| ID | Requirement | Priority |
|----|------------|----------|
| FR-MEM-01 | Members shall choose subscription plan: quarterly, semi-annual, or annual | High |
| FR-MEM-02 | Members with 1+ year membership shall be marked as loyal | Medium |
| FR-MEM-03 | Loyal members receive 3 free months upon renewal | Medium |
| FR-MEM-04 | Members receive 1 free month per successful referral | Medium |
| FR-MEM-05 | System shall track subscription status (active, expired, cancelled) | High |
| FR-MEM-06 | Newly registered members shall complete onboarding (body metrics, membership package, trainer preference) before the dashboard is treated as fully active; the training goal is set separately on the Goals page | High |

### 3.6 Events

| ID | Requirement | Priority |
|----|------------|----------|
| FR-EVT-01 | Admin shall create events with title, description, and date | Low |
| FR-EVT-02 | Events shall be displayed on the public website | Low |

### 3.7 Dashboard & Statistics

| ID | Requirement | Priority |
|----|------------|----------|
| FR-DSH-01 | Admin shall view total members, active subscriptions, revenue overview | Medium |
| FR-DSH-02 | Admin shall view trainer workload statistics | Low |

---

## 4. Non-Functional Requirements

### 4.1 Application Security (Project 12 & Project 2)
| ID | Requirement |
|----|------------|
| NFR-SEC-01 | All passwords must be hashed with bcrypt (cost factor ≥ 10) |
| NFR-SEC-02 | API endpoints must require valid JWT token (except public routes) |
| NFR-SEC-03 | Role-based access control must be enforced at API level |

#### Security Engineering Pipeline (Project 2 scope)
> Quality-gate policy is defined in ADR-004.

| ID | Requirement |
|----|------------|
| NFR-SEC-04 | SAST scanning (Semgrep) must run on every push and pull request, and upload a machine-readable report |
| NFR-SEC-05 | Container scanning (Trivy) must run on every Docker image build, and upload a report |
| NFR-SEC-06 | DAST scanning (OWASP ZAP baseline) must run against the running stack and upload a report (informational, non-blocking) |
| NFR-SEC-07 | The pipeline must fail on Critical/High findings from SAST and container scanning of the real application code. The intentional `vulnerable-demo` teaching file is excluded from the gate and is scanned in a separate, non-blocking "detection demo" job to prove the scanners catch planted vulnerabilities |

### 4.2 Performance
| ID | Requirement |
|----|------------|
| NFR-PER-01 | API response time shall be < 500ms for standard queries |
| NFR-PER-02 | System shall support at least 100 concurrent users |

### 4.3 Usability
| ID | Requirement |
|----|------------|
| NFR-USE-01 | Web interface shall be responsive (desktop and tablet) |
| NFR-USE-02 | System shall provide clear error messages in Vietnamese |
| NFR-USE-03 | New member accounts shall show real empty/onboarding states instead of preloaded demo schedules or packages |

---

## 5. System Architecture

```
┌──────────┐     ┌──────────────┐     ┌────────┐
│  React   │────▶│  Express API │────▶│ MySQL  │
│ Frontend │     │  (Node.js)   │     │   DB   │
└──────────┘     └──────────────┘     └────────┘
                        │
              ┌─────────┴─────────┐
              │  GitHub Actions   │
              │  CI/CD Pipeline   │
              │                   │
              │  Build → Test →   │
              │  SAST → Container │
              │  Scan → Deploy →  │
              │  DAST             │
              └───────────────────┘
```

---

## 6. Out of Scope (MVP)

- Online payment processing
- Mobile application (iOS/Android)
- Nutrition planning
- Equipment management
- Wearable device integration
