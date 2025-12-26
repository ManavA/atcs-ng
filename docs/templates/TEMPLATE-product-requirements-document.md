# Product Requirements Document - Template

<div align="center">

![hanaML](../hanaML-Template-7C3AED.png)

**[PRODUCT NAME]**

| Document ID | Version | Status | Classification |
|-------------|---------|--------|----------------|
| PRD-XXXX-YYYY-NNN | 0.0.0 | Draft | Internal |

</div>

---

## Template Guide

### Purpose of This Document

The **Product Requirements Document (PRD)** defines the **WHAT** and **WHY** of a product or feature. It serves as the authoritative source for:

- **Problem Definition**: What problem are we solving?
- **User Needs**: Who are our users and what do they need?
- **Success Metrics**: How do we measure success?
- **Scope**: What's included and excluded?
- **Requirements**: What must the product do?

> **Key Insight**: A good PRD answers "Why are we building this?" before "How will we build it?"

---

### How to Use This Template

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              HOW TO USE THIS TEMPLATE                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  STEP 1: COPY & RENAME                                                               │
│  ─────────────────────                                                               │
│  Copy this file and rename it:                                                       │
│  • Format: PRD-[PROJECT]-[DATE]-[topic].md                                          │
│  • Example: PRD-ATCS-20241222-ui-client.md                                          │
│                                                                                      │
│  STEP 2: FILL IN SECTIONS                                                            │
│  ────────────────────────                                                            │
│  Replace [PLACEHOLDERS] with actual content.                                         │
│  Delete any sections not applicable (with a note why).                               │
│                                                                                      │
│  STEP 3: REQUEST REVIEW                                                              │
│  ─────────────────────                                                               │
│  Share with stakeholders for feedback.                                               │
│  Use tracked changes or comments.                                                    │
│                                                                                      │
│  STEP 4: GET APPROVAL                                                                │
│  ────────────────────                                                                │
│  Obtain sign-off from required approvers.                                            │
│  Update status from "Draft" to "Approved".                                           │
│                                                                                      │
│  STEP 5: MAINTAIN                                                                    │
│  ────────────────                                                                    │
│  Keep document updated as requirements evolve.                                       │
│  Track changes in the Change Log section.                                            │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Product Lifecycle Position

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              PRODUCT LIFECYCLE POSITION                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│    IDEATION      PLANNING       BUILD         TEST        RELEASE      OPERATE      │
│       │             │             │             │            │            │          │
│       ▼             ▼             ▼             ▼            ▼            ▼          │
│   ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐       │
│   │       │    │       │    │       │    │       │    │       │    │       │       │
│   │ Ideas │───►│  PRD  │───►│Design │───►│  QA   │───►│Launch │───►│Monitor│       │
│   │       │    │       │    │ Doc   │    │ Test  │    │       │    │       │       │
│   └───────┘    └───┬───┘    └───────┘    └───────┘    └───────┘    └───────┘       │
│                    │                                                                 │
│                    │                                                                 │
│                ┌───▼───────────────────────────────────────────────────────────┐    │
│                │                   ★ PRD IS HERE ★                              │    │
│                │                                                                │    │
│                │  The PRD is created during PLANNING and serves as the         │    │
│                │  foundation for all downstream artifacts (Design Doc,         │    │
│                │  Tech Spec, Test Plans, etc.)                                 │    │
│                │                                                                │    │
│                │  It should be completed BEFORE engineering begins.            │    │
│                └────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Key Stakeholders

| Role | Responsibility | Involvement |
|------|----------------|-------------|
| **Product Manager** | Author and owner of the PRD | Creates, maintains, drives approval |
| **Engineering Lead** | Technical feasibility review | Reviews, provides estimates |
| **UX Designer** | User experience input | Reviews personas, user journeys |
| **QA Lead** | Testability review | Reviews acceptance criteria |
| **Business Stakeholder** | Business alignment | Reviews, approves |
| **VP Product** | Final approval | Approves |

### Who Works on This Document

| Phase | Contributors |
|-------|--------------|
| **Drafting** | Product Manager (primary), with input from stakeholders |
| **Review** | Engineering, Design, QA, Business |
| **Approval** | VP Product, VP Engineering |
| **Maintenance** | Product Manager |

---

## PRD Template

---

## 1. Executive Summary

### 1.1 Product Vision

> [1-2 sentences describing the product vision. What is the product and why does it matter?]

**Example:**
> ACME Widget is a revolutionary productivity tool that helps knowledge workers organize their tasks and reduce context switching by 50%.

### 1.2 Value Proposition

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VALUE PROPOSITION CANVAS                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────┐          ┌─────────────────────────────────┐ │
│   │     CUSTOMER GAINS      │          │        GAIN CREATORS            │ │
│   ├─────────────────────────┤          ├─────────────────────────────────┤ │
│   │ • [Gain 1]              │          │ • [How product creates gain]    │ │
│   │ • [Gain 2]              │   ◄──►   │ • [Feature that enables gain]   │ │
│   │ • [Gain 3]              │          │ • [Capability that helps]       │ │
│   └─────────────────────────┘          └─────────────────────────────────┘ │
│                                                                             │
│   ┌─────────────────────────┐          ┌─────────────────────────────────┐ │
│   │    CUSTOMER PAINS       │          │        PAIN RELIEVERS           │ │
│   ├─────────────────────────┤          ├─────────────────────────────────┤ │
│   │ • [Pain 1]              │          │ • [How product relieves pain]   │ │
│   │ • [Pain 2]              │   ◄──►   │ • [Feature that helps]          │ │
│   │ • [Pain 3]              │          │ • [Solution to pain]            │ │
│   └─────────────────────────┘          └─────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Key Outcomes

