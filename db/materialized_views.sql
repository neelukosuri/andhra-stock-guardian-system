-- This materialized view provides a daily summary of key metrics per subscriber.
-- It is designed to power the main dashboard and other high-level analytical queries
-- by pre-aggregating data from the `sessions` table.

CREATE MATERIALIZED VIEW daily_subscriber_summary
ENGINE = SummingMergeTree()
PARTITION BY (toYYYYMM(day))
ORDER BY (tenant_id, day, subscriber_id)
POPULATE -- Populate the view with existing data from the source table upon creation.
AS SELECT
    tenant_id,
    subscriber_id,
    toDate(start_ts) AS day,
    count() AS session_count,
    sum(duration_ms) AS total_duration_ms,
    sum(total_bytes_in + total_bytes_out) AS total_bytes,
    avg(risk_score) AS avg_risk_score
FROM sessions
GROUP BY
    tenant_id,
    subscriber_id,
    day;
