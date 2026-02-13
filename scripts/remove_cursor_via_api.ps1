# Remove Cursor como contribuidor: reescreve o ultimo commit no GitHub via API
# Uso: $env:GITHUB_TOKEN = "seu_token"; .\scripts\remove_cursor_via_api.ps1

$ErrorActionPreference = "Stop"
$owner = "pedroleondev"
$repo = "FOOCUS"
$token = $env:GITHUB_TOKEN
if (-not $token) { Write-Error "Defina GITHUB_TOKEN: `$env:GITHUB_TOKEN = 'seu_token'" }

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept"        = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

# 1) Obter ref main
$refUrl = "https://api.github.com/repos/$owner/$repo/git/ref/heads/main"
$ref = Invoke-RestMethod -Uri $refUrl -Headers $headers -Method Get
$currentSha = $ref.object.sha

# 2) Obter commit atual
$commitUrl = "https://api.github.com/repos/$owner/$repo/git/commits/$currentSha"
$commit = Invoke-RestMethod -Uri $commitUrl -Headers $headers -Method Get

$treeSha = $commit.tree.sha
$parentSha = $commit.parents[0].sha
$author = $commit.author
$committer = $commit.committer

# Mensagem limpa (sem Co-authored-by e em UTF-8)
$newMessage = @"
feat: Melhorias na página de Foco - Timer Pomodoro aprimorado

- Refatoração completa dos cards de tarefas com shadcn/HeroUI
- Gráfico de produtividade estilo GitHub (visão semanal)
- Dropdown para seleção de tarefas
- Contador de pomodoros (completos/restantes)
- Tempo customizável para foco e pausa
- UI aprimorada com indicadores visuais de modo (Foco/Descanso)
- Círculo de progresso do timer corrigido
- Layout mobile-first otimizado
- Sistema de validação e documentação adicionados
"@

# 3) Criar novo commit (sem trailer)
$body = @{
    message = $newMessage
    tree    = $treeSha
    parents = @($parentSha)
    author  = @{ name = $author.name; email = $author.email; date = $author.date }
    committer = @{ name = $committer.name; email = $committer.email; date = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ") }
} | ConvertTo-Json -Depth 5

$createUrl = "https://api.github.com/repos/$owner/$repo/git/commits"
$newCommit = Invoke-RestMethod -Uri $createUrl -Headers $headers -Method Post -Body $body -ContentType "application/json; charset=utf-8"

# 4) Atualizar ref main para o novo commit
$updateBody = @{ sha = $newCommit.sha } | ConvertTo-Json
$patchUrl = "https://api.github.com/repos/$owner/$repo/git/refs/heads/main"
Invoke-RestMethod -Uri $patchUrl -Headers $headers -Method Patch -Body $updateBody -ContentType "application/json" | Out-Null

Write-Host "Commit reescrito no GitHub. SHA anterior: $currentSha -> novo: $($newCommit.sha)"
Write-Host "Atualize o repo local: cd T:\SAAS\FOOCUS; git fetch origin; git reset --hard origin/main"
