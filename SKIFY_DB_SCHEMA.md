# Skify — Database Schema (Initial Draft)

## users
- id (uuid, pk)
- email (string, unique)
- password_hash (string)
- name (string)
- plan (enum: free, pro, enterprise)
- created_at (datetime)
- updated_at (datetime)

## templates
- id (uuid, pk)
- user_id (uuid, fk: users.id)
- metadata (jsonb)
- created_at (datetime)
- updated_at (datetime)

## videos
- id (uuid, pk)
- user_id (uuid, fk: users.id)
- url (string)
- status (enum: uploaded, analyzed, rendered, failed)
- metadata (jsonb)
- created_at (datetime)
- updated_at (datetime)

## jobs
- id (uuid, pk)
- user_id (uuid, fk: users.id)
- type (enum: analyze, render, enhance)
- status (enum: pending, processing, completed, failed)
- result_url (string)
- progress (int)
- error_code (string)
- created_at (datetime)
- updated_at (datetime)

## billing
- id (uuid, pk)
- user_id (uuid, fk: users.id)
- plan (string)
- amount (decimal)
- status (enum: paid, failed, refunded)
- created_at (datetime)

## moderation_logs
- id (uuid, pk)
- user_id (uuid, fk: users.id)
- video_id (uuid, fk: videos.id)
- status (enum: passed, failed, pending)
- reason (string)
- created_at (datetime)

---

This schema is a starting point. Extend for audit logs, webhooks, affiliate, and legal modules as needed.
