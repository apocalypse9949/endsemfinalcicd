# PowerShell script to clean up Kubernetes cluster

Write-Host "Cleaning up Kubernetes cluster..." -ForegroundColor Yellow

# Delete Kind cluster
$clusterExists = kind get clusters 2>$null | Select-String "arbeit-cluster"
if ($clusterExists) {
    Write-Host "Deleting Kind cluster..." -ForegroundColor Yellow
    kind delete cluster --name arbeit-cluster
    Write-Host "Cluster deleted successfully ✓" -ForegroundColor Green
} else {
    Write-Host "No cluster found to delete." -ForegroundColor Yellow
}

Write-Host "Cleanup complete!" -ForegroundColor Green

