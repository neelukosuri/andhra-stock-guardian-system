# Ingestion Service

This directory contains the components for a basic Kafka-based data ingestion pipeline. It consumes records from Kafka, transforms them, and inserts them into a ClickHouse database.

## Components

-   **`producer.py`**: A Python script that generates a sample IPDR record and sends it to a Kafka topic for testing.
-   **`consumer.py`**: A Python script that consumes records from Kafka, maps them to the `events_canonical` schema, and writes them to ClickHouse.
-   **`requirements.txt`**: Lists the Python dependencies (`kafka-python`, `clickhouse-driver`).

## Prerequisites

-   A running Kafka instance.
-   A running ClickHouse instance with the `events_canonical` table created.
-   Python 3.6+ and `pip` installed.

## Setup

1.  **Install Dependencies:**
    Navigate to this directory and install the required libraries:
    ```bash
    pip install -r requirements.txt
    ```

## Configuration

The service is configured via environment variables.

### Kafka Configuration

-   `KAFKA_BROKER`: The address of the Kafka broker. Defaults to `kafka:9092`.

### ClickHouse Configuration

The consumer script requires connection details for the ClickHouse database.

-   `CLICKHOUSE_HOST`: The hostname of the ClickHouse server. Defaults to `clickhouse`.
-   `CLICKHOUSE_PORT`: The port for the ClickHouse server. Defaults to `9000`.
-   `CLICKHOUSE_USER`: The username for the database connection. Defaults to `default`.
-   `CLICKHOUSE_PASSWORD`: The password for the database connection. Defaults to an empty string.
-   `CLICKHOUSE_DB`: The database name to use. Defaults to `default`.

## Usage

1.  **Start the Consumer:**
    Set the necessary environment variables and run the consumer. It will connect to Kafka and ClickHouse and begin processing messages.
    ```bash
    # Example for local development
    export CLICKHOUSE_HOST=localhost
    python consumer.py
    ```

2.  **Run the Producer:**
    In a separate terminal, run the producer to send a test message.
    ```bash
    python producer.py
    ```
    The consumer's terminal should show the message being received and then report a successful insertion into ClickHouse.
