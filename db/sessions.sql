-- This table stores session-level aggregations computed by the stream processing engine.
-- A session is a collection of related events (e.g., all data flows for a user within a specific time window).
CREATE TABLE sessions
(
    session_id String,
    tenant_id String,
    subscriber_id String,
    msisdn String,
    imsi String,
    imei String,
    start_ts DateTime64(3),
    end_ts DateTime64(3),

    -- Aggregated metrics
    duration_ms UInt64,
    total_bytes_in UInt64,
    total_bytes_out UInt64,
    event_count UInt64,
    unique_dest_ip_count UInt64,
    unique_dest_port_count UInt64,

    -- Enrichment & ML Scoring
    risk_score Float32,
    model_tags Array(String),
    unusual_time_flag UInt8 DEFAULT 0,

    -- Keep a sample of cell IDs visited during the session
    cell_ids Array(String)
)
ENGINE = ReplacingMergeTree(end_ts) -- Use end_ts as the version column to allow for late-arriving data to update sessions.
PARTITION BY (toYYYYMM(start_ts), tenant_id)
ORDER BY (tenant_id, subscriber_id, start_ts, session_id);
