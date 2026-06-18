#!/usr/bin/env powershell

Write-Host "MongoDB Connection Diagnostic Tool" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# 1. Test DNS Resolution
Write-Host "TEST 1: DNS Resolution" -ForegroundColor Yellow
try {
    Write-Host "Testing DNS resolution for: cluster0.qckx1kj.mongodb.net"
    $result = [System.Net.Dns]::GetHostAddresses("cluster0.qckx1kj.mongodb.net")
    Write-Host "[SUCCESS] DNS Resolution works" -ForegroundColor Green
    Write-Host "IP Address: $result"
}
catch {
    Write-Host "[FAILED] DNS Resolution failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "Attempting DNS cache flush..."
    & ipconfig /flushdns | Out-Null
    Write-Host "DNS cache flushed. Retry after a moment."
}

Write-Host ""
Write-Host "TEST 2: Internet Connection" -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName 8.8.8.8 -Count 1 -ErrorAction Stop
    Write-Host "[SUCCESS] Internet is connected" -ForegroundColor Green
    Write-Host "Response Time: $($ping.ResponseTime)ms"
}
catch {
    Write-Host "[FAILED] No internet connection" -ForegroundColor Red
}

Write-Host ""
Write-Host "TEST 3: Port 27017 Access (MongoDB)" -ForegroundColor Yellow
$mongoHost = "cluster0.qckx1kj.mongodb.net"
$mongoPort = 27017
$tcpClient = New-Object System.Net.Sockets.TcpClient
$asyncResult = $tcpClient.BeginConnect($mongoHost, $mongoPort, $null, $null)
$wait = $asyncResult.AsyncWaitHandle.WaitOne(3000)

if ($wait) {
    try {
        $tcpClient.EndConnect($asyncResult)
        Write-Host "[SUCCESS] Can access MongoDB cluster" -ForegroundColor Green
    }
    catch {
        Write-Host "[FAILED] Port 27017 blocked" -ForegroundColor Red
    }
}
else {
    Write-Host "[FAILED] Connection timeout" -ForegroundColor Red
}
$tcpClient.Close()

Write-Host ""
Write-Host "TEST 4: Local MongoDB" -ForegroundColor Yellow
$localClient = New-Object System.Net.Sockets.TcpClient
$localAsync = $localClient.BeginConnect("localhost", 27017, $null, $null)
$localWait = $localAsync.AsyncWaitHandle.WaitOne(2000)

if ($localWait) {
    try {
        $localClient.EndConnect($localAsync)
        Write-Host "[RUNNING] Local MongoDB is available" -ForegroundColor Green
    }
    catch {
        Write-Host "[NOT RUNNING] Local MongoDB not found" -ForegroundColor Yellow
    }
}
else {
    Write-Host "[NOT RUNNING] Local MongoDB not found" -ForegroundColor Yellow
}
$localClient.Close()

Write-Host ""
Write-Host "RECOMMENDATIONS:" -ForegroundColor Cyan
Write-Host "1. Flush DNS: ipconfig /flushdns"
Write-Host "2. Verify cluster is RUNNING at https://cloud.mongodb.com/"
Write-Host "3. Verify IPs whitelisted in Network Access"
Write-Host "4. Restart computer and router"
Write-Host "5. Try using local MongoDB as fallback"
Write-Host ""
