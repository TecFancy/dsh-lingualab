<#
.SYNOPSIS
  Turn video episodes into stereo mp3 files that lingualab can pair with subtitles.

.DESCRIPTION
  For every .mkv / .mp4 given (a folder means the videos directly inside it), writes
  <stem>.mp3 into -OutDir (default: next to the video). Existing mp3 files are skipped,
  never overwritten. Sidecar subtitles whose name starts with the stem are copied along
  when -OutDir differs; ASS and SSA sidecars are converted to a same-named .srt instead,
  next to the video or in -OutDir. When a video has no sidecar subtitle, or with
  -EmbeddedSubtitles, the embedded text subtitle tracks are extracted as
  <stem>.<lang>.srt. Image subtitles (PGS, VobSub) cannot become text and are reported.

.EXAMPLE
  ./convert.ps1 "D:\Downloads\MDJT S01E01.mkv"
.EXAMPLE
  ./convert.ps1 D:\Downloads\MDJT -OutDir D:\Downloads\MDJT\audio -Bitrate 192
#>
param(
  [Parameter(Mandatory = $true, Position = 0)][string[]]$Path,
  [string]$OutDir,
  [int]$Bitrate = 160,
  [switch]$EmbeddedSubtitles
)

$ErrorActionPreference = 'Stop'
$videoExtensions = @('.mkv', '.mp4')
$subtitleExtensions = @('.srt', '.vtt', '.ass', '.ssa', '.lrc')
$assExtensions = @('.ass', '.ssa')
$textSubtitleCodecs = @('subrip', 'ass', 'ssa', 'webvtt', 'mov_text', 'text')
$languageCodes = @{ eng = 'en'; chi = 'zh'; zho = 'zh'; jpn = 'ja'; kor = 'ko'; fre = 'fr'; fra = 'fr'; ger = 'de'; deu = 'de'; spa = 'es' }

foreach ($tool in 'ffmpeg', 'ffprobe') {
  if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
    throw "$tool is not on PATH. Install it with: winget install Gyan.FFmpeg"
  }
}

function Get-Streams([string]$file) {
  $json = & ffprobe -v error -show_entries 'stream=index,codec_type,codec_name:stream_tags=language' -of json $file
  return ($json | Out-String | ConvertFrom-Json).streams
}

function Get-Duration([string]$file) {
  return [double](& ffprobe -v error -show_entries format=duration -of csv=p=0 $file)
}

$videos = foreach ($item in $Path) {
  $resolved = Get-Item -LiteralPath $item
  if ($resolved.PSIsContainer) {
    Get-ChildItem -LiteralPath $resolved.FullName -File | Where-Object { $videoExtensions -contains $_.Extension.ToLower() } | Sort-Object Name
  } else {
    $resolved
  }
}

