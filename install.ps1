Write-Host "🔍 Überprüfe benötigte Technologien für Meet_Note..." -ForegroundColor Cyan

function Check-Command($name) {
    $cmd = Get-Command $name -ErrorAction SilentlyContinue
    if ($cmd) {
        Write-Host "✅ $name gefunden: " -NoNewline
        & $name --version
        return $true
    } else {
        Write-Host "❗ $name nicht gefunden." -ForegroundColor Yellow
        return $false
    }
}

# Node.js prüfen
if (-not (Check-Command "node")) {
    Write-Host "🚀 Installiere Node.js (bitte manuell von https://nodejs.org/ herunterladen)" -ForegroundColor Yellow
    exit
}

# npm prüfen
if (-not (Check-Command "npm")) {
    Write-Host "❗ npm sollte mit Node.js installiert werden!" -ForegroundColor Red
    exit
}

# git prüfen
if (-not (Check-Command "git")) {
    Write-Host "🚀 Git wird benötigt. Bitte installieren: https://git-scm.com/" -ForegroundColor Yellow
    exit
}

# npm Pakete mit stabilen Versionen installieren
Write-Host "📦 Installiere stabile Projektabhängigkeiten..." -ForegroundColor Cyan

npm install express@4.18.2 cors@2.8.5 socket.io@4.7.4 tailwindcss@3.4.3 daisyui@4.10.0 electron@28.2.5 sqlite3@5.1.6 bcrypt@5.1.1 pdf-lib@1.17.1 dotenv@16.5.0 prismjs@1.29.0 @capacitor/core@7.2.0 @capacitor/cli@7.2.0

# Verzeichnisse anlegen (falls nicht vorhanden)
$folders = @("server/db", "public/pwa", "electron", "docs")
foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder | Out-Null
    }
}

# environment.txt erstellen
Write-Host "🌐 Erstelle environment.txt..." -ForegroundColor Cyan

# npm install express cors
@"
Technologien und Versionen fuer Meet_Note:
Node.js: $(node --version)
npm: $(npm --version)
express: $(npm list express | Select-String "express" | ForEach-Object { $_.ToString().Split('@')[1] })
socket.io: $(npm list socket.io | Select-String "socket.io" | ForEach-Object { $_.ToString().Split('@')[1] })
tailwindcss: $(npm list tailwindcss | Select-String "tailwindcss" | ForEach-Object { $_.ToString().Split('@')[1] })
daisyui: $(npm list daisyui | Select-String "daisyui" | ForEach-Object { $_.ToString().Split('@')[1] })
electron: $(npm list electron | Select-String "electron" | ForEach-Object { $_.ToString().Split('@')[1] })
sqlite3: $(npm list sqlite3 | Select-String "sqlite3" | ForEach-Object { $_.ToString().Split('@')[1] })
bcrypt: $(npm list bcrypt | Select-String "bcrypt" | ForEach-Object { $_.ToString().Split('@')[1] })
pdf-lib: $(npm list pdf-lib | Select-String "pdf-lib" | ForEach-Object { $_.ToString().Split('@')[1] })
dotenv: $(npm list dotenv | Select-String "dotenv" | ForEach-Object { $_.ToString().Split('@')[1] })
prismjs: $(npm list prismjs | Select-String "prismjs" | ForEach-Object { $_.ToString().Split('@')[1] })
capacitor/core: $(npm list @capacitor/core | Select-String "@capacitor/core" | ForEach-Object { $_.ToString().Split('@')[2] })
capacitor/cli: $(npm list @capacitor/cli | Select-String "@capacitor/cli" | ForEach-Object { $_.ToString().Split('@')[2] })
"@ | Out-File -Encoding UTF8 environment.txt

Write-Host "✅ Alles erledigt! Environment-Datei gespeichert: environment.txt" -ForegroundColor Green
