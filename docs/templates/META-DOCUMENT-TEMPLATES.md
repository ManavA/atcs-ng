# META Documentation Templates for ATCS-NG

**Version:** 1.0.0
**Last Updated:** 2025-12-22
**Document Owner:** Engineering Team

---

## Table of Contents

1. [Overview](#1-overview)
2. [Document Lifecycle](#2-document-lifecycle)
3. [PRD - Product Requirements Document](#3-prd---product-requirements-document)
4. [Technical Specification](#4-technical-specification)
5. [Design Document](#5-design-document)
6. [Test Plan](#6-test-plan)
7. [Launch Readiness (GRTM)](#7-launch-readiness-grtm)
8. [Runbook / Operations Guide](#8-runbook--operations-guide)
9. [Post-Mortem Template](#9-post-mortem-template)
10. [Architecture Decision Record (ADR)](#10-architecture-decision-record-adr)

---

## 1. Overview

This document provides standardized templates for all engineering documentation in the ATCS-NG project, following META's documentation practices adapted for air traffic control systems.

### Purpose of Documentation

| Document Type | Primary Question | When to Write | Key Audience |
|--------------|------------------|---------------|--------------|
| PRD | **What** are we building and **why**? | Before starting work | PM, Eng, Stakeholders |
| Tech Spec | **How** will we build it? | After PRD approval | Engineers |
| Design Doc | **What** does the architecture look like? | During planning | Engineers, Architects |
| Test Plan | **How** do we verify it works? | Before implementation | QA, Engineers |
| GRTM | **Are we ready** to launch? | Before release | All teams |
| Runbook | **How** do we operate it? | Before launch | SRE, On-call |
| Post-Mortem | **What** went wrong and **how** do we prevent it? | After incidents | All teams |
| ADR | **Why** did we make this decision? | At decision points | Future engineers |

### Document Naming Convention

```
ATCS-NG-[TYPE]-[YYYYMMDD]-[short-description].md

Examples:
ATCS-NG-PRD-20251222-demo-mode-enhancements.md
ATCS-NG-SPEC-20251222-cloud-tts-integration.md
ATCS-NG-TEST-20251222-conflict-detection.md
ATCS-NG-GRTM-20251222-v2.5-release.md
```

---

## 2. Document Lifecycle

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   DRAFT     │───▶│   REVIEW    │───▶│  APPROVED   │───▶│  ARCHIVED   │
│             │    │             │    │             │    │             │
│ Author      │    │ Reviewers   │    │ Stakeholders│    │ Historical  │
│ writing     │    │ commenting  │    │ signed off  │    │ reference   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**States:**
- **DRAFT**: Initial creation, not ready for review
- **REVIEW**: Open for feedback, comments welcome
- **APPROVED**: Signed off by stakeholders, ready for implementation
- **ARCHIVED**: Superseded or historical reference only

---

## 3. PRD - Product Requirements Document

### Purpose

The PRD defines **what** we're building and **why**. It's the source of truth for product requirements and success criteria. Engineers should be able to read a PRD and understand the problem space completely.

### Template

```markdown
# PRD: [Feature Name]

**Status:** DRAFT | REVIEW | APPROVED
**Author:** [Name]
**Date:** YYYY-MM-DD
**Reviewers:** [Names]
**Approvers:** [Names]

---

## 1. Problem Statement

### 1.1 Background
[Context about the current situation and why this matters]

### 1.2 Problem
[Clear statement of the problem we're solving]

### 1.3 Impact
[Who is affected and how? Quantify if possible]

---

## 2. Goals & Non-Goals

### 2.1 Goals
- [ ] Goal 1 - [Measurable outcome]
- [ ] Goal 2 - [Measurable outcome]
- [ ] Goal 3 - [Measurable outcome]

### 2.2 Non-Goals
- Non-goal 1 - [What we explicitly won't do and why]
- Non-goal 2 - [Scope limitation]

---

## 3. User Stories

### 3.1 Primary Persona: [Role Name]
**As a** [role]
**I want** [capability]
**So that** [benefit]

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### 3.2 Secondary Persona: [Role Name]
[Repeat format]

---

## 4. Requirements

### 4.1 Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-001 | [Requirement description] | P0/P1/P2 | |
| FR-002 | [Requirement description] | P0/P1/P2 | |

### 4.2 Non-Functional Requirements

| ID | Category | Requirement | Target |
|----|----------|-------------|--------|
| NFR-001 | Performance | [Description] | [Metric] |
| NFR-002 | Security | [Description] | [Standard] |
| NFR-003 | Reliability | [Description] | [SLA] |

---

## 5. Success Metrics

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| [Metric 1] | [Baseline] | [Goal] | [How to measure] |
| [Metric 2] | [Baseline] | [Goal] | [How to measure] |

---

## 6. Timeline & Milestones

| Milestone | Target Date | Description |
|-----------|-------------|-------------|
| Design Complete | YYYY-MM-DD | [Description] |
| Implementation | YYYY-MM-DD | [Description] |
| Testing | YYYY-MM-DD | [Description] |
| Launch | YYYY-MM-DD | [Description] |

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [Strategy] |
| [Risk 2] | High/Med/Low | High/Med/Low | [Strategy] |

---

## 8. Open Questions

- [ ] Question 1 - [Owner] - [Due date]
- [ ] Question 2 - [Owner] - [Due date]

---

## 9. Appendix

### 9.1 References
- [Link to related documents]

### 9.2 Glossary
| Term | Definition |
|------|------------|
| [Term] | [Definition] |
```

### Example (ATCS-NG)

```markdown
# PRD: Demo Mode Voice Enhancement

**Status:** APPROVED
**Author:** Manav Agarwal
**Date:** 2025-12-21

## 1. Problem Statement

### 1.1 Background
ATCS-NG includes a demo mode to showcase the system's capabilities to stakeholders and potential customers. The current demo uses browser-based Web Speech API which produces robotic, inconsistent voices.

### 1.2 Problem
Demo presentations lack immersion and professionalism due to poor-quality synthesized voices. International flight scenarios (Air India, Qantas, Emirates) sound identical regardless of origin.

### 1.3 Impact
- Sales demos feel unpolished
- Stakeholders cannot visualize realistic ATC interactions
- International scenarios lose authenticity

## 2. Goals & Non-Goals

### 2.1 Goals
- [ ] Replace Web Speech API with Google Cloud TTS Chirp 3 HD voices
- [ ] Support multi-accent voices (Indian, Australian, British, Norwegian)
- [ ] Add real-time translation UI for foreign language dialogue
- [ ] Complete demo runs in ~5 minutes with voice narration

### 2.2 Non-Goals
- Real-time translation of live ATC communications (demo only)
- Support for all world languages (limited to scenario needs)
- Integration with actual airline voice systems
```

---

## 4. Technical Specification

### Purpose

The Tech Spec describes **how** we'll implement the requirements from the PRD. It's the engineering blueprint that allows any qualified engineer to implement the feature.

### Template

```markdown
# Technical Specification: [Feature Name]

**Status:** DRAFT | REVIEW | APPROVED
**Author:** [Name]
**Date:** YYYY-MM-DD
**PRD:** [Link to PRD]
**Reviewers:** [Names]

---

## 1. Overview

### 1.1 Summary
[1-2 paragraph summary of the technical approach]

### 1.2 Background
[Technical context needed to understand the approach]

---

## 2. Architecture

### 2.1 System Context

```
[ASCII or PlantUML diagram showing system context]
```

### 2.2 Component Design

```
[Component diagram]
```

### 2.3 Data Flow

```
[Sequence diagram or data flow]
```

---

## 3. Detailed Design

### 3.1 Component: [Name]

**Purpose:** [What this component does]

**Interface:**
```typescript
interface ComponentName {
  method1(param: Type): ReturnType;
  method2(param: Type): ReturnType;
}
```

**Implementation Notes:**
- [Key implementation detail 1]
- [Key implementation detail 2]

### 3.2 Component: [Name]
[Repeat format]

---

## 4. Data Model

### 4.1 Entities

```typescript
interface EntityName {
  id: string;
  field1: Type;
  field2: Type;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2 Database Schema

```sql
CREATE TABLE entity_name (
  id UUID PRIMARY KEY,
  field1 VARCHAR(255) NOT NULL,
  field2 INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. API Design

### 5.1 Endpoint: [Name]

**Method:** GET/POST/PUT/DELETE
**Path:** `/api/v1/resource`

**Request:**
```json
{
  "field": "value"
}
```

**Response:**
```json
{
  "data": { },
  "meta": { }
}
```

**Error Codes:**
| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Internal Error |

---

## 6. Security Considerations

### 6.1 Authentication
[How authentication is handled]

### 6.2 Authorization
[How authorization is implemented]

### 6.3 Data Protection
[Encryption, PII handling, etc.]

---

## 7. Performance Considerations

### 7.1 Expected Load
- Requests per second: [X]
- Concurrent users: [Y]
- Data volume: [Z]

### 7.2 Optimization Strategies
- [Strategy 1]
- [Strategy 2]

### 7.3 Benchmarks
| Operation | Target Latency | Actual |
|-----------|---------------|--------|
| [Op 1] | [Xms] | TBD |
| [Op 2] | [Xms] | TBD |

---

## 8. Reliability & Error Handling

### 8.1 Failure Modes
| Failure | Detection | Recovery |
|---------|-----------|----------|
| [Mode 1] | [How detected] | [How recovered] |
| [Mode 2] | [How detected] | [How recovered] |

### 8.2 Retry Strategy
[Exponential backoff, circuit breaker, etc.]

### 8.3 Fallbacks
[Graceful degradation strategies]

---

## 9. Testing Strategy

### 9.1 Unit Tests
[Approach and coverage targets]

### 9.2 Integration Tests
[Approach and key scenarios]

### 9.3 E2E Tests
[Critical user flows to test]

---

## 10. Rollout Plan

### 10.1 Feature Flags
[Feature flag configuration]

### 10.2 Rollout Phases
| Phase | % Traffic | Duration | Criteria to Proceed |
|-------|-----------|----------|---------------------|
| 1 | 1% | 1 day | No errors |
| 2 | 10% | 2 days | Metrics stable |
| 3 | 100% | - | Full launch |

### 10.3 Rollback Plan
[How to quickly rollback if issues arise]

---

## 11. Monitoring & Alerting

### 11.1 Key Metrics
| Metric | Alert Threshold | Severity |
|--------|-----------------|----------|
| [Metric 1] | [Threshold] | P1/P2/P3 |
| [Metric 2] | [Threshold] | P1/P2/P3 |

### 11.2 Dashboards
[Links to monitoring dashboards]

---

## 12. Dependencies

### 12.1 Upstream Dependencies
| System | Dependency Type | Fallback |
|--------|-----------------|----------|
| [System 1] | Hard/Soft | [Fallback] |

### 12.2 Downstream Dependencies
| System | Impact if We Fail |
|--------|-------------------|
| [System 1] | [Impact] |

---

## 13. Migration Plan

### 13.1 Data Migration
[Steps for data migration if applicable]

### 13.2 API Versioning
[How old and new APIs will coexist]

---

## 14. Timeline

| Task | Estimate | Owner |
|------|----------|-------|
| [Task 1] | X days | [Name] |
| [Task 2] | X days | [Name] |

---

## 15. Open Questions

- [ ] [Question 1]
- [ ] [Question 2]

---

## 16. Appendix

### 16.1 Alternatives Considered
[Options that were rejected and why]

### 16.2 References
[Links to relevant resources]
```

---

## 5. Design Document

### Purpose

A Design Document provides a visual and conceptual overview of the system architecture. It focuses on component relationships, data flows, and system topology.

### Template

```markdown
# Design Document: [System/Feature Name]

**Version:** X.Y.Z
**Date:** YYYY-MM-DD
**Author:** [Name]

---

## 1. Executive Summary

[2-3 sentences describing the system at the highest level]

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         [System Name]                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐                 │
│   │Component1│───▶│Component2│───▶│Component3│                 │
│   └──────────┘    └──────────┘    └──────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Diagram

[Detailed component diagram with responsibilities]

### 2.3 Deployment Diagram

[Infrastructure and deployment topology]

---

## 3. Component Details

### 3.1 [Component Name]

**Responsibility:** [What it does]
**Technology:** [Stack used]
**Scaling:** [How it scales]

**Interfaces:**
- Input: [What it receives]
- Output: [What it produces]

### 3.2 [Component Name]
[Repeat format]

---

## 4. Data Architecture

### 4.1 Data Stores

| Store | Type | Purpose | Retention |
|-------|------|---------|-----------|
| [Store 1] | [Type] | [Purpose] | [Policy] |

### 4.2 Data Flow

```
[Data flow diagram]
```

---

## 5. Integration Points

### 5.1 External Systems

| System | Protocol | Purpose | SLA |
|--------|----------|---------|-----|
| [System] | [Protocol] | [Purpose] | [SLA] |

### 5.2 Internal Services

[Service mesh / internal communication patterns]

---

## 6. Security Architecture

### 6.1 Security Boundaries

[Trust boundaries and security zones]

### 6.2 Authentication Flow

[Auth flow diagram]

### 6.3 Authorization Model

[RBAC/ABAC model description]

---

## 7. Diagrams

### 7.1 Use Case Diagram
[PlantUML or image]

### 7.2 Sequence Diagrams
[Key flows]

### 7.3 State Diagrams
[Entity state machines]

### 7.4 Class Diagrams
[Domain model]

---

## 8. Cross-Cutting Concerns

### 8.1 Logging
[Logging strategy and standards]

### 8.2 Monitoring
[Observability approach]

### 8.3 Caching
[Cache strategy]

### 8.4 Error Handling
[Error propagation strategy]

---

## 9. Constraints & Assumptions

### 9.1 Technical Constraints
- [Constraint 1]
- [Constraint 2]

### 9.2 Assumptions
- [Assumption 1]
- [Assumption 2]

---

## 10. Future Considerations

[Extensibility points and future evolution]
```

---

## 6. Test Plan

### Purpose

The Test Plan defines **how** we verify the system works correctly. It should be comprehensive enough that QA can execute all tests without additional context.

### Template

```markdown
# Test Plan: [Feature/Release Name]

**Version:** X.Y.Z
**Date:** YYYY-MM-DD
**Author:** [Name]
**PRD:** [Link]
**Tech Spec:** [Link]

---

## 1. Overview

### 1.1 Objectives
[What this test plan aims to verify]

### 1.2 Scope

**In Scope:**
- [Item 1]
- [Item 2]

**Out of Scope:**
- [Item 1]
- [Item 2]

### 1.3 Test Environment
| Environment | URL | Purpose |
|-------------|-----|---------|
| Dev | [URL] | Development testing |
| Staging | [URL] | Integration testing |
| Prod | [URL] | Smoke tests only |

---

## 2. Test Strategy

### 2.1 Test Levels

| Level | Coverage Target | Automation |
|-------|-----------------|------------|
| Unit | 80%+ | 100% automated |
| Integration | Critical paths | 90% automated |
| E2E | Happy paths | 80% automated |
| Manual | Edge cases | As needed |

### 2.2 Test Types
- Functional Testing
- Performance Testing
- Security Testing
- Accessibility Testing
- Compatibility Testing

---

## 3. Test Cases

### 3.1 Unit Tests

| ID | Component | Test Description | Expected Result |
|----|-----------|-----------------|-----------------|
| UT-001 | [Component] | [Description] | [Result] |
| UT-002 | [Component] | [Description] | [Result] |

### 3.2 Integration Tests

| ID | Flow | Test Description | Expected Result | Priority |
|----|------|-----------------|-----------------|----------|
| IT-001 | [Flow] | [Description] | [Result] | P0 |
| IT-002 | [Flow] | [Description] | [Result] | P1 |

### 3.3 End-to-End Tests

| ID | Scenario | Steps | Expected Result | Priority |
|----|----------|-------|-----------------|----------|
| E2E-001 | [Scenario] | 1. [Step]<br>2. [Step]<br>3. [Step] | [Result] | P0 |

### 3.4 Performance Tests

| ID | Scenario | Load Profile | Target | Pass Criteria |
|----|----------|--------------|--------|---------------|
| PERF-001 | [Scenario] | [Users/RPS] | [Metric] | [Criteria] |

### 3.5 Security Tests

| ID | Category | Test Description | Expected Result |
|----|----------|-----------------|-----------------|
| SEC-001 | Auth | [Description] | [Result] |
| SEC-002 | Authz | [Description] | [Result] |

---

## 4. Test Data

### 4.1 Test Data Requirements
| Data Type | Source | Volume | Refresh |
|-----------|--------|--------|---------|
| [Type] | [Source] | [Volume] | [Frequency] |

### 4.2 Test Accounts
| Role | Username | Purpose |
|------|----------|---------|
| [Role] | [Username] | [Purpose] |

---

## 5. Entry & Exit Criteria

### 5.1 Entry Criteria
- [ ] Code complete and deployed to test environment
- [ ] Test environment stable
- [ ] Test data prepared
- [ ] All P0 blockers resolved

### 5.2 Exit Criteria
- [ ] All P0 tests pass
- [ ] 95%+ P1 tests pass
- [ ] No open P0/P1 bugs
- [ ] Performance targets met
- [ ] Security scan passed

---

## 6. Defect Management

### 6.1 Severity Definitions

| Severity | Definition | Response Time |
|----------|------------|---------------|
| P0 | System down, no workaround | 4 hours |
| P1 | Major feature broken | 24 hours |
| P2 | Feature degraded | 1 week |
| P3 | Minor issue | Next sprint |

### 6.2 Defect Workflow
```
NEW → TRIAGED → IN PROGRESS → FIXED → VERIFIED → CLOSED
```

---

## 7. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk] | High/Med/Low | High/Med/Low | [Mitigation] |

---

## 8. Schedule

| Phase | Start | End | Owner |
|-------|-------|-----|-------|
| Test Planning | YYYY-MM-DD | YYYY-MM-DD | [Name] |
| Test Execution | YYYY-MM-DD | YYYY-MM-DD | [Name] |
| Bug Fixing | YYYY-MM-DD | YYYY-MM-DD | [Name] |
| Sign-off | YYYY-MM-DD | YYYY-MM-DD | [Name] |

---

## 9. Deliverables

- [ ] Test Plan (this document)
- [ ] Test Cases in [Tool]
- [ ] Automated Test Suite
- [ ] Test Summary Report
- [ ] Defect Report

---

## 10. Appendix

### 10.1 Test Tools
| Tool | Purpose |
|------|---------|
| [Tool] | [Purpose] |

### 10.2 References
[Links to related documents]
```

---

## 7. Launch Readiness (GRTM)

### Purpose

Go To Market Readiness (GRTM) is the final checklist before launching. It ensures all teams have completed their launch tasks and the system is ready for production.

### Template

```markdown
# Launch Readiness: [Feature/Release Name]

**Version:** X.Y.Z
**Target Launch Date:** YYYY-MM-DD
**Status:** NOT READY | READY WITH RISKS | GO
**Owner:** [Name]

---

## 1. Executive Summary

| Area | Status | Owner | Notes |
|------|--------|-------|-------|
| Engineering | 🟢/🟡/🔴 | [Name] | |
| QA | 🟢/🟡/🔴 | [Name] | |
| Security | 🟢/🟡/🔴 | [Name] | |
| Operations | 🟢/🟡/🔴 | [Name] | |
| Documentation | 🟢/🟡/🔴 | [Name] | |

**Legend:** 🟢 Ready | 🟡 In Progress | 🔴 Blocked

---

## 2. Engineering Readiness

### 2.1 Code Complete
- [ ] All features implemented
- [ ] Code reviewed and merged
- [ ] Feature flags configured
- [ ] Database migrations ready

### 2.2 Testing Complete
- [ ] Unit tests passing (coverage: __%)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance tests passing
- [ ] Security scan passed

### 2.3 Dependencies
- [ ] All dependencies updated
- [ ] Third-party services configured
- [ ] API keys/secrets in vault

---

## 3. Operational Readiness

### 3.1 Infrastructure
- [ ] Production infrastructure provisioned
- [ ] Auto-scaling configured
- [ ] Load balancers configured
- [ ] CDN configured (if applicable)
- [ ] SSL certificates valid

### 3.2 Monitoring & Alerting
- [ ] Dashboards created
- [ ] Alerts configured
- [ ] On-call rotation set
- [ ] Escalation path documented

### 3.3 Runbooks
- [ ] Deployment runbook complete
- [ ] Rollback runbook complete
- [ ] Incident response runbook complete
- [ ] FAQ documented

---

## 4. Security Readiness

- [ ] Security review completed
- [ ] Penetration testing completed
- [ ] Vulnerability scan clean
- [ ] Secrets management verified
- [ ] Access controls configured
- [ ] Audit logging enabled

---

## 5. Documentation Readiness

- [ ] User documentation complete
- [ ] API documentation complete
- [ ] Architecture documentation updated
- [ ] Release notes prepared
- [ ] Changelog updated

---

## 6. Rollout Plan

### 6.1 Deployment Sequence
1. [ ] Deploy to staging
2. [ ] Smoke test staging
3. [ ] Deploy to production (1%)
4. [ ] Monitor for 1 hour
5. [ ] Expand to 10%
6. [ ] Monitor for 24 hours
7. [ ] Expand to 100%

### 6.2 Rollback Triggers
- Error rate > 1%
- P95 latency > 500ms
- Any P0 bugs reported

### 6.3 Rollback Procedure
1. Disable feature flag
2. Revert to previous version
3. Notify stakeholders
4. Begin incident investigation

---

## 7. Communication Plan

### 7.1 Internal Communication
| Audience | Channel | When | Owner |
|----------|---------|------|-------|
| Engineering | Slack #eng | Launch day | [Name] |
| All hands | Email | Launch day | [Name] |

### 7.2 External Communication
| Audience | Channel | When | Owner |
|----------|---------|------|-------|
| Customers | Blog/Email | Post-launch | [Name] |

---

## 8. Known Issues & Risks

| Issue | Severity | Workaround | Plan |
|-------|----------|------------|------|
| [Issue] | P1/P2/P3 | [Workaround] | [Plan] |

---

## 9. Sign-offs

| Role | Name | Sign-off | Date |
|------|------|----------|------|
| Engineering Lead | | ☐ | |
| QA Lead | | ☐ | |
| Security | | ☐ | |
| Operations | | ☐ | |
| Product | | ☐ | |

---

## 10. Post-Launch Tasks

- [ ] Monitor metrics for 24 hours
- [ ] Collect user feedback
- [ ] Schedule retrospective
- [ ] Update documentation based on learnings
- [ ] Close feature flags (if permanent)
```

---

## 8. Runbook / Operations Guide

### Purpose

The Runbook provides operations teams with step-by-step procedures for common tasks, troubleshooting, and incident response.

### Template

```markdown
# Runbook: [Service/System Name]

**Version:** X.Y.Z
**Last Updated:** YYYY-MM-DD
**Owner:** [Team/Name]
**On-Call:** [Rotation Link]

---

## 1. Service Overview

### 1.1 Description
[What this service does]

### 1.2 Architecture

```
[Simple architecture diagram]
```

### 1.3 Dependencies

| Dependency | Type | Impact if Down |
|------------|------|----------------|
| [Service] | Hard/Soft | [Impact] |

### 1.4 SLOs

| SLI | Target | Current |
|-----|--------|---------|
| Availability | 99.9% | [Link] |
| Latency P99 | <500ms | [Link] |
| Error Rate | <0.1% | [Link] |

---

## 2. Access & Permissions

### 2.1 Access Requirements
| Resource | Access Method | Permission Required |
|----------|---------------|---------------------|
| [Resource] | [Method] | [Permission] |

### 2.2 Important URLs
| Purpose | URL |
|---------|-----|
| Production | [URL] |
| Staging | [URL] |
| Logs | [URL] |
| Metrics | [URL] |
| Alerts | [URL] |

---

## 3. Common Operations

### 3.1 Deployment

**Deploy to Production:**
```bash
# Step 1: Verify staging is healthy
curl https://staging.example.com/health

# Step 2: Deploy
gcloud run deploy service-name \
  --image=gcr.io/project/image:tag \
  --region=us-central1

# Step 3: Verify
curl https://production.example.com/health
```

### 3.2 Rollback

**Rollback to Previous Version:**
```bash
# Step 1: Get previous revision
gcloud run revisions list --service=service-name

# Step 2: Route traffic to previous revision
gcloud run services update-traffic service-name \
  --to-revisions=previous-revision=100
```

### 3.3 Scaling

**Manual Scale Up:**
```bash
gcloud run services update service-name \
  --min-instances=10 \
  --max-instances=100
```

### 3.4 Database Operations

**Connect to Production Database:**
```bash
# Use Cloud SQL Proxy
cloud_sql_proxy -instances=project:region:instance=tcp:5432

# Connect
psql -h localhost -U username -d database
```

---

## 4. Troubleshooting

### 4.1 Service is Down

**Symptoms:**
- Health check failing
- 5xx errors from load balancer
- Alerts firing

**Investigation:**
1. Check service logs:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND
     resource.labels.service_name=service-name" --limit=100
   ```

2. Check recent deployments:
   ```bash
   gcloud run revisions list --service=service-name
   ```

3. Check dependencies:
   - Database connectivity
   - External API status
   - Network/DNS issues

**Resolution:**
- If recent deploy: Rollback (see 3.2)
- If dependency issue: Check dependency status pages
- If resource exhaustion: Scale up (see 3.3)

### 4.2 High Latency

**Symptoms:**
- P99 latency > threshold
- Timeout errors
- Slow dashboard

**Investigation:**
1. Check metrics dashboard for patterns
2. Check for traffic spike
3. Check database query performance
4. Check external API latency

**Resolution:**
- Scale up if resource-constrained
- Add caching if repeated queries
- Optimize slow queries

### 4.3 High Error Rate

**Symptoms:**
- Error rate > 1%
- Customer complaints
- Alert firing

**Investigation:**
1. Identify error types in logs
2. Check for pattern (specific endpoint, user, time)
3. Check recent changes

**Resolution:**
- Fix and deploy if code bug
- Rollback if recent change caused it
- Block bad traffic if attack

---

## 5. Incident Response

### 5.1 Severity Levels

| Level | Definition | Response Time | Escalation |
|-------|------------|---------------|------------|
| SEV1 | Complete outage | 15 min | Immediate |
| SEV2 | Major degradation | 30 min | 1 hour |
| SEV3 | Minor degradation | 4 hours | Next day |

### 5.2 Incident Commander Checklist

1. [ ] Acknowledge incident
2. [ ] Assess severity
3. [ ] Start incident channel
4. [ ] Assign roles (IC, Tech Lead, Comms)
5. [ ] Begin investigation
6. [ ] Provide regular updates
7. [ ] Resolve or escalate
8. [ ] Declare resolved
9. [ ] Schedule post-mortem

### 5.3 Communication Templates

**Initial Notification:**
```
[SEV-X] [Service Name] Incident

Status: Investigating
Impact: [Description of user impact]
Start Time: [Time UTC]
Next Update: [Time]

We are investigating [brief description].
```

**Resolution:**
```
[RESOLVED] [Service Name] Incident

Duration: [X hours Y minutes]
Impact: [Description]
Root Cause: [Brief summary]

The incident has been resolved. A post-mortem will follow.
```

---

## 6. Monitoring & Alerts

### 6.1 Key Metrics

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Error Rate | <0.1% | 0.1-1% | >1% |
| Latency P99 | <500ms | 500-1000ms | >1000ms |
| CPU | <70% | 70-85% | >85% |
| Memory | <70% | 70-85% | >85% |

### 6.2 Alert Response

| Alert | Likely Cause | First Response |
|-------|--------------|----------------|
| HighErrorRate | Code bug, dependency | Check logs, recent deploy |
| HighLatency | Load, slow query | Check traffic, DB |
| InstanceDown | Crash, OOM | Check logs, restart |

---

## 7. Maintenance Procedures

### 7.1 Regular Maintenance
| Task | Frequency | Owner | Runbook |
|------|-----------|-------|---------|
| Log rotation | Daily | Automated | N/A |
| DB backup | Daily | Automated | [Link] |
| Cert renewal | Quarterly | [Team] | [Link] |
| Dependency updates | Monthly | [Team] | [Link] |

### 7.2 Scheduled Maintenance Window
- **When:** Sundays 2-4 AM UTC
- **Notification:** 48 hours in advance
- **Approval:** [Team Lead]

---

## 8. Contacts

| Role | Name | Contact |
|------|------|---------|
| Service Owner | [Name] | [Email/Slack] |
| On-Call Primary | [Rotation] | [PagerDuty] |
| On-Call Secondary | [Rotation] | [PagerDuty] |
| Escalation | [Name] | [Email/Slack] |
```

---

## 9. Post-Mortem Template

### Purpose

Post-mortems are blameless retrospectives after incidents. They help teams learn and prevent recurrence.

### Template

```markdown
# Post-Mortem: [Incident Title]

**Date:** YYYY-MM-DD
**Severity:** SEV-1/2/3
**Duration:** X hours Y minutes
**Author:** [Name]
**Reviewers:** [Names]

---

## 1. Executive Summary

[2-3 sentence summary of what happened and impact]

---

## 2. Impact

### 2.1 User Impact
- [Number] users affected
- [Features] unavailable
- [Duration] of impact

### 2.2 Business Impact
- Revenue impact: $[X]
- SLA violation: Yes/No
- Customer complaints: [Number]

---

## 3. Timeline

All times in UTC.

| Time | Event |
|------|-------|
| HH:MM | [First sign of issue] |
| HH:MM | [Alert fired] |
| HH:MM | [Investigation started] |
| HH:MM | [Root cause identified] |
| HH:MM | [Fix deployed] |
| HH:MM | [Issue resolved] |

---

## 4. Root Cause Analysis

### 4.1 What Happened
[Detailed technical explanation]

### 4.2 Why It Happened
[5 Whys analysis]

1. Why? [Answer]
2. Why? [Answer]
3. Why? [Answer]
4. Why? [Answer]
5. Why? [Root cause]

### 4.3 Contributing Factors
- [Factor 1]
- [Factor 2]

---

## 5. Resolution

### 5.1 Immediate Fix
[What was done to resolve the incident]

### 5.2 Verification
[How we confirmed the fix worked]

---

## 6. Lessons Learned

### 6.1 What Went Well
- [Item]
- [Item]

### 6.2 What Went Poorly
- [Item]
- [Item]

### 6.3 Where We Got Lucky
- [Item]

---

## 7. Action Items

| ID | Action | Owner | Due Date | Status |
|----|--------|-------|----------|--------|
| 1 | [Action] | [Name] | YYYY-MM-DD | Open |
| 2 | [Action] | [Name] | YYYY-MM-DD | Open |
| 3 | [Action] | [Name] | YYYY-MM-DD | Open |

---

## 8. Prevention

### 8.1 Detection Improvements
[How we'll detect this faster next time]

### 8.2 Prevention Improvements
[How we'll prevent this from happening again]

### 8.3 Response Improvements
[How we'll respond better next time]

---

## 9. Appendix

### 9.1 Supporting Data
[Links to dashboards, logs, etc.]

### 9.2 Related Incidents
[Links to similar past incidents]
```

---

## 10. Architecture Decision Record (ADR)

### Purpose

ADRs document significant technical decisions and their context. They help future engineers understand why decisions were made.

### Template

```markdown
# ADR-[NUMBER]: [Title]

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Author:** [Name]
**Deciders:** [Names]

---

## Context

[What is the issue that we're seeing that is motivating this decision or change?]

---

## Decision

[What is the change that we're proposing and/or doing?]

---

## Consequences

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Drawback 1]
- [Drawback 2]

### Neutral
- [Observation 1]

---

## Alternatives Considered

### Alternative 1: [Name]
**Description:** [What this option involves]
**Pros:** [Advantages]
**Cons:** [Disadvantages]
**Why rejected:** [Reason]

### Alternative 2: [Name]
[Repeat format]

---

## References

- [Link to relevant resources]
- [Link to related ADRs]
```

### Example ADR

```markdown
# ADR-001: Use Google Cloud TTS for Demo Voice Synthesis

**Status:** Accepted
**Date:** 2025-12-21
**Author:** Manav Agarwal
**Deciders:** Engineering Team

---

## Context

The ATCS-NG demo mode requires voice synthesis for narration and ATC commands. The current Web Speech API provides inconsistent quality across browsers and lacks support for international accents needed for realistic airline crew voices.

---

## Decision

We will use Google Cloud Text-to-Speech API with Chirp 3 HD voices for all demo mode voice synthesis, with browser SpeechSynthesis as a fallback.

---

## Consequences

### Positive
- High-quality, consistent voices across all browsers
- Support for multiple accents (Indian, Australian, British, Norwegian)
- Neural voice quality sounds more natural

### Negative
- Adds external API dependency
- Costs per synthesis request (~$0.000004 per character)
- Requires API key management

### Neutral
- Requires fallback logic for offline scenarios

---

## Alternatives Considered

### Alternative 1: AWS Polly
**Description:** Use Amazon Polly for voice synthesis
**Pros:** Similar quality, familiar AWS ecosystem
**Cons:** Fewer accent options, separate billing
**Why rejected:** Google Cloud TTS has better Chirp HD voices for our accent requirements

### Alternative 2: Enhance Web Speech API
**Description:** Use browser-native speech with custom voice selection
**Pros:** No external dependency, no cost
**Cons:** Inconsistent across browsers, poor accent support
**Why rejected:** Quality insufficient for professional demos

---

## References

- [Google Cloud TTS Documentation](https://cloud.google.com/text-to-speech/docs)
- [Voice quality comparison tests](internal-link)
```

---

## Quick Reference

### Document Selection Guide

| Situation | Document to Create |
|-----------|-------------------|
| New feature request | PRD first, then Tech Spec |
| System design needed | Design Document |
| Before release | Test Plan → GRTM |
| New service | Runbook |
| After incident | Post-Mortem |
| Major technical decision | ADR |

### Minimum Viable Documentation

For small features, you may combine:
- PRD + Tech Spec → Single "Feature Spec"
- Test Plan → Section in Tech Spec
- Runbook → Section in existing service runbook

### Review Checklist

Before submitting any document for review:
- [ ] All sections completed or marked N/A
- [ ] Diagrams render correctly
- [ ] Links work
- [ ] No placeholder text
- [ ] Spell-checked
- [ ] Version number updated
