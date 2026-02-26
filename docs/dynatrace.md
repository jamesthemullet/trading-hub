# Dynatrace Set-Up On Trading Hub

## Overview

Trading Hub uses Dynatrace for comprehensive application monitoring, consisting of three main components:

1. Infrastructure monitoring via Brightcloud scripts
2. Server-side monitoring using Vercel's OpenTelemetry integration
3. Real User Monitoring (RUM) for frontend user experience tracking

## Setup Components

### 1. Brightcloud Scripts

- Purpose: Infrastructure-level monitoring
- Status: ✅ Implemented
- Documentation: [Internal setup guide](https://github.com/DigitalInnovation/Dynatrace/blob/main/docs/01-observability-dynatrace-onboarding.md)

### 2. Server-Side Monitoring (OpenTelemetry)

- Purpose: Server-side tracking (mostly NextAuth)
- Implementation: Vercel's `registerOTel` functionality (OpenTelemetry)
- Status: ✅ Implemented
- Code location: `/src/instrumentation.page.ts`

### 3. Real User Monitoring (RUM)

- Purpose: Frontend performance and user experience
- Status: ✅ Implemented (see [Known Issues](#known-issues) for environment-specific caveats)
- Script location: Injected via `_document.page.tsx`

## Configuration

### Service Names & IDs

| Environment | Service Name  | RUM App ID                     |
| ----------- | ------------- | ------------------------------ |
| Production  | `trading-hub` | `APPLICATION-8B5FD38038E5E2D3` |
| Development | `trading-hub` | `APPLICATION-085234AF123535B2` |

## Dashboards

### Production Dashboard

- URL: [Production Dashboard](https://hso67908.apps.dynatrace.com/ui/apps/dynatrace.dashboards/dashboard/5cba456a-92b1-4fcb-86a7-ec56e458f394)
- Key Metrics: Azure network performance, server errors, JavaScript errors, Core Web Vitals, smoke test results
- Variables: `serviceName=trading-hub`, `rumAppId=APPLICATION-8B5FD38038E5E2D3`

### Development Dashboard

- URL: [Development Dashboard](https://kqi08127.apps.dynatrace.com/ui/apps/dynatrace.dashboards/dashboard/0ce584b1-9c5e-434c-94b3-566f17d886c2)
- Key Metrics: Azure network performance, server errors, JavaScript errors, Core Web Vitals, smoke test results, PR Validate And Deploy build times
- Variables: `serviceName=trading-hub`, `rumAppId=APPLICATION-085234AF123535B2`

### Creating Custom Charts

1. Use DQL (Dynatrace Query Language) for complex queries
2. Use built-in Metrics/Events for standard monitoring
3. Tip: Copy existing charts from other teams' dashboards, but remember to update variables

## Monitoring

### Distributed Tracing

Server-side events tracked via `registerOTel` function, primarily capturing:

- NextAuth authentication flows
- API route performance
- Error tracking

### Frontend Monitoring

RUM data collection and configuration:

- [Production Frontend](https://hso67908.apps.dynatrace.com/ui/apps/dynatrace.classic.frontend/#uemapplications/uemappmetrics;uemapplicationId=APPLICATION-8B5FD38038E5E2D3)
- [Development Frontend](https://kqi08127.apps.dynatrace.com/ui/apps/dynatrace.classic.frontend/#uemapplications/uemappmetrics;uemapplicationId=APPLICATION-085234AF123535B2)

### Alerts & Workflows

#### Smoke Test Failure Alert

Purpose: Notify team of consecutive test failures
Dev Smoke Tests: [Workflow Configuration - Development](https://kqi08127.apps.dynatrace.com/ui/apps/dynatrace.automations/workflows/763c1fea-3092-4ccf-966a-8dfbf32d4fa8)
Prod Smoke Test: [Workflow Configuration - Production](https://hso67908.apps.dynatrace.com/ui/apps/dynatrace.automations/workflows/d0e2d9c1-1fd1-4eb0-8355-ea41a2070b2b?trigger=&view=live)

**Workflow Steps:**

1. Trigger: New DT smoke test table entry
2. Analysis: DQL query checking the last 3 results to identify patterns, such as 2 consecutive failures
3. Notification:
   - Email sent after detecting 2 consecutive failures (as identified in the analysis step)
   - Early warning to FE devs after 1 failure
   - Prevents spam by only sending until issue is resolved

#### Daily Notification Of JavaScript Failures

Purpose: Send a daily summary of JavaScript errors to the team
Dev: [Daily Failure Workflow](https://kqi08127.apps.dynatrace.com/ui/apps/dynatrace.automations/workflows/b31546ad-9a7c-4bc8-bdd3-b7b692bced93?trigger=&view=live)
Prod: [Daily Failure Workflow](https://hso67908.apps.dynatrace.com/ui/apps/dynatrace.automations/workflows/fa3dff9e-8b51-46be-93d1-bb0fff35147b?trigger=&view=live)

## Known Issues

### RUM Environment Detection

- Issue: Cannot distinguish between dev/prod environments in RUM script
- Impact: Same RUM script loads for both environments
- Mitigation: [XHR exclusion rule](https://hso67908.apps.dynatrace.com/ui/apps/dynatrace.classic.custom.applications/ui/settings/APPLICATION-8B5FD38038E5E2D3/builtin:rum.web.xhr-exclusion) configured for production
- Assessment: Minimal impact due to low traffic volume

## Troubleshooting

### Common Issues

1. Missing traces: Verify `OTEL_SERVICE_NAME` environment variable
2. RUM not loading: Check script injection in `_document.page.tsx`
3. Dashboard variables: Ensure correct `serviceName` and `rumAppId` values

## References

### Documentation

- [M&S Dynatrace Onboarding](https://github.com/DigitalInnovation/Dynatrace/blob/main/docs/01-observability-dynatrace-onboarding.md)
- [Onyx Server-Side Setup](https://onyx.engineering.mnscorp.net/capabilities/observability/dynatrace/backend.html)
- [Onyx RUM Setup](https://onyx.engineering.mnscorp.net/capabilities/observability/dynatrace/frontend.html)

### Quick Access Links

**Production Environment:**

- [Dashboard](https://hso67908.apps.dynatrace.com/ui/apps/dynatrace.dashboards/dashboard/5cba456a-92b1-4fcb-86a7-ec56e458f394)
- [Frontend Monitoring](https://hso67908.apps.dynatrace.com/ui/apps/dynatrace.classic.frontend/#uemapplications/uemappmetrics;uemapplicationId=APPLICATION-8B5FD38038E5E2D3)
- [Workflows](https://hso67908.apps.dynatrace.com/ui/apps/dynatrace.automations/workflows)

**Development Environment:**

- [Dashboard](https://kqi08127.apps.dynatrace.com/ui/apps/dynatrace.dashboards/dashboard/0ce584b1-9c5e-434c-94b3-566f17d886c2)
- [Frontend Monitoring](https://kqi08127.apps.dynatrace.com/ui/apps/dynatrace.classic.frontend/#uemapplications/uemappmetrics;uemapplicationId=APPLICATION-085234AF123535B2)
- [Workflows](https://kqi08127.apps.dynatrace.com/ui/apps/dynatrace.automations/workflows)
