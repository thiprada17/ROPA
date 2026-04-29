$TestDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Installing dependencies..." -ForegroundColor Cyan
python -m pip install -r "$TestDir\requirements.txt" --quiet

Write-Host "Running Robot Framework tests..." -ForegroundColor Cyan

python -m robot --outputdir "$TestDir\results" --log "$TestDir\results\log.html" --report "$TestDir\results\report.html" --output "$TestDir\results\output.xml" --variable BASE_URL:http://localhost:8000 --variable ADMIN_EMAIL:admin01@gmail.com --variable ADMIN_PASSWORD:Qwerty123456 --variable DPO_EMAIL:helloitme2288@gmail.com --variable DPO_PASSWORD:Qwerty123456 --variable USER_EMAIL:user02@gmail.com --variable USER_PASSWORD:Qwerty123456 "$TestDir\test_case"

# --variable BASE_URL:https://your-backend.com เอาไปเปลี่ยนที่ยาวๆน่ะ

if ($LASTEXITCODE -eq 0) {
    Write-Host "All tests passed!" -ForegroundColor Green
} else {
    Write-Host "Some tests failed." -ForegroundColor Red
}

Write-Host "Report: $TestDir\results\report.html" -ForegroundColor Yellow
