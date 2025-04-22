Write-Host "🔍 Checking Meet_Note prerequisites..." -ForegroundColor Cyan

function Check-Cmd($name) {
    if (Get-Command $name -ErrorAction SilentlyContinue) {
        Write-Host "✅ $name found"; return $true
    }
    else {
        Write-Host "❗ $name missing" -ForegroundColor Yellow; return $false
    }
}

if (-not (Check-Cmd "node")) { Write-Host "Install Node.js first"; exit }
if (-not (Check-Cmd "npm")) { Write-Host "npm missing!"; exit }

# --------------------------------------------------------------------
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan

# Runtime
npm install express@4 cors@2.8 socket.io@4 dotenv@16 prismjs@1.29

# Dev (Tailwind / DaisyUI / Electron)
npm install -D tailwindcss@4.1 postcss@8.4 autoprefixer@10.4 daisyui@latest electron@28.2
# npm install -D tailwindcss@3.4 postcss@8.4 autoprefixer@10.4 daisyui@4.10 electron@28.2

# Tailwind init (creates tailwind.config.js + postcss.config.js)
npx tailwindcss init -p

# Inject DaisyUI plugin into tailwind.config.js
# (Get-Content tailwind.config.js) -replace '};', "  plugins: [require('daisyui')],`n};" | Set-Content tailwind.config.js

# Base CSS
$stylePath = "public\styles\styles.css"
if (-not (Test-Path $stylePath)) {
    New-Item -ItemType Directory -Path "public\styles" -Force | Out-Null
    @"
@tailwind base;
@tailwind components;
@tailwind utilities;
"@ | Out-File -Encoding utf8 $stylePath
}

# Build output.css
npm exec tailwindcss -i ./public/styles/styles.css -o ./public/styles/output.css --minify

# --------------------------------------------------------------------
# Data directories
New-Item -ItemType Directory -Path "data\notes"     -Force | Out-Null
New-Item -ItemType Directory -Path "data\settings"  -Force | Out-Null

# Default settings.json
$settings = @{ theme = "light"; autosave = 5000 } | ConvertTo-Json
$settings | Out-File -Encoding utf8 "data\settings\settings.json"

# --- Prism Assets kopieren ---
# vendors‑Ordner einmalig anlegen
New-Item -ItemType Directory -Path public\vendors -Force | Out-Null

# Prism‑Dateien kopieren
# Copy-Item node_modules\prismjs\prism.min.js             public\vendors\ -Force

Write-Host "`nKopiere und minifiziere Prism ..." -ForegroundColor Cyan

# Vendor-Ordner erstellen falls nötig
$vendorPath = "public/vendors"
if (-not (Test-Path $vendorPath)) {
    New-Item -ItemType Directory -Path $vendorPath -Force | Out-Null
}

# Prism.js prüfen
$prismJsSource = "node_modules/prismjs/prism.js"
$prismJsTarget = Join-Path $vendorPath "prism.min.js"

if (Test-Path $prismJsSource) {
    $content = Get-Content -Path $prismJsSource -Raw -Encoding UTF8

    # Einfache "Minifizierung" durchführen
    $minified = $content `
        -replace '/\*.*?\*/', '' `
        -replace '^\s*//.*$', '' `
        -replace '\r?\n\s*', '' `
        -replace '\s{2,}', ' '

    $minified | Set-Content -Path $prismJsTarget -Encoding UTF8 -Force

    Write-Host "Prism.js minifiziert und gespeichert nach $prismJsTarget" -ForegroundColor Green
}
else {
    Write-Host "prism.js nicht gefunden unter $prismJsSource" -ForegroundColor Red
}

# Prism.css prüfen und kopieren
$prismCssSource = "node_modules/prismjs/themes/prism.css"
$prismCssTarget = Join-Path $vendorPath "prism.min.css"

if (Test-Path $prismCssSource) {
    Copy-Item -Path $prismCssSource -Destination $prismCssTarget -Force
    Write-Host "Prism.css kopiert nach $prismCssTarget" -ForegroundColor Green
}
else {
    Write-Host "prism.css nicht gefunden unter $prismCssSource" -ForegroundColor Red
}

Write-Host "prism.js muss manuell minifiziert werden!!!!!`nhttps://www.toptal.com/developers/javascript-minifier`nHier einfach Copy und Pasten" -ForegroundColor Red



# npm install postcss-url --save-dev
# npm install -D postcss postcss-cli
# npm install --save-dev path
# npm install tailwindcss@latest @tailwindcss/cli@latest daisyui@latest
# npm install --save-dev postcss-import
# npm install --save-dev @tailwindcss/postcss


# Environment.txt
@"
Node.js          : $(node -v)
npm              : $(npm -v)
express          : $(npm list express | Select-String express | % { $_.ToString().Split('@')[1] })
socket.io        : $(npm list socket.io | Select-String socket.io | % { $_.ToString().Split('@')[1] })
tailwindcss      : $(npm list tailwindcss | Select-String tailwindcss | % { $_.ToString().Split('@')[1] })
daisyui          : $(npm list daisyui | Select-String daisyui | % { $_.ToString().Split('@')[1] })
autoprefixer     : $(npm list autoprefixer | Select-String autoprefixer | % { $_.ToString().Split('@')[1] })
electron         : $(npm list electron | Select-String electron | % { $_.ToString().Split('@')[1] })
prismjs          : $(npm list prismjs | Select-String prismjs | % { $_.ToString().Split('@')[1] })
"@ | Out-File -Encoding utf8 environment.txt

Write-Host "Setup complete." -ForegroundColor Green
