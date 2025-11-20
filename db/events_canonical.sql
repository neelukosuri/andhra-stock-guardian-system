CREATE TABLE events_canonical
(
  event_id String,
  tenant_id String,
  session_id String,
  ts DateTime64(3),
  ingestion_ts DateTime64(3) DEFAULT now(),
  event_type Enum8('call'=1,'sms'=2,'data'=3,'session'=4,'auth'=5),
  msisdn String,
  imsi String,
  imei String,
  subscriber_id String,
  source_ip String,
  dest_ip String,
  source_port UInt16,
  dest_port UInt16,
  protocol String,
  bytes_in UInt64,
  bytes_out UInt64,
  duration_ms UInt64,
  service_type String,
  qos_class String,
  user_agent String,
  handset_model String,
  roaming_flag UInt8,
  cell_id String,
  city String,
  country String,
  direction Enum8('uplink' = 1, 'downlink' = 2),
  call_status String,
  raw_payload String,
  export_user_id String,
  risk_score Float32 DEFAULT 0.0,
  model_tags Array(String)
)
ENGINE = MergeTree()
PARTITION BY (toYYYYMM(ts), tenant_id)
ORDER BY (tenant_id, ts, event_id);
