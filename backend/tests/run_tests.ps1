# run_tests.ps1
# วิ่งจาก root ของโปรเจกต์: powershell -ExecutionPolicy Bypass -File .\tests\run_tests.ps1

# ติดตั้ง dependencies
python -m pip install -r .\tests\requirements.txt

# รัน Robot Framework
python -m robot `
    --outputdir .\tests\results `
    --log .\tests\results\log.html `
    --report .\tests\results\report.html `
    --variable BASE_URL:http://localhost:8000 `
    --variable ADMIN_EMAIL:admin01@gmail.com `
    --variable ADMIN_PASSWORD:Qwerty123456 `
    --variable USER_EMAIL:user02@gmail.com `
    --variable USER_PASSWORD:Qwerty123456 `
    .\tests\suites\

Write-Host "`n✅ Report: tests/results/report.html"