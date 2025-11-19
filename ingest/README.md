# Ingestion Service

This directory contains the components for a basic Kafka-based data ingestion pipeline, serving as the entry point for CDR/IPDR data into the analysis application.

## Components

-   **`producer.py`**: A Python script that generates a single, sample IPDR record and sends it to a Kafka topic. This is useful for development and for testing the ingestion flow.
-   **`consumer.py`**: A Python script that connects to the Kafka topic, consumes records, performs a basic validation against the expected schema, and prints them to the console. This script represents the first step of the stream processing pipeline.
-   **`requirements.txt`**: A file listing the `kafka-python` dependency required for these scripts.

## Prerequisites

-   A running Kafka instance.
-   Python 3.6+ and `pip` installed.

## Setup

1.  **Install Dependencies:**
    Navigate to this directory in your terminal and install the required libraries:
    ```bash
    pip install -r requirements.txt
    ```

## Usage

The producer and consumer scripts are designed to be run in separate terminal sessions to observe the real-time message flow.

1.  **Start the Consumer:**
    In your first terminal, start the consumer script. It will connect to Kafka and wait for incoming messages on the configured topic.
    ```bash
    python consumer.py
    ```

2.  **Run the Producer:**
    In a second terminal, run the producer script. It will send one sample message and then exit.
    ```bash
    python producer.py
    ```

    Upon successful execution, you should see the formatted JSON record appear in the terminal where the consumer is running.

## Configuration

The Kafka broker address (`KAFKA_BROKER`) and topic name (`TOPIC_NAME`) can be configured at the top of both `producer.py` and `consumer.py`. The default broker address is set to `kafka:9092`, which is a common hostname in Docker Compose environments. If you are running Kafka locally, you may need to change this to `localhost:9092`.
