# SFTP Ingestion Agent

This directory contains a file-based ingestion agent that simulates an SFTP pickup process. The agent watches a specified directory for new files, processes them, and sends their records to a Kafka topic.

## Components

-   **`agent.py`**: The main Python script that runs the file watcher and Kafka producer.
-   **`requirements.txt`**: Lists the Python dependencies (`paramiko`, `watchdog`, `kafka-python`).
-   **`sample_data.jsonl`**: A sample data file containing IPDR records in JSON Lines format, which can be used for testing the agent.

## Prerequisites

-   A running Kafka instance.
-   Python 3.6+ and `pip` installed.

## Setup

1.  **Install Dependencies:**
    Navigate to this directory and install the required libraries:
    ```bash
    pip install -r requirements.txt
    ```

## Configuration

The agent is configured using environment variables:

-   `KAFKA_BROKER`: The address of the Kafka broker. Defaults to `kafka:9092`.
-   `WATCH_DIRECTORY`: The local directory that the agent should monitor for new files. Defaults to `./sftp_drop`.

## Usage

1.  **Start the Agent:**
    Run the agent script from your terminal. It will create the watch directory if it doesn't exist and begin monitoring for new files.
    ```bash
    python agent.py
    ```
    The agent will log that it is watching the directory.

2.  **Test the Agent:**
    In a separate terminal, copy the sample data file into the watch directory.
    ```bash
    cp sample_data.jsonl ./sftp_drop/
    ```

    The agent's terminal should log the following actions:
    -   Detection of the new file.
    -   Sending each record from the file to the Kafka topic.
    -   Archiving the processed file into a `processed` subdirectory (`./sftp_drop/processed/`).

    If you have the consumer from the `ingest` service running, you will see the records from the file being processed and inserted into ClickHouse.
