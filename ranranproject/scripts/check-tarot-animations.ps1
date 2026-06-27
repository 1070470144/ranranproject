$path = Join-Path $PSScriptRoot '..\pages\tarot\tarot.vue'
$content = Get-Content -Raw -Path $path

$required = @(
	'mystic-sky',
	'mystic-orbit',
	'deck-aura',
	'back-rune',
	'card-glimmer',
	'@keyframes star-drift',
	'@keyframes orbit-spin',
	'@keyframes aura-pulse',
	'@keyframes card-reveal',
	'@keyframes glimmer-sweep'
)

$missing = $required | Where-Object { $content -notlike "*$_*" }

if ($missing.Count -gt 0) {
	Write-Error ("Missing tarot animation hooks: " + ($missing -join ', '))
	exit 1
}

Write-Output 'Tarot animation hooks verified.'
