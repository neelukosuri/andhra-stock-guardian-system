# Database Schema DDLs

This directory contains the ClickHouse Data Definition Language (DDL) files for creating the necessary tables and views for the CDR/IPDR Analysis Web Application.

## Execution Order

The scripts should be executed in the following order to ensure that dependencies are correctly handled (e.g., materialized views are created after their source tables).

1.  **`events_canonical.sql`**: Creates the core table for storing raw, normalized event records from various sources.
2.  **`audit_logs.sql`**: Creates the table for logging all user and system actions to ensure a secure and auditable trail.
3.  **`sessions.sql`**: Creates the table to store session-level aggregations, which are computed by the stream processing engine.
4.  **`materialized_views.sql`**: Creates materialized views that pre-aggregate data to power dashboards and accelerate common analytical queries. The `daily_subscriber_summary` view in this file depends on the `sessions` table.
