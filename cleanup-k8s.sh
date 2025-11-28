#!/bin/bash

# Bash script to clean up Kubernetes cluster

echo "Cleaning up Kubernetes cluster..."

# Delete Kind cluster
if kind get clusters 2>/dev/null | grep -q "arbeit-cluster"; then
    echo "Deleting Kind cluster..."
    kind delete cluster --name arbeit-cluster
    echo "Cluster deleted successfully ✓"
else
    echo "No cluster found to delete."
fi

echo "Cleanup complete!"

