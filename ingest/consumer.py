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
    Transforms a raw Kafka record (dict) into a dictionary suitable for ClickHouse insertion,
    ensuring all columns from the 'events_canonical' table are present.
    Returns None if the record is invalid.
    """
    try:
        # Full mapping of all fields in the events_canonical table.
        # Use .get() to provide None as a default for missing fields in the JSON record.
        data = {
            'event_id': record.get('event_id'),
            'tenant_id': 'tenantA',  # Hardcoded for this consumer
            'session_id': record.get('session_id'),
            'ts': datetime.fromisoformat(record['ts'].replace('Z', '+00:00')),
            'ingestion_ts': datetime.utcnow(),
            'event_type': 'data',  # Inferred from the topic
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
            'qos_class': record.get('qos_class'),
            'user_agent': record.get('user_agent'),
            'handset_model': record.get('handset_model'),
            'roaming_flag': record.get('roaming_flag', 0),
            'cell_id': record.get('cell_id'),
            'city': record.get('city'),
            'country': record.get('country'),
            'direction': record.get('direction'),
            'call_status': record.get('call_status'),
            'raw_payload': record.get('raw_payload'),
            'export_user_id': None, # Not applicable at ingest time
            'risk_score': 0.0,      # Default value, to be populated by ML models later
            'model_tags': []        # Default value
        }
        return [data]  # The client expects a list of dictionaries
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

    # The full list of columns in the correct order for the INSERT statement.
    columns = [
        'event_id', 'tenant_id', 'session_id', 'ts', 'ingestion_ts', 'event_type',
        'msisdn', 'imsi', 'imei', 'subscriber_id', 'source_ip', 'dest_ip', 'source_port',
        'dest_port', 'protocol', 'bytes_in', 'bytes_out', 'duration_ms', 'service_type',
        'qos_class', 'user_agent', 'handset_model', 'roaming_flag', 'cell_id', 'city',
        'country', 'direction', 'call_status', 'raw_payload', 'export_user_id',
        'risk_score', 'model_tags'
    ]
    insert_query = f"INSERT INTO events_canonical ({', '.join(columns)}) VALUES"

    try:
        for message in consumer:
            record = message.value
            print("\n" + "="*50)
            print(f"Received message: Partition={message.partition}, Offset={message.offset}")

            transformed_data = transform_for_clickhouse(record)

            if transformed_data:
                try:
                    ch_client.execute(insert_query, transformed_data, types_check=True)
                    print(f"Successfully inserted record {transformed_data[0]['event_id']} into ClickHouse.")
                except Exception as e:
                    print(f"[ERROR] Failed to insert record into ClickHouse: {e}")

    except KeyboardInterrupt:
        print("\nConsumer interrupted. Shutting down...")
    finally:
        consumer.close()
        if ch_client:
            ch_client.disconnect()
        print("Kafka consumer and ClickHouse client closed.")


if __name__ == '__main__':
    main()
