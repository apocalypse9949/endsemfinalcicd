# PowerShell script to set up Kubernetes cluster using Kind (Kubernetes in Docker)
# This script will:
# 1. Check if Kind is installed
# 2. Create a Kind cluster
# 3. Build Docker images
# 4. Load images into Kind cluster
# 5. Deploy Kubernetes manifests

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Setting up Kubernetes with Docker (Kind)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check if Kind is installed
Write-Host "`n[1/6] Checking if Kind is installed..." -ForegroundColor Yellow
$kindInstalled = Get-Command kind -ErrorAction SilentlyContinue
if (-not $kindInstalled) {
    Write-Host "Kind is not installed. Please install Kind first:" -ForegroundColor Red
    Write-Host "  choco install kind" -ForegroundColor Yellow
    Write-Host "  OR" -ForegroundColor Yellow
    Write-Host "  Download from: https://kind.sigs.k8s.io/docs/user/quick-start/#installation" -ForegroundColor Yellow
    exit 1
}
Write-Host "Kind is installed ✓" -ForegroundColor Green

# Check if Docker is running
Write-Host "`n[2/6] Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "Docker is running ✓" -ForegroundColor Green
} catch {
    Write-Host "Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if kubectl is installed
Write-Host "`n[3/6] Checking if kubectl is installed..." -ForegroundColor Yellow
$kubectlInstalled = Get-Command kubectl -ErrorAction SilentlyContinue
if (-not $kubectlInstalled) {
    Write-Host "kubectl is not installed. Please install kubectl first:" -ForegroundColor Red
    Write-Host "  choco install kubernetes-cli" -ForegroundColor Yellow
    Write-Host "  OR" -ForegroundColor Yellow
    Write-Host "  Download from: https://kubernetes.io/docs/tasks/tools/" -ForegroundColor Yellow
    exit 1
}
Write-Host "kubectl is installed ✓" -ForegroundColor Green

# Delete existing cluster if it exists
Write-Host "`n[4/6] Checking for existing cluster..." -ForegroundColor Yellow
$existingCluster = kind get clusters 2>$null | Select-String "arbeit-cluster"
if ($existingCluster) {
    Write-Host "Existing cluster found. Deleting..." -ForegroundColor Yellow
    kind delete cluster --name arbeit-cluster
    Start-Sleep -Seconds 2
}

# Create Kind cluster
Write-Host "`n[5/6] Creating Kind cluster..." -ForegroundColor Yellow
kind create cluster --name arbeit-cluster --config kind-config.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create Kind cluster" -ForegroundColor Red
    exit 1
}
Write-Host "Kind cluster created successfully ✓" -ForegroundColor Green

# Set kubectl context
kubectl cluster-info --context kind-arbeit-cluster | Out-Null

# Build Docker images
Write-Host "`n[6/6] Building Docker images..." -ForegroundColor Yellow

Write-Host "  Building backend image..." -ForegroundColor Cyan
docker build -t arbeit-backend:latest ./backend
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build backend image" -ForegroundColor Red
    exit 1
}

Write-Host "  Building frontend image..." -ForegroundColor Cyan
docker build -t arbeit-frontend:latest ./frontend
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build frontend image" -ForegroundColor Red
    exit 1
}

# Load images into Kind cluster
Write-Host "`n[7/7] Loading images into Kind cluster..." -ForegroundColor Yellow
kind load docker-image arbeit-backend:latest --name arbeit-cluster
kind load docker-image arbeit-frontend:latest --name arbeit-cluster
Write-Host "Images loaded successfully ✓" -ForegroundColor Green

# Update deployment files to use local images
Write-Host "`n[8/8] Updating deployment files..." -ForegroundColor Yellow
$backendDeployment = Get-Content k8s/backend-deployment.yaml -Raw
$backendDeployment = $backendDeployment -replace 'dex006/arbeit-backend:latest', 'arbeit-backend:latest'
$backendDeployment = $backendDeployment -replace 'imagePullPolicy: IfNotPresent', 'imagePullPolicy: Never'
$backendDeployment | Set-Content k8s/backend-deployment.yaml

$frontendDeployment = Get-Content k8s/frontend-deployment.yaml -Raw
$frontendDeployment = $frontendDeployment -replace 'dex006/arbeit-frontend:latest', 'arbeit-frontend:latest'
$frontendDeployment = $frontendDeployment -replace 'imagePullPolicy: IfNotPresent', 'imagePullPolicy: Never'
$frontendDeployment | Set-Content k8s/frontend-deployment.yaml

# Deploy Kubernetes manifests
Write-Host "`n[9/9] Deploying Kubernetes manifests..." -ForegroundColor Yellow
kubectl apply -f k8s/
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to deploy Kubernetes manifests" -ForegroundColor Red
    exit 1
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "`nTo check status, run:" -ForegroundColor Yellow
Write-Host "  kubectl get pods" -ForegroundColor White
Write-Host "  kubectl get services" -ForegroundColor White
Write-Host "`nTo access services:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:30080" -ForegroundColor White
Write-Host "  Backend:  http://localhost:30090" -ForegroundColor White
Write-Host "`nTo view logs:" -ForegroundColor Yellow
Write-Host "  kubectl logs -f deployment/arbeit-backend" -ForegroundColor White
Write-Host "  kubectl logs -f deployment/arbeit-frontend" -ForegroundColor White
Write-Host "`nTo delete cluster:" -ForegroundColor Yellow
Write-Host "  kind delete cluster --name arbeit-cluster" -ForegroundColor White

