$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$narrator = New-Object System.Speech.Synthesis.SpeechSynthesizer
$narrator.SelectVoice('Microsoft Zira Desktop')
$narrator.Rate = 0
$segments = @(
    'L C M means lowest common multiple. The smallest positive multiple shared by two numbers.',
    'First, list multiples of four: four, eight, twelve, sixteen, twenty, twenty four.',
    'Next, list multiples of six: six, twelve, eighteen, twenty four. Now compare both lists.',
    'Twelve appears in both lists. It is their first shared number, so the L C M is twelve.',
    'Twenty four is also shared, but twelve is smaller. Always choose the smallest positive common multiple.',
    'Your turn. What is the L C M of three and five? Pause to try.',
    'The first match is fifteen.'
)
try {
    for ($index = 0; $index -lt $segments.Count; $index++) {
        $target = Join-Path $PSScriptRoot "lcm-voice-$index.wav"
        $narrator.SetOutputToWaveFile($target)
        $narrator.Speak($segments[$index])
        $narrator.SetOutputToNull()
    }
} finally { $narrator.Dispose() }
Write-Output 'Generated seven local narration segments.'
