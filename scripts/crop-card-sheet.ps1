$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$source = "C:\Users\EXPHOENIX\Desktop\cards.png"
$out = Join-Path $root "assets\cards"
New-Item -ItemType Directory -Force -Path $out | Out-Null

$sheet = [System.Drawing.Bitmap]::FromFile($source)

# Sheet layout: 7 columns x 8 rows.
# Rows are paired by suit: A-7, then 8-K-BACK.
$columns = 7
$rows = 8
$cardW = 144
$cardH = 225
$left = 16
$top = 15
$gapX = 8
$gapY = 15

$suits = @("H", "C", "S", "D")
$topRanks = @("A", "2", "3", "4", "5", "6", "7")
$bottomRanks = @("8", "9", "10", "J", "Q", "K", "BACK")

function Save-Crop($sheet, $x, $y, $w, $h, $path) {
  $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
  $crop = $sheet.Clone($rect, $sheet.PixelFormat)
  $crop.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $crop.Dispose()
}

for ($s = 0; $s -lt $suits.Count; $s++) {
  $suit = $suits[$s]
  $rowA = $s * 2
  $rowB = $rowA + 1

  for ($c = 0; $c -lt $columns; $c++) {
    $x = $left + ($c * ($cardW + $gapX))
    $y = $top + ($rowA * ($cardH + $gapY))
    $rank = $topRanks[$c]
    Save-Crop $sheet $x $y $cardW $cardH (Join-Path $out "$rank$suit.png")
  }

  for ($c = 0; $c -lt $columns; $c++) {
    $x = $left + ($c * ($cardW + $gapX))
    $y = $top + ($rowB * ($cardH + $gapY))
    $rank = $bottomRanks[$c]
    if ($rank -eq "BACK") {
      if ($suit -eq "H") {
        Save-Crop $sheet ($x - 6) ($y + 7) $cardW $cardH (Join-Path $out "BACK.png")
      }
    } else {
      Save-Crop $sheet $x $y $cardW $cardH (Join-Path $out "$rank$suit.png")
    }
  }
}

$sheet.Dispose()