| Metric | Current State | Target State | Improvement |
|--------|---------------|--------------|-------------|
| [Metric 1] | [Current value] | [Target value] | [X% improvement] |
| [Metric 2] | [Current value] | [Target value] | [X% improvement] |
| [Metric 3] | [Current value] | [Target value] | [X% improvement] |

---

## 2. Problem Statement

### 2.1 Current State Analysis

> [Describe the current state and pain points. What's broken today?]

### 2.2 Impact Analysis

> [Describe the impact of not solving this problem. What happens if we do nothing?]

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal ID | Goal | Key Results | Priority |
|---------|------|-------------|----------|
| G1 | [Goal description] | [Measurable outcome] | P0 |
| G2 | [Goal description] | [Measurable outcome] | P1 |
| G3 | [Goal description] | [Measurable outcome] | P2 |

### 3.2 Non-Goals (Out of Scope)

| Non-Goal | Rationale |
|----------|-----------|
| [What we're NOT doing] | [Why we're not doing it] |

### 3.3 Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| [Metric name] | [Target value] | [How measured] |

---

## 4. User Personas

### 4.1 Primary Persona: [Name]

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PERSONA: [NAME]                                                             │
│  ═══════════════════════════════════════════════════════════════════════════│
│                                                                              │
│  ┌──────────┐   Role: [Job title]                                            │
│  │  ┌────┐  │   Age: [Age]  |  Experience: [X years]  |  Location: [Place]  │
│  │  │ 👤 │  │                                                                │
│  │  └────┘  │   "[Quote that represents their mindset]"                      │
│  │  [Name]  │                                                                │
│  └──────────┘                                                                │
│                                                                              │
│  GOALS                              FRUSTRATIONS                             │
│  ──────                             ─────────────                            │
│  • [Goal 1]                         • [Frustration 1]                        │
│  • [Goal 2]                         • [Frustration 2]                        │
│                                                                              │
│  NEEDS FROM PRODUCT                                                          │
│  ──────────────────                                                          │
│  • [Need 1]                                                                  │
│  • [Need 2]                                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. User Journeys

### 5.1 Journey: [Journey Name]

> [Describe the user journey step by step]

```
TRIGGER: [What initiates the journey]

[Step 1] ──► [Step 2] ──► [Step 3] ──► [Step 4] ──► [Outcome]

SUCCESS METRIC: [How we measure success of this journey]
```

---

## 6. Requirements

### 6.1 Functional Requirements

#### P0: Must Have (Launch Blockers)

| ID | Requirement | Acceptance Criteria | Status |
|----|-------------|---------------------|--------|
| F-001 | [Requirement] | [Criteria] | 🔲 Not Started |
| F-002 | [Requirement] | [Criteria] | 🔲 Not Started |

#### P1: Should Have (Target Release)

| ID | Requirement | Acceptance Criteria | Status |
|----|-------------|---------------------|--------|
| F-010 | [Requirement] | [Criteria] | 🔲 Not Started |

#### P2: Nice to Have (Post-Launch)

| ID | Requirement | Acceptance Criteria | Status |
|----|-------------|---------------------|--------|
| F-020 | [Requirement] | [Criteria] | 🔲 Not Started |

### 6.2 Non-Functional Requirements

| Category | Requirement | Target |
|----------|-------------|--------|
| Performance | [Requirement] | [Target] |
| Reliability | [Requirement] | [Target] |
| Security | [Requirement] | [Target] |
| Accessibility | [Requirement] | [Target] |

---

## 7. Scope & Constraints

### 7.1 In Scope

- [Feature/capability 1]
- [Feature/capability 2]

### 7.2 Out of Scope

- [Excluded item 1]
- [Excluded item 2]

### 7.3 Constraints

| Type | Constraint | Impact |
|------|------------|--------|
| Technical | [Constraint] | [Impact] |
| Business | [Constraint] | [Impact] |
| Timeline | [Constraint] | [Impact] |

---

## 8. Dependencies

| Dependency | Type | Risk Level | Mitigation |
|------------|------|------------|------------|
| [Dependency 1] | [Internal/External] | [Low/Medium/High] | [Mitigation] |

---

## 9. Risks & Mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R1 | [Risk description] | [L/M/H] | [L/M/H] | [Mitigation] |

---

## 10. Timeline

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| PRD Approved | [Date] | 🔲 |
| Design Complete | [Date] | 🔲 |
| Development Complete | [Date] | 🔲 |
| QA Complete | [Date] | 🔲 |
| Release | [Date] | 🔲 |

---

## 11. Open Questions

| ID | Question | Owner | Due Date | Status |
|----|----------|-------|----------|--------|
| Q1 | [Question] | [Owner] | [Date] | Open |

---

## 12. Appendix

### 12.1 Glossary

| Term | Definition |
|------|------------|
| [Term 1] | [Definition] |

### 12.2 Related Documents

- [Link to Design Doc]
- [Link to Tech Spec]

### 12.3 Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1.0 | [Date] | [Author] | Initial draft |

---

<div align="center">

![hanaML](../hanaML-Template-7C3AED.png)

*This template is maintained by the Product Team.*

</div>
