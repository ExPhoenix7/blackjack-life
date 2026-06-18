$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$out = Join-Path $root "assets\cards"
New-Item -ItemType Directory -Force -Path $out | Out-Null

$w = 180
$h = 260
$red = [System.Drawing.Color]::FromArgb(220, 24, 34)
$black = [System.Drawing.Color]::FromArgb(18, 18, 18)
$paper = [System.Drawing.Color]::FromArgb(252, 252, 248)
$edge = [System.Drawing.Color]::FromArgb(20, 20, 20)
$blue = [System.Drawing.Color]::FromArgb(33, 67, 164)

function New-Font($name, $size, $style) {
  return New-Object System.Drawing.Font($name, $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
}

function Draw-RoundedRect($g, $pen, $brush, $x, $y, $width, $height, $radius) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  if ($brush) { $g.FillPath($brush, $path) }
  if ($pen) { $g.DrawPath($pen, $path) }
  $path.Dispose()
}

function Draw-Centered($g, $text, $font, $brush, $cx, $cy) {
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $rect = New-Object System.Drawing.RectangleF(($cx - 54), ($cy - 54), 108, 108)
  $g.DrawString($text, $font, $brush, $rect, $format)
  $format.Dispose()
}

function Draw-Corner($g, $rank, $suit, $rankFont, $suitFont, $brush, $bottom) {
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Near
  if ($bottom) {
    $g.TranslateTransform(148, 220)
    $g.RotateTransform(180)
    $rect = New-Object System.Drawing.RectangleF(-27, -4, 54, 68)
  } else {
    $rect = New-Object System.Drawing.RectangleF(10, 8, 54, 68)
  }
  $g.DrawString($rank, $rankFont, $brush, $rect, $format)
  $rect2 = New-Object System.Drawing.RectangleF($rect.X, ($rect.Y + 44), $rect.Width, 34)
  $g.DrawString($suit, $suitFont, $brush, $rect2, $format)
  if ($bottom) {
    $g.ResetTransform()
  }
  $format.Dispose()
}

function Draw-Card($rank, $suitCode, $suitSymbol, $color) {
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $paperBrush = New-Object System.Drawing.SolidBrush($paper)
  $edgePen = New-Object System.Drawing.Pen($edge, 4)
  Draw-RoundedRect $g $edgePen $paperBrush 3 3 ($w - 6) ($h - 6) 10

  $softPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(32, 0, 0, 0), 2)
  Draw-RoundedRect $g $softPen $null 12 12 ($w - 24) ($h - 24) 7

  $brush = New-Object System.Drawing.SolidBrush($color)
  $rankFont = New-Font "Arial" 44 ([System.Drawing.FontStyle]::Bold)
  $cornerSuitFont = New-Font "Segoe UI Symbol" 32 ([System.Drawing.FontStyle]::Bold)
  $bigSuitFont = New-Font "Segoe UI Symbol" 124 ([System.Drawing.FontStyle]::Bold)
  $faceFont = New-Font "Arial" 86 ([System.Drawing.FontStyle]::Bold)

  Draw-Corner $g $rank $suitSymbol $rankFont $cornerSuitFont $brush $false
  Draw-Corner $g $rank $suitSymbol $rankFont $cornerSuitFont $brush $true

  if (@("J", "Q", "K").Contains($rank)) {
    Draw-Centered $g $rank $faceFont $brush 90 98
    Draw-Centered $g $suitSymbol $bigSuitFont $brush 90 165
  } else {
    Draw-Centered $g $suitSymbol $bigSuitFont $brush 90 132
  }

  $file = Join-Path $out "$rank$suitCode.png"
  $bmp.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

function Draw-Back {
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

  $paperBrush = New-Object System.Drawing.SolidBrush($paper)
  $blueBrush = New-Object System.Drawing.SolidBrush($blue)
  $edgePen = New-Object System.Drawing.Pen($edge, 4)
  Draw-RoundedRect $g $edgePen $paperBrush 3 3 ($w - 6) ($h - 6) 10
  Draw-RoundedRect $g $null $blueBrush 16 16 ($w - 32) ($h - 32) 8

  $clipPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $clipPath.AddRectangle((New-Object System.Drawing.Rectangle(20, 20, ($w - 40), ($h - 40))))
  $oldClip = $g.Clip
  $g.SetClip($clipPath)
  $linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(170, 255, 255, 255), 2)
  for ($x = -$h; $x -lt ($w + $h); $x += 12) {
    $g.DrawLine($linePen, $x, 20, ($x + $h), ($h - 20))
    $g.DrawLine($linePen, $x, ($h - 20), ($x + $h), 20)
  }
  $g.Clip = $oldClip
  $clipPath.Dispose()
  $innerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(240, 255, 255, 255), 4)
  Draw-RoundedRect $g $innerPen $null 30 30 ($w - 60) ($h - 60) 8

  $file = Join-Path $out "BACK.png"
  $bmp.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

$suits = @(
  @{ code = "H"; symbol = [char]0x2665; color = $red },
  @{ code = "S"; symbol = [char]0x2660; color = $black },
  @{ code = "D"; symbol = [char]0x2666; color = $red },
  @{ code = "C"; symbol = [char]0x2663; color = $black }
)
$ranks = @("A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K")

foreach ($s in $suits) {
  foreach ($r in $ranks) {
    Draw-Card $r $s.code $s.symbol $s.color
  }
}
Draw-Back
