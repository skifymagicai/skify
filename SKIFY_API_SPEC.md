# Skify — API Spec (Initial Draft)

## Auth
- POST /auth/login
- POST /auth/register
- POST /auth/logout
- POST /auth/refresh

## User
- GET /user/profile
- PATCH /user/profile
- DELETE /user/account

## Video & Template
- POST /upload (video/photo)
- POST /analyze (extract style)
- GET /my-templates
- POST /apply-template/:templateId
- DELETE /my-templates/:templateId

## Rendering
- POST /export
- POST /enhance (4K)
- GET /job-status/:jobId

## Moderation & Licensing
- POST /music-license
- GET /moderation-queue (admin)
- POST /dmca/notice
- POST /dmca/counter

## Billing
- GET /billing/plans
- POST /billing/subscribe
- POST /billing/credits
- GET /billing/history

## Webhooks
- POST /webhook/job-update
- POST /webhook/license-update

---

All endpoints require authentication unless public. Use JWT or OAuth2.0. All responses are JSON. See SKIFY_MASTER_PROMPT.md for example payloads.
