# Skify Backend

## API Documentation

See [openapi.yaml](./openapi.yaml) for the full OpenAPI 3.0 spec.

## Compliance & Moderation
- All endpoints include stubs for compliance, moderation, and error handling.
- See SKIFY_MASTER_PROMPT.md for requirements.

## Async Jobs
- Upload, analyze, and export use BullMQ + Redis for async processing.
- Job status available at `/api/status/:jobId`.

## Running
- `npm install`
- `npm run dev`

## Testing
- Add tests in `tests/` directory.
