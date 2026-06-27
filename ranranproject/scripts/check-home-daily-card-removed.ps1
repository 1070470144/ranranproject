$path = Join-Path $PSScriptRoot '..\pages\index\index.vue'
$content = Get-Content -Raw -Path $path

$forbidden = @(
	'wide-card',
	'check-icon',
	'wide-title',
	'showComingSoon'
)

$remaining = $forbidden | Where-Object { $content -like "*$_*" }

if ($remaining.Count -gt 0) {
	Write-Error ("Homepage daily card remnants found: " + ($remaining -join ', '))
	exit 1
}

Write-Output 'Homepage daily card removed.'
