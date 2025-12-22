# Runbook: ATCS-NG UI Client

**Version:** 2.5.0
**Last Updated:** 2025-12-22
**Owner:** Engineering Team
**On-Call:** N/A (demo system)

---

## 1. Service Overview

### 1.1 Description

ATCS-NG UI Client is a React-based single-page application that provides an air traffic control workstation interface. It includes:
- Real-time radar display
- Alert management system
- Demo mode with voice narration
- Interactive Hero Mode

### 1.2 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Internet                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Cloud Run (ui-client)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Nginx Container                         │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │            React Static Assets                   │    │   │
│  │  │  - index.html                                    │    │   │
│  │  │  - index-*.js (bundled)                          │    │   │
│  │  │  - index-*.css                                   │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Google Cloud │  │ OpenStreetMap│  │ Google Fonts │          │
│  │     TTS      │  │    Tiles     │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Dependencies

| Dependency | Type | Impact if Down |
|------------|------|----------------|
| Google Cloud TTS | Soft | Voice falls back to browser TTS |
| OpenStreetMap | Soft | Map tiles may not load |
| Google Fonts | Soft | Falls back to system fonts |

### 1.4 SLOs

| SLI | Target | Measurement |
|-----|--------|-------------|
| Availability | 99.5% | Cloud Run uptime |
| Latency (P95) | < 500ms | Cloud Run metrics |
| Error Rate | < 1% | Cloud Run metrics |

---

## 2. Access & Permissions

### 2.1 Access Requirements

| Resource | Access Method | Permission Required |
|----------|---------------|---------------------|
| Cloud Run | GCP Console / gcloud | roles/run.admin |
| Artifact Registry | GCP Console / gcloud | roles/artifactregistry.admin |
| Cloud Logging | GCP Console | roles/logging.viewer |
| GitHub Repo | GitHub | Write access |

### 2.2 Important URLs

| Purpose | URL |
|---------|-----|
| Production | https://ui-client-595822882252.us-central1.run.app |
| GitHub Repo | https://github.com/ManavA/atcs-ng |
| Cloud Console | https://console.cloud.google.com/run?project=gen-lang-client-0827795477 |
| Cloud Logging | https://console.cloud.google.com/logs?project=gen-lang-client-0827795477 |
| Artifact Registry | https://console.cloud.google.com/artifacts?project=gen-lang-client-0827795477 |

### 2.3 Service Account

| Purpose | Email |
|---------|-------|
| GitHub Actions | github-actions-deploy@gen-lang-client-0827795477.iam.gserviceaccount.com |

---

## 3. Common Operations

### 3.1 Deployment

#### Automatic Deployment (CI/CD)

Pushes to `main` branch automatically trigger deployment via GitHub Actions.

```bash
# Push to main triggers deployment
git push origin main

# Check GitHub Actions status
gh run list --workflow=deploy.yml
```

#### Manual Deployment

```bash
# 1. Build locally
npm run build

# 2. Build and push Docker image
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/gen-lang-client-0827795477/atcs-ng-repo/ui-client:v2.5.0 \
  --project=gen-lang-client-0827795477

# 3. Deploy to Cloud Run
gcloud run deploy ui-client \
  --image=us-central1-docker.pkg.dev/gen-lang-client-0827795477/atcs-ng-repo/ui-client:v2.5.0 \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --project=gen-lang-client-0827795477

# 4. Verify deployment
curl https://ui-client-595822882252.us-central1.run.app
```

### 3.2 Rollback

```bash
# 1. List available revisions
gcloud run revisions list \
  --service=ui-client \
  --region=us-central1 \
  --project=gen-lang-client-0827795477

# 2. Route 100% traffic to previous revision
gcloud run services update-traffic ui-client \
  --to-revisions=ui-client-00011-fj6=100 \
  --region=us-central1 \
  --project=gen-lang-client-0827795477

# 3. Verify rollback
curl https://ui-client-595822882252.us-central1.run.app
# Check version number in response
```

### 3.3 Scaling

```bash
# Scale up (increase min instances for faster cold starts)
gcloud run services update ui-client \
  --min-instances=1 \
  --max-instances=5 \
  --region=us-central1 \
  --project=gen-lang-client-0827795477

# Scale down (allow scale to zero)
gcloud run services update ui-client \
  --min-instances=0 \
  --max-instances=2 \
  --region=us-central1 \
  --project=gen-lang-client-0827795477
```

### 3.4 View Logs

```bash
# View recent logs
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=ui-client" \
  --limit=50 \
  --project=gen-lang-client-0827795477

# Stream logs in real-time
gcloud alpha run services logs read ui-client \
  --region=us-central1 \
  --project=gen-lang-client-0827795477

# Filter for errors
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=ui-client AND severity>=ERROR" \
  --limit=50 \
  --project=gen-lang-client-0827795477
```

### 3.5 Check Service Status

```bash
# Get service details
gcloud run services describe ui-client \
  --region=us-central1 \
  --project=gen-lang-client-0827795477

# Get current URL
gcloud run services describe ui-client \
  --region=us-central1 \
  --project=gen-lang-client-0827795477 \
  --format="value(status.url)"

# List all revisions
gcloud run revisions list \
  --service=ui-client \
  --region=us-central1 \
  --project=gen-lang-client-0827795477
```

---

## 4. Troubleshooting

### 4.1 Service is Down / 5xx Errors

**Symptoms:**
- https://ui-client-595822882252.us-central1.run.app returns 5xx
- "Service Unavailable" error
- Cloud Run shows no healthy instances

**Investigation:**

1. Check Cloud Run status:
```bash
gcloud run services describe ui-client \
  --region=us-central1 \
  --project=gen-lang-client-0827795477
```

2. Check recent logs for errors:
```bash
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=ui-client AND severity>=ERROR" \
  --limit=20 \
  --project=gen-lang-client-0827795477
```

3. Check recent deployments:
```bash
gcloud run revisions list \
  --service=ui-client \
  --region=us-central1 \
  --project=gen-lang-client-0827795477
```

**Resolution:**

- If recent deploy caused issue: Rollback (see 3.2)
- If container crash: Check logs for startup errors
- If Nginx config issue: Verify nginx.conf in repo
- If no instances: Force new deployment

### 4.2 Demo Not Playing / Voice Not Working

**Symptoms:**
- Demo starts but no voice narration
- Console shows TTS errors
- Demo advances too quickly

**Investigation:**

1. Open browser DevTools Console
2. Look for errors like:
   - `CloudTTS: API request failed`
   - `VoiceNotification: SpeechSynthesis not supported`

**Resolution:**

| Cause | Solution |
|-------|----------|
| TTS API key invalid | Verify key in CloudTTS.ts |
| TTS API quota exceeded | Check GCP quotas, wait or request increase |
| Browser blocks audio | User must interact with page first |
| Network issue | Check network connectivity |

**Verification:**
```bash
# Test TTS API directly
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"input":{"text":"Test"},"voice":{"languageCode":"en-US","name":"en-US-Chirp3-HD-Achernar"},"audioConfig":{"audioEncoding":"MP3"}}' \
  "https://texttospeech.googleapis.com/v1/text:synthesize?key=YOUR_API_KEY"
```

### 4.3 Slow Page Load

**Symptoms:**
- Page takes > 5 seconds to load
- Lighthouse score < 50
- Users report slow performance

**Investigation:**

1. Run Lighthouse audit:
```bash
npx lighthouse https://ui-client-595822882252.us-central1.run.app --view
```

2. Check bundle size:
```bash
npm run build
ls -la dist/assets/
```

**Resolution:**

| Cause | Solution |
|-------|----------|
| Cold start | Set min-instances=1 |
| Large bundle | Enable code splitting |
| Slow CDN | Consider Cloud CDN |
| Map tiles slow | Pre-cache tile requests |

### 4.4 Map Not Displaying

**Symptoms:**
- Radar area is blank
- Console shows tile loading errors
- "Unable to load tiles" message

**Investigation:**

1. Check browser console for errors
2. Verify network requests to tile.openstreetmap.org
3. Check for CORS issues

**Resolution:**

| Cause | Solution |
|-------|----------|
| OSM down | Use alternative tile server |
| CORS blocked | Check CSP headers |
| Network issue | Verify connectivity |

---

## 5. Incident Response

### 5.1 Severity Levels

| Level | Definition | Response Time | Example |
|-------|------------|---------------|---------|
| SEV1 | Complete outage | 15 min | Site returns 5xx |
| SEV2 | Major degradation | 1 hour | Demo doesn't complete |
| SEV3 | Minor issue | 4 hours | Visual glitch |

### 5.2 Incident Commander Checklist

**For SEV1/SEV2:**

1. [ ] Acknowledge the incident
2. [ ] Start incident log (time, actions, findings)
3. [ ] Assess impact (who is affected?)
4. [ ] Check for recent changes (deploys, config changes)
5. [ ] Attempt quick fix (rollback if recent deploy)
6. [ ] Communicate status
7. [ ] Resolve or escalate
8. [ ] Document resolution
9. [ ] Schedule post-mortem if needed

### 5.3 Quick Reference

| Situation | First Action |
|-----------|--------------|
| Site down | Check Cloud Run status, rollback if recent deploy |
| Demo broken | Check browser console, verify TTS API |
| Performance issue | Check Cloud Run metrics, scale up if needed |
| Security issue | Rotate API keys, deploy fix |

---

## 6. Monitoring & Alerts

### 6.1 Key Metrics

| Metric | Good | Warning | Critical | Source |
|--------|------|---------|----------|--------|
| Request Latency P95 | < 500ms | 500-1000ms | > 1000ms | Cloud Run |
| Error Rate | < 0.1% | 0.1-1% | > 1% | Cloud Run |
| Instance Count | 1-2 | 3+ | 0 | Cloud Run |
| CPU Utilization | < 50% | 50-80% | > 80% | Cloud Run |

### 6.2 Viewing Metrics

```bash
# Open Cloud Run metrics in browser
open "https://console.cloud.google.com/run/detail/us-central1/ui-client/metrics?project=gen-lang-client-0827795477"
```

### 6.3 Alert Configuration (Future)

Alerts are not currently configured. To add:

1. Go to Cloud Monitoring
2. Create alerting policy
3. Set conditions (e.g., error rate > 1%)
4. Configure notification channel

---

## 7. Maintenance Procedures

### 7.1 Regular Maintenance

| Task | Frequency | Owner | Procedure |
|------|-----------|-------|-----------|
| npm audit | Weekly | Dev | `npm audit fix` |
| Dependency updates | Monthly | Dev | `npm update` |
| API key review | Quarterly | Security | Check GCP console |
| Log review | Weekly | Ops | Check Cloud Logging |

### 7.2 Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all dependencies
npm update

# Update specific package
npm update package-name

# Rebuild and test
npm run build
npm run dev  # manual test

# Deploy if successful
git add package*.json
git commit -m "chore: update dependencies"
git push origin main
```

### 7.3 Rotating API Keys

```bash
# 1. Create new API key
gcloud services api-keys create \
  --api-target=service=texttospeech.googleapis.com \
  --display-name="TTS Key v2" \
  --project=gen-lang-client-0827795477

# 2. Get new key value
gcloud services api-keys get-key-string KEY_ID

# 3. Update CloudTTS.ts with new key

# 4. Deploy update
git add src/audio/CloudTTS.ts
git commit -m "security: rotate TTS API key"
git push origin main

# 5. Delete old key (after verifying new one works)
gcloud services api-keys delete OLD_KEY_ID
```

---

## 8. Disaster Recovery

### 8.1 Backup & Restore

**What's Backed Up:**
- Source code (GitHub)
- Docker images (Artifact Registry)
- Configuration (in code)

**Recovery Procedure:**

If production is completely unavailable:

```bash
# 1. Clone fresh from GitHub
git clone https://github.com/ManavA/atcs-ng.git
cd atcs-ng

# 2. Build fresh
npm ci
npm run build

# 3. Deploy new image
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/gen-lang-client-0827795477/atcs-ng-repo/ui-client:recovery \
  --project=gen-lang-client-0827795477

gcloud run deploy ui-client \
  --image=us-central1-docker.pkg.dev/gen-lang-client-0827795477/atcs-ng-repo/ui-client:recovery \
  --region=us-central1 \
  --project=gen-lang-client-0827795477
```

### 8.2 Multi-Region (Future)

Currently deployed to us-central1 only. For higher availability:

```bash
# Deploy to additional region
gcloud run deploy ui-client-eu \
  --image=us-central1-docker.pkg.dev/gen-lang-client-0827795477/atcs-ng-repo/ui-client:v2.5.0 \
  --region=europe-west1 \
  --project=gen-lang-client-0827795477
```

---

## 9. FAQ

### Q: How do I check what version is deployed?

A: Open https://ui-client-595822882252.us-central1.run.app and look at the bottom-right of the status bar. The version (e.g., v2.5.0) is displayed.

### Q: Why is the demo voice robotic/different?

A: The demo uses Google Cloud TTS for high-quality voices. If you hear a robotic voice, Cloud TTS may have failed and the system fell back to browser speech synthesis. Check the console for errors.

### Q: How do I manually trigger a deployment?

A: Either:
1. Push to main branch (triggers CI/CD)
2. Go to GitHub Actions and run "Deploy to Cloud Run" manually
3. Use gcloud commands (see section 3.1)

### Q: The demo is stuck / not advancing

A: This could be due to:
1. Waiting for user interaction (check if buttons appear)
2. TTS failed and fallback timer not triggered
3. JavaScript error - check browser console

Try refreshing the page and starting the demo again.

### Q: How do I add a new scenario to the demo?

A: Edit `src/demo/scenarios/showcase-demo.ts` and add new steps following the existing pattern. Each step needs:
- `id`: Unique identifier
- `type`: 'narration', 'action', 'alert', or 'hero'
- `narrative`: Text to speak
- `autoAdvance`: Time in ms before auto-advancing

---

## 10. Contacts

| Role | Name | Contact |
|------|------|---------|
| Service Owner | Manav Agarwal | GitHub: @ManavA |
| Repository | GitHub | https://github.com/ManavA/atcs-ng |

---

## Appendix: Command Quick Reference

```bash
# Deployment
gcloud run deploy ui-client --image=IMAGE --region=us-central1

# Rollback
gcloud run services update-traffic ui-client --to-revisions=REVISION=100

# Logs
gcloud logging read "resource.labels.service_name=ui-client" --limit=50

# Scale
gcloud run services update ui-client --min-instances=1 --max-instances=5

# Service info
gcloud run services describe ui-client --region=us-central1

# Build
gcloud builds submit --tag=us-central1-docker.pkg.dev/.../ui-client:TAG

# List revisions
gcloud run revisions list --service=ui-client
```
