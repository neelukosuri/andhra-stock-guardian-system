CREATE TABLE audit_logs
(
  log_id String,
  tenant_id String,
  user_id String,
  role String,
  action String,          -- e.g., 'search','export','login','delete_request'
  target String,          -- e.g., 'msisdn:91XXXXXXXXXX' or 'export:case123'
  parameters String,      -- JSON string of filters used
  timestamp DateTime64(3),
  request_id String
)
ENGINE = ReplacingMergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (tenant_id, timestamp);