foreach ($video in $videos) {
  $stem = [IO.Path]::GetFileNameWithoutExtension($video.Name)
  $target = $video.DirectoryName
  if ($OutDir) { $target = $OutDir }
  New-Item -ItemType Directory -Force -Path $target | Out-Null
  $mp3 = Join-Path $target "$stem.mp3"
  Write-Host "== $($video.Name)"

  $streams = Get-Streams $video.FullName
  $audio = @($streams | Where-Object { $_.codec_type -eq 'audio' })
  if ($audio.Count -eq 0) { Write-Warning '   no audio track, skipped'; continue }

  if (Test-Path -LiteralPath $mp3) {
    Write-Host "   $stem.mp3 already exists, left as is"
  } else {
    # Prefer an English track when there are several; otherwise the first one.
    $pick = 0
    for ($i = 0; $i -lt $audio.Count; $i++) {
      if ($audio[$i].tags.language -eq 'eng') { $pick = $i; break }
    }
    Write-Host "   audio track $pick ($($audio[$pick].codec_name), $($audio[$pick].tags.language)) -> $stem.mp3"
    & ffmpeg -hide_banner -loglevel error -n -i $video.FullName -map "0:a:$pick" -vn -ac 2 -c:a libmp3lame -b:a "$($Bitrate)k" $mp3
    if ($LASTEXITCODE -ne 0) { Write-Warning "   ffmpeg failed with exit code $LASTEXITCODE"; continue }
    $drift = [math]::Abs((Get-Duration $mp3) - (Get-Duration $video.FullName))
    if ($drift -gt 1) { Write-Warning "   duration differs from the video by $([math]::Round($drift, 1)) s" }
  }

  # Same rule as sameStem in src/shared/stem.ts: the stem itself, or the stem plus . _ or -.
  $sidecars = @(Get-ChildItem -LiteralPath $video.DirectoryName -File | Where-Object {
    $base = [IO.Path]::GetFileNameWithoutExtension($_.Name)
    $owned = ($base -eq $stem) -or ($base.StartsWith($stem) -and @('.', '_', '-') -contains $base.Substring($stem.Length, 1))
    $owned -and ($subtitleExtensions -contains $_.Extension.ToLower())
  })
  foreach ($stray in Get-ChildItem -LiteralPath $video.DirectoryName -File | Where-Object {
    $_.Name.StartsWith($stem) -and ($subtitleExtensions -contains $_.Extension.ToLower()) -and ($sidecars.FullName -notcontains $_.FullName)
  }) {
    Write-Warning "   $($stray.Name) will not pair: after the name it needs . _ or - (rename it, for example to $stem.zh-en$($stray.Extension))"
  }
  foreach ($sidecar in $sidecars) {
    # lingualab reads srt, vtt and lrc only, so an ASS sidecar becomes a same-named srt.
    if ($assExtensions -contains $sidecar.Extension.ToLower()) {
      $srt = Join-Path $target "$([IO.Path]::GetFileNameWithoutExtension($sidecar.Name)).srt"
      if (Test-Path -LiteralPath $srt) {
        Write-Host "   $([IO.Path]::GetFileName($srt)) already exists, $($sidecar.Name) not converted"
      } else {
        & ffmpeg -hide_banner -loglevel error -n -i $sidecar.FullName -c:s srt $srt
        if ($LASTEXITCODE -ne 0) { Write-Warning "   converting $($sidecar.Name) failed with exit code $LASTEXITCODE" }
        else { Write-Host "   converted subtitle $($sidecar.Name) -> $([IO.Path]::GetFileName($srt))" }
      }
      continue
    }
    $copy = Join-Path $target $sidecar.Name
    if ($sidecar.FullName -ne $copy -and -not (Test-Path -LiteralPath $copy)) {
      Copy-Item -LiteralPath $sidecar.FullName -Destination $copy
      Write-Host "   copied subtitle $($sidecar.Name)"
    }
  }
  if ($sidecars.Count -gt 0 -and -not $EmbeddedSubtitles) {
    Write-Host "   sidecar subtitles: $(($sidecars | ForEach-Object Name) -join ', ')"
    continue
  }

  $subtitleStreams = @($streams | Where-Object { $_.codec_type -eq 'subtitle' })
  $n = 0
  foreach ($stream in $subtitleStreams) {
    $language = $stream.tags.language
    if (-not $language) { $language = "track$n" }
    if ($languageCodes.ContainsKey($language)) { $language = $languageCodes[$language] }
    if ($textSubtitleCodecs -notcontains $stream.codec_name) {
      Write-Warning "   subtitle track $n ($($stream.codec_name)) is an image track, cannot extract as text"
    } else {
      $srt = Join-Path $target "$stem.$language.srt"
      if (Test-Path -LiteralPath $srt) {
        Write-Host "   $([IO.Path]::GetFileName($srt)) already exists, left as is"
      } else {
        & ffmpeg -hide_banner -loglevel error -n -i $video.FullName -map "0:s:$n" -c:s srt $srt
        Write-Host "   extracted subtitle track $n -> $([IO.Path]::GetFileName($srt))"
      }
    }
    $n++
  }
  if ($subtitleStreams.Count -eq 0) { Write-Warning '   no subtitles found, sidecar or embedded' }
}
