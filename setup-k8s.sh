#!/bin/bash

# Bash script to set up Kubernetes cluster using Kind (Kubernetes in Docker)
# This script will:
# 1. Check if Kind is installed
# 2. Create a Kind cluster
# 3. Build Docker images
# 4. Load images into Kind cluster
# 5. Deploy Kubernetes manifests

set -e

echo "========================================="
echo "Setting up Kubernetes with Docker (Kind)"
echo "========================================="

# Check if Kind is installed
echo ""
echo "[1/6] Checking if Kind is installed..."
if ! command -v kind &> /dev/null; then
    echo "Kind is not installed. Please install Kind first:"
    echo "  https://kind.sigs.k8s.io/docs/user/quick-start/#installation"
    exit 1
fi
echo "Kind is installed ✓"

# Check if Docker is running
echo ""
echo "[2/6] Checking if Docker is running..."
if ! docker ps &> /dev/null; then
    echo "Docker is not running. Please start Docker."
    exit 1
fi
echo "Docker is running ✓"

# Check if kubectl is installed
echo ""
echo "[3/6] Checking if kubectl is installed..."
if ! command -v kubectl &> /dev/null; then
    echo "kubectl is not installed. Please install kubectl first:"
    echo "  https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi
echo "kubectl is installed ✓"

# Delete existing cluster if it exists
echo ""
echo "[4/6] Checking for existing cluster..."
if kind get clusters 2>/dev/null | grep -q "arbeit-cluster"; then
    echo "Existing cluster found. Deleting..."
    kind delete cluster --name arbeit-cluster
    sleep 2
fi

# Create Kind cluster
echo ""
echo "[5/6] Creating Kind cluster..."
kind create cluster --name arbeit-cluster --config kind-config.yaml
echo "Kind cluster created successfully ✓"

# Set kubectl context
kubectl cluster-info --context kind-arbeit-cluster &> /dev/null

# Build Docker images
echo ""
echo "[6/6] Building Docker images..."

echo "  Building backend image..."
docker build -t arbeit-backend:latest ./backend

echo "  Building frontend image..."
docker build -t arbeit-frontend:latest ./frontend

# Load images into Kind cluster
echo ""
echo "[7/7] Loading images into Kind cluster..."
kind load docker-image arbeit-backend:latest --name arbeit-cluster
kind load docker-image arbeit-frontend:latest --name arbeit-cluster
echo "Images loaded successfully ✓"

# Update deployment files to use local images
echo ""
echo "[8/8] Updating deployment files..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' 's|dex006/arbeit-backend:latest|arbeit-backend:latest|g' k8s/backend-deployment.yaml
    sed -i '' 's|dex006/arbeit-frontend:latest|arbeit-frontend:latest|g' k8s/frontend-deployment.yaml
    sed -i '' 's|imagePullPolicy: IfNotPresent|imagePullPolicy: Never|g' k8s/backend-deployment.yaml
    sed -i '' 's|imagePullPolicy: IfNotPresent|imagePullPolicy: Never|g' k8s/frontend-deployment.yaml
else
    # Linux
    sed -i 's|dex006/arbeit-backend:latest|arbeit-backend:latest|g' k8s/backend-deployment.yaml
    sed -i 's|dex006/arbeit-frontend:latest|arbeit-frontend:latest|g' k8s/frontend-deployment.yaml
    sed -i 's|imagePullPolicy: IfNotPresent|imagePullPolicy: Never|g' k8s/backend-deployment.yaml
    sed -i 's|imagePullPolicy: IfNotPresent|imagePullPolicy: Never|g' k8s/frontend-deployment.yaml
fi

# Deploy Kubernetes manifests
echo ""
echo "[9/9] Deploying Kubernetes manifests..."
kubectl apply -f k8s/

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "To check status, run:"
echo "  kubectl get pods"
echo "  kubectl get services"
echo ""
echo "To access services:"
echo "  Frontend: http://localhost:30080"
echo "  Backend:  http://localhost:30090"
echo ""
echo "To view logs:"
echo "  kubectl logs -f deployment/arbeit-backend"
echo "  kubectl logs -f deployment/arbeit-frontend"
echo ""
echo "To delete cluster:"
echo "  kind delete cluster --name arbeit-cluster"

