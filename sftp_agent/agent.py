import json
import os
import time
import logging

from kafka import KafkaProducer
from kafka.errors import KafkaError
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# --- Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

KAFKA_BROKER = os.environ.get('KAFKA_BROKER', 'kafka:9092')
TOPIC_NAME = 'tenantA.ipdr'
WATCH_DIRECTORY = os.environ.get('WATCH_DIRECTORY', './sftp_drop')
PROCESSED_DIRECTORY = os.path.join(WATCH_DIRECTORY, 'processed')

def create_kafka_producer():
    """Creates and returns a KafkaProducer instance."""
    try:
        producer = KafkaProducer(
            bootstrap_servers=[KAFKA_BROKER],
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            retries=5,
            request_timeout_ms=30000
        )
        logging.info(f"Successfully connected to Kafka at {KAFKA_BROKER}")
        return producer
    except KafkaError as e:
        logging.error(f"Failed to connect to Kafka: {e}")
        return None

class NewFileHandler(FileSystemEventHandler):
    def __init__(self, producer):
        self.producer = producer

    def on_created(self, event):
        if event.is_directory or not os.path.exists(event.src_path):
            return

        logging.info(f"New file detected: {event.src_path}")
        # Wait a moment to ensure the file is fully written
        time.sleep(1)
        self.process_file(event.src_path)

    def process_file(self, file_path):
        """Reads a file line-by-line, sending each line as a record to Kafka."""
        try:
            with open(file_path, 'r') as f:
                for i, line in enumerate(f):
                    try:
                        record = json.loads(line)
                        self.producer.send(TOPIC_NAME, value=record)
                        logging.info(f"Sent record {i+1} from {os.path.basename(file_path)} to Kafka.")
                    except json.JSONDecodeError:
                        logging.warning(f"Skipping invalid JSON on line {i+1} in {file_path}")
                    except KafkaError as e:
                        logging.error(f"Failed to send record from line {i+1} to Kafka: {e}")

            self.producer.flush()
            logging.info(f"Finished processing {file_path}.")
            self.archive_file(file_path)

        except IOError as e:
            logging.error(f"Could not read file {file_path}: {e}")

    def archive_file(self, file_path):
        """Moves the processed file to the 'processed' subdirectory."""
        if not os.path.exists(PROCESSED_DIRECTORY):
            os.makedirs(PROCESSED_DIRECTORY)

        dest_path = os.path.join(PROCESSED_DIRECTORY, os.path.basename(file_path))
        try:
            os.rename(file_path, dest_path)
            logging.info(f"Archived file to {dest_path}")
        except OSError as e:
            logging.error(f"Could not archive file {file_path}: {e}")

def main():
    """Starts the file watcher and Kafka producer."""
    if not os.path.exists(WATCH_DIRECTORY):
        logging.info(f"Watch directory '{WATCH_DIRECTORY}' does not exist. Creating it.")
        os.makedirs(WATCH_DIRECTORY)

    producer = create_kafka_producer()
    if not producer:
        return

    event_handler = NewFileHandler(producer)
    observer = Observer()
    observer.schedule(event_handler, WATCH_DIRECTORY, recursive=False)

    logging.info(f"Watching directory '{WATCH_DIRECTORY}' for new files...")
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logging.info("Shutting down agent...")
        observer.stop()
    finally:
        observer.join()
        producer.close()
        logging.info("Agent shut down successfully.")

if __name__ == "__main__":
    main()
