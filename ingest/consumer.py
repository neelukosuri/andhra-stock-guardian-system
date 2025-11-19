import json
import os
from datetime import datetime

from clickhouse_driver import Client
from kafka import KafkaConsumer
from kafka.errors import KafkaError

# --- Kafka Configuration ---
KAFKA_BROKER = os.environ.get('KAFKA_BROKER', 'kafka:9092')
TOPIC_NAME = 'tenantA.ipdr'
CONSUMER_GROUP = 'cdr-ipdr-analyzer-group'

# --- ClickHouse Configuration ---
CLICKHOUSE_HOST = os.environ.get('CLICKHOUSE_HOST', 'clickhouse')
CLICKHOUSE_PORT = os.environ.get('CLICKHOUSE_PORT', 9000)
CLICKHOUSE_USER = os.environ.get('CLICKHOUSE_USER', 'default')
CLICKHOUSE_PASSWORD = os.environ.get('CLICKHOUSE_PASSWORD', '')
CLICKHOUSE_DB = os.environ.get('CLICKHOUSE_DB', 'default')

def get_clickhouse_client():
    """Establishes and returns a connection to the ClickHouse database."""
    try:
        client = Client(
            host=CLICKHOUSE_HOST,
            port=CLICKHOUSE_PORT,
            user=CLICKHOUSE_USER,
            password=CLICKHOUSE_PASSWORD,
            database=CLICKHOUSE_DB
        )
        print("Successfully connected to ClickHouse.")
        return client
    except Exception as e:
        print(f"Failed to connect to ClickHouse: {e}")
        return None

def transform_for_clickhouse(record):
    """
    Transforms a raw Kafka record (dict) into a tuple suitable for ClickHouse insertion.
    Returns None if the record is invalid.
    """
    try:
        # Map JSON fields to the 'events_canonical' table columns
        # Provide default values for fields that might be missing from the source record
        data = {
            'event_id': record.get('event_id'),
            'tenant_id': 'tenantA',  # Hardcoded for this consumer, could be dynamic
            'session_id': record.get('session_id'),
            'ts': datetime.fromisoformat(record['ts'].replace('Z', '+00:00')),
            'event_type': 'data', # Inferred from the topic
            'msisdn': record.get('msisdn'),
            'imsi': record.get('imsi'),
            'imei': record.get('imei'),
            'subscriber_id': record.get('subscriber_id'),
            'source_ip': record.get('src_ip'),
            'dest_ip': record.get('dst_ip'),
            'source_port': record.get('src_port'),
            'dest_port': record.get('dst_port'),
            'protocol': record.get('protocol'),
            'bytes_in': record.get('bytes_in'),
            'bytes_out': record.get('bytes_out'),
            'duration_ms': record.get('duration_ms'),
            'service_type': record.get('service'),
            'user_agent': record.get('user_agent'),
            'roaming_flag': record.get('roaming_flag', 0),
            'raw_payload': record.get('raw_payload')
        }
        return [data] # The client expects a list of dictionaries
    except (KeyError, TypeError) as e:
        print(f"[ERROR] Failed to transform record due to missing key or wrong type: {e}. Record: {record}")
        return None

def main():
    """
    Connects to Kafka, consumes messages, transforms them, and inserts them into ClickHouse.
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
    except KafkaError as e:
        print(f"Failed to connect to Kafka: {e}")
        return

    ch_client = get_clickhouse_client()
    if not ch_client:
        return

    try:
        for message in consumer:
            record = message.value
            print("\n" + "="*50)
            print(f"Received message: Partition={message.partition}, Offset={message.offset}")

            transformed_data = transform_for_clickhouse(record)

            if transformed_data:
                try:
                    ch_client.execute(
                        'INSERT INTO events_canonical (event_id, tenant_id, session_id, ts, event_type, msisdn, imsi, imei, subscriber_id, source_ip, dest_ip, source_port, dest_port, protocol, bytes_in, bytes_out, duration_ms, service_type, user_agent, roaming_flag, raw_payload) VALUES',
                        transformed_data,
                        types_check=True
                    )
                    print(f"Successfully inserted record {transformed_data[0]['event_id']} into ClickHouse.")
                except Exception as e:
                    print(f"[ERROR] Failed to insert record into ClickHouse: {e}")
                    # In a real system, send this to a dead-letter queue.

    except KeyboardInterrupt:
        print("\nConsumer interrupted. Shutting down...")
    finally:
        consumer.close()
        if ch_client:
            ch_client.disconnect()
        print("Kafka consumer and ClickHouse client closed.")


if __name__ == '__main__':
    main()
