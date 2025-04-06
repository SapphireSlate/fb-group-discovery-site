#!/bin/bash

# Script to run the Stripe Agent Toolkit

echo "Starting Stripe Agent Toolkit..."

# Run the Stripe Agent Toolkit with the restricted API key
# Use the local node_modules version
NODE_PATH=./node_modules npx -y @stripe/agent-toolkit run --stripe-api-key=rk_test_51RALhqPYjlAr0Vm6jNcfXMshAKqOMhN03tOZLP45177yeXxC2HY1Py3Fzbb67v8meWs60XogQILzlXR28qGDWvaZ00ZwD05Tv8

# Note: In a production environment, you should use environment variables instead of hardcoded keys
# Example: NODE_PATH=./node_modules npx -y @stripe/agent-toolkit run --stripe-api-key=$STRIPE_RESTRICTED_KEY 