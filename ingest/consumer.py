import json

from kafka import KafkaConsumer
from kafka.errors import KafkaError

# --- Configuration ---
KAFKA_BROKER = 'kafka:9092'  # Use 'localhost:9092' if running Kafka locally without Docker compose
TOPIC_NAME = 'tenantA.ipdr'
CONSUMER_GROUP = 'cdr-ipdr-analyzer-group'

def validate_record(record):
    """
    Performs basic validation on the consumed record based on the ipdr.v1 schema.
    Checks for the presence of essential keys. Returns True if valid, False otherwise.
    """
    required_keys = ["event_id", "ts", "subscriber_id", "src_ip", "dst_ip"]
    if not isinstance(record, dict):
        print(f"[ERROR] Record is not a valid JSON object: {record}")
        return False

    missing_keys = [key for key in required_keys if key not in record]
    if missing_keys:
        print(f"[WARN] Record missing required keys: {', '.join(missing_keys)}. Record: {record}")
        return False
    return True

def main():
    """
    Connects to Kafka, subscribes to a topic, and consumes messages indefinitely.
    """
    print(f"Attempting to connect to Kafka at {KAFKA_BROKER}...")

    try:
        consumer = KafkaConsumer(
            TOPIC_NAME,
            bootstrap_servers=[KAFKA_BROKER],
            group_id=CONSUMER_GROUP,
            auto_offset_reset='earliest',
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        print("Successfully connected to Kafka.")
        print(f"Listening for messages on topic '{TOPIC_NAME}'...")
    except KafkaError as e:
        print(f"Failed to connect to Kafka: {e}")
        print("Please ensure Kafka is running and accessible.")
        return

    try:
        for message in consumer:
            record = message.value
            print("\n" + "="*50)
            print(f"Received message: Partition={message.partition}, Offset={message.offset}")

            if validate_record(record):
                print("Record is valid.")
                print(json.dumps(record, indent=2))
                # Here, the record would be passed to the next stage (e.g., enrichment).
            else:
                print("Record is invalid and should be sent to quarantine.")
                # In a real system, this would be pushed to a 'tenantA.quarantine' topic.

    except KeyboardInterrupt:
        print("\nConsumer interrupted by user. Shutting down...")
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON message: {e}")
    finally:
        consumer.close()
        print("Kafka consumer closed.")


if __name__ == '__main__':
    main()
