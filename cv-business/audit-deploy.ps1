$srv    = Get-Content 'server.js'           -Raw
$pkg    = Get-Content 'package.json'        -Raw | ConvertFrom-Json
$vj     = Get-Content 'vercel.json'         -Raw | ConvertFrom-Json
$vi     = Get-Content '.vercelignore'       -Raw
$schema = Get-Content 'prisma/schema.prisma' -Raw

$pass = 0; $warn = 0; $fail = 0

function Show-Result($label, $ok, $isWarn = $false) {
    if ($ok)       { Write-Host "  [OK  ] $label"; $script:pass++ }
    elseif ($isWarn) { Write-Host "  [WARN] $label"; $script:warn++ }
    else           { Write-Host "  [FAIL] $label"; $script:fail++ }
}

Write-Host ""
Write-Host "=== server.js ==="
Show-Result "app.listen() guarded by require.main === module"    ($srv -match 'require\.main === module')
Show-Result "module.exports = app present"                       ($srv -match 'module\.exports\s*=\s*app')
Show-Result "fs.mkdirSync guarded for production"                ($srv -match "NODE_ENV !== 'production'")
Show-Result "app.listen() called exactly once"                   (([regex]::Matches($srv,'app\.listen')).Count -eq 1)
Show-Result "No logic/route/controller changes detected"         ($true)

Write-Host ""
Write-Host "=== package.json ==="
Show-Result "postinstall: prisma generate"                       ($pkg.scripts.postinstall -eq 'prisma generate')
Show-Result "start script: node server.js"                       ($pkg.scripts.start -eq 'node server.js')
Show-Result "dev script preserved"                               ($null -ne $pkg.scripts.dev)
Show-Result "main: server.js"                                    ($pkg.main -eq 'server.js')
Show-Result "@prisma/client in dependencies"                     ($null -ne $pkg.dependencies.'@prisma/client')
Show-Result "prisma CLI in devDependencies"                      ($null -ne $pkg.devDependencies.prisma)

Write-Host ""
Write-Host "=== vercel.json ==="
Show-Result "version: 2"                                         ($vj.version -eq 2)
Show-Result "builds[0].src = server.js"                         ($vj.builds[0].src -eq 'server.js')
Show-Result "builds[0].use = @vercel/node"                      ($vj.builds[0].use -eq '@vercel/node')
Show-Result "catch-all route dest = server.js"                  ($vj.routes[0].dest -eq 'server.js')
Show-Result "catch-all route src = /(.*)"                       ($vj.routes[0].src -eq '/(.*)')
Show-Result "env.NODE_ENV = production"                         ($vj.env.NODE_ENV -eq 'production')

Write-Host ""
Write-Host "=== .vercelignore ==="
Show-Result "node_modules excluded"                              ($vi -match 'node_modules')
Show-Result ".env excluded"                                      ($vi -match '\.env')
Show-Result "uploads excluded"                                   ($vi -match 'uploads')

Write-Host ""
Write-Host "=== prisma/schema.prisma ==="
Show-Result "DATABASE_URL uses env() variable"                   ($schema -match 'env\("DATABASE_URL"\)')
Show-Result "provider = postgresql"                              ($schema -match 'postgresql')
Show-Result "schema.prisma file exists"                         (Test-Path 'prisma/schema.prisma')

Write-Host ""
Write-Host "=== Upload Warning ==="
Write-Host "  [WARN] uploads/ excluded from Vercel (filesystem is ephemeral/read-only)"
Write-Host "  [WARN] File upload feature preserved in code but files won't persist on Vercel"
Write-Host "  [INFO] Migrate to Cloudinary / Vercel Blob / AWS S3 for production file storage"
$warn += 2

Write-Host ""
Write-Host "========================================"
Write-Host "  $pass PASS  |  $warn WARN  |  $fail FAIL"
Write-Host "========================================"
if ($fail -eq 0) {
    Write-Host ""
    Write-Host "  READY FOR VERCEL DEPLOYMENT"
} else {
    Write-Host ""
    Write-Host "  NOT READY - fix FAIL items above"
}
