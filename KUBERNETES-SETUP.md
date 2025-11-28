# Kubernetes Setup with Docker (Kind)

This guide explains how to run your Kubernetes cluster locally using Kind (Kubernetes in Docker).

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop)
2. **Kind (Kubernetes in Docker)** - Install using one of these methods:
   - **Windows (Chocolatey):** `choco install kind`
   - **Windows (Scoop):** `scoop install kind`
   - **macOS (Homebrew):** `brew install kind`
   - **Linux:** Follow [Kind installation guide](https://kind.sigs.k8s.io/docs/user/quick-start/#installation)
3. **kubectl** - Kubernetes command-line tool:
   - **Windows (Chocolatey):** `choco install kubernetes-cli`
   - **macOS (Homebrew):** `brew install kubectl`
   - **Linux:** Follow [kubectl installation guide](https://kubernetes.io/docs/tasks/tools/)

## Quick Start

### Windows (PowerShell)

```powershell
# Run the setup script
.\setup-k8s.ps1
```

### Linux/macOS (Bash)

```bash
# Make scripts executable (if needed)
chmod +x setup-k8s.sh cleanup-k8s.sh

# Run the setup script
./setup-k8s.sh
```

## What the Setup Script Does

The setup script (`setup-k8s.ps1` or `setup-k8s.sh`) will:

1. ✅ Check if Kind, Docker, and kubectl are installed
2. ✅ Create a new Kind cluster named `arbeit-cluster`
3. ✅ Build Docker images for backend and frontend
4. ✅ Load images into the Kind cluster
5. ✅ Update deployment files to use local images
6. ✅ Deploy all Kubernetes manifests from the `k8s/` directory

## Accessing Your Services

After deployment, your services will be accessible at:

- **Frontend:** http://localhost:30080
- **Backend API:** http://localhost:30090
- **MySQL:** localhost:3306 (from within the cluster)

## Useful Commands

### Check Cluster Status

```bash
# View all pods
kubectl get pods

# View all services
kubectl get services

# View all deployments
kubectl get deployments

# View cluster info
kubectl cluster-info
```

### View Logs

```bash
# Backend logs
kubectl logs -f deployment/arbeit-backend

# Frontend logs
kubectl logs -f deployment/arbeit-frontend

# MySQL logs
kubectl logs -f deployment/arbeit-mysql
```

### Debugging

```bash
# Describe a pod to see events and status
kubectl describe pod <pod-name>

# Get pod details
kubectl get pod <pod-name> -o yaml

# Execute commands in a pod
kubectl exec -it <pod-name> -- /bin/sh
```

### Restart Deployments

```bash
# Restart backend
kubectl rollout restart deployment/arbeit-backend

# Restart frontend
kubectl rollout restart deployment/arbeit-frontend
```

### Update Deployments

After making changes to your code:

```bash
# Rebuild and reload images
docker build -t arbeit-backend:latest ./backend
docker build -t arbeit-frontend:latest ./frontend

kind load docker-image arbeit-backend:latest --name arbeit-cluster
kind load docker-image arbeit-frontend:latest --name arbeit-cluster

# Restart deployments to use new images
kubectl rollout restart deployment/arbeit-backend
kubectl rollout restart deployment/arbeit-frontend
```

## Cleanup

To remove the Kubernetes cluster:

### Windows (PowerShell)
```powershell
.\cleanup-k8s.ps1
```

### Linux/macOS (Bash)
```bash
./cleanup-k8s.sh
```

Or manually:
```bash
kind delete cluster --name arbeit-cluster
```

## Troubleshooting

### Cluster Creation Fails

- Ensure Docker Desktop is running
- Check if ports 30080, 30090, and 3306 are available
- Try deleting existing cluster: `kind delete cluster --name arbeit-cluster`

### Pods Not Starting

```bash
# Check pod status
kubectl get pods

# View pod events
kubectl describe pod <pod-name>

# Check if images are loaded
docker images | grep arbeit
```

### Services Not Accessible

- Verify services are running: `kubectl get services`
- Check if NodePort services are configured correctly
- Ensure pods are in `Running` state: `kubectl get pods`

### Image Pull Errors

If you see image pull errors, ensure images are loaded into Kind:
```bash
kind load docker-image arbeit-backend:latest --name arbeit-cluster
kind load docker-image arbeit-frontend:latest --name arbeit-cluster
```

## Architecture

The Kubernetes setup includes:

- **Frontend Deployment:** Next.js application served via Nginx
- **Backend Deployment:** Spring Boot application
- **MySQL Deployment:** Database with persistent volume
- **Services:** NodePort services exposing frontend (30080) and backend (30090)
- **ConfigMaps:** Configuration for frontend and backend
- **Secrets:** Database credentials
- **Ingress:** (Optional) For routing with custom domains

## Next Steps

- Set up Ingress controller for custom domains
- Configure persistent volumes for data storage
- Set up monitoring and logging
- Configure resource limits and requests
- Set up horizontal pod autoscaling

