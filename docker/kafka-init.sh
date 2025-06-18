#!/bin/bash
BROKER="broker:19092"

echo "Creating topic..."

/opt/kafka/bin/kafka-topics.sh --if-not-exists --create --topic reservations --bootstrap-server "$BROKER" --partitions 1 --replication-factor 1

echo "Topic created successfully!"