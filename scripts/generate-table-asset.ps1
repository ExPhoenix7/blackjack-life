$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$out = Join-Path $root "assets"
New-Item -ItemType Directory -Force -Path $out | Out-Null

$w = 720
$h = 1280
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.Color]::FromArgb(9, 92, 57))

$baseBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 9, 120, 68))
$g.FillRectangle($baseBrush, 0, 0, $w, $h)

$linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(36, 0, 56, 34), 2)
$symbolBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(42, 0, 62, 39))
$font = New-Object System.Drawing.Font("Segoe UI Symbol", 20, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$smallFont = New-Object System.Drawing.Font("Segoe UI Symbol", 12, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center

$tile = 58
for ($y = -$tile; $y -lt $h + $tile; $y += $tile) {
  for ($x = -$tile; $x -lt $w + $tile; $x += $tile) {
    $cx = $x + 29
    $cy = $y + 29
    $points = @(
      (New-Object System.Drawing.PointF($cx, ($cy - 26))),
      (New-Object System.Drawing.PointF(($cx + 26), $cy)),
      (New-Object System.Drawing.PointF($cx, ($cy + 26))),
      (New-Object System.Drawing.PointF(($cx - 26), $cy))
    )
    $g.DrawPolygon($linePen, $points)
    $symbols = @([char]0x2660, [char]0x2665, [char]0x2666, [char]0x2663)
    $symbol = $symbols[(($x / $tile + $y / $tile) % 4)]
    $rect = New-Object System.Drawing.RectangleF(($cx - 16), ($cy - 16), 32, 32)
    $g.DrawString($symbol, $font, $symbolBrush, $rect, $format)
    $rect2 = New-Object System.Drawing.RectangleF(($cx - 21), ($cy - 21), 14, 14)
    $g.DrawString($symbols[(($x / $tile + 1) % 4)], $smallFont, $symbolBrush, $rect2, $format)
    $rect3 = New-Object System.Drawing.RectangleF(($cx + 7), ($cy + 7), 14, 14)
    $g.DrawString($symbols[(($y / $tile + 2) % 4)], $smallFont, $symbolBrush, $rect3, $format)
  }
}

$edgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(24, 0, 30, 20))
$g.FillRectangle($edgeBrush, 0, 0, $w, 42)
$g.FillRectangle($edgeBrush, 0, ($h - 42), $w, 42)
$g.FillRectangle($edgeBrush, 0, 0, 32, $h)
$g.FillRectangle($edgeBrush, ($w - 32), 0, 32, $h)
$edgeBrush.Dispose()

$file = Join-Path $out "table-felt.png"
$bmp.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)

$format.Dispose()
$font.Dispose()
$smallFont.Dispose()
$linePen.Dispose()
$symbolBrush.Dispose()
$baseBrush.Dispose()
$g.Dispose()
$bmp.Dispose()
