import json
import uuid
from datetime import datetime

from kafka import KafkaProducer
from kafka.errors import KafkaError

# --- Configuration ---
KAFKA_BROKER = 'kafka:9092'  # Use 'localhost:9092' if running Kafka locally without Docker compose
TOPIC_NAME = 'tenantA.ipdr'

def create_sample_ipdr_record():
    """Creates a sample IPDR record conforming to the ipdr.v1 schema."""
    return {
        "event_id": str(uuid.uuid4()),
        "ts": datetime.utcnow().isoformat() + "Z", # ISO 8601 format with Z for UTC
        "subscriber_id": "sub_5551234",
        "src_ip": "198.51.100.5",
        "dst_ip": "203.0.113.88",
        "src_port": 49152,
        "dst_port": 443,
        "bytes_in": 1536,
        "bytes_out": 8192,
        "service": "HTTPS",
        "raw_payload": None
    }

def main():
    """
    Connects to Kafka and sends a single sample IPDR record to the topic.
    """
    print(f"Attempting to connect to Kafka at {KAFKA_BROKER}...")

    try:
        producer = KafkaProducer(
            bootstrap_servers=[KAFKA_BROKER],
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            retries=5,
            request_timeout_ms=30000
        )
        print("Successfully connected to Kafka.")
    except KafkaError as e:
        print(f"Failed to connect to Kafka: {e}")
        print("Please ensure Kafka is running and accessible.")
        return

    record = create_sample_ipdr_record()

    print(f"Sending record to topic '{TOPIC_NAME}':")
    print(json.dumps(record, indent=2))

    try:
        future = producer.send(TOPIC_NAME, value=record)
        record_metadata = future.get(timeout=10)
        print(f"Successfully sent record to topic '{record_metadata.topic}' (partition {record_metadata.partition}, offset {record_metadata.offset})")

    except KafkaError as e:
        print(f"Failed to send record to Kafka: {e}")

    finally:
        producer.flush()
        producer.close()
        print("Kafka producer closed.")


if __name__ == '__main__':
    main()
