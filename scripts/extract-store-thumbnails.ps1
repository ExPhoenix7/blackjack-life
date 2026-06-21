Add-Type -AssemblyName System.Drawing

function Export-Thumbnails {
  param(
    [string]$SourcePath,
    [string]$OutputDirectory,
    [array]$Items
  )

  New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
  $source = [System.Drawing.Bitmap]::FromFile($SourcePath)

  try {
    foreach ($item in $Items) {
      $cropRectangle = New-Object System.Drawing.Rectangle($item.X, $item.Y, 286, 286)
      $crop = $source.Clone($cropRectangle, $source.PixelFormat)
      $thumbnail = New-Object System.Drawing.Bitmap(128, 128)
      $graphics = [System.Drawing.Graphics]::FromImage($thumbnail)

      try {
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.DrawImage($crop, 0, 0, 128, 128)
        $outputPath = Join-Path $OutputDirectory ($item.File + ".png")
        $thumbnail.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
      }
      finally {
        $graphics.Dispose()
        $thumbnail.Dispose()
        $crop.Dispose()
      }
    }
  }
  finally {
    $source.Dispose()
  }
}

$workspace = Split-Path -Parent $PSScriptRoot

$properties = @(
  @{ File = "studio-apartment"; X = 10; Y = 102 },
  @{ File = "luxury-apartment"; X = 313; Y = 102 },
  @{ File = "bungalow"; X = 620; Y = 102 },
  @{ File = "penthouse"; X = 927; Y = 102 },
  @{ File = "duplex"; X = 1233; Y = 102 },
  @{ File = "luxury-villa"; X = 10; Y = 544 },
  @{ File = "beach-house"; X = 313; Y = 544 },
  @{ File = "farmhouse"; X = 620; Y = 544 },
  @{ File = "hotel"; X = 927; Y = 544 },
  @{ File = "mansion"; X = 1233; Y = 544 }
)

$vehicles = @(
  @{ File = "bicycle"; X = 9; Y = 106 },
  @{ File = "motorcycle"; X = 306; Y = 106 },
  @{ File = "hatchback"; X = 603; Y = 106 },
  @{ File = "sedan"; X = 905; Y = 106 },
  @{ File = "suv"; X = 1222; Y = 106 },
  @{ File = "sports-car"; X = 9; Y = 557 },
  @{ File = "limousine"; X = 306; Y = 557 },
  @{ File = "supercar"; X = 603; Y = 557 },
  @{ File = "yacht"; X = 905; Y = 557 },
  @{ File = "private-jet"; X = 1222; Y = 557 }
)

$items = @(
  @{ File = "smartphone"; X = 10; Y = 105 },
  @{ File = "tablet"; X = 312; Y = 105 },
  @{ File = "laptop"; X = 613; Y = 105 },
  @{ File = "watch"; X = 916; Y = 105 },
  @{ File = "necklace"; X = 1226; Y = 105 },
  @{ File = "ring"; X = 10; Y = 557 },
  @{ File = "gaming-console"; X = 312; Y = 557 },
  @{ File = "pool-table"; X = 613; Y = 557 },
  @{ File = "home-theater"; X = 916; Y = 557 },
  @{ File = "headphones"; X = 1226; Y = 557 }
)

Export-Thumbnails `
  -SourcePath (Join-Path $workspace "assets\property-atlas.png") `
  -OutputDirectory (Join-Path $workspace "assets\store\properties") `
  -Items $properties

Export-Thumbnails `
  -SourcePath (Join-Path $workspace "assets\vehicle-atlas.png") `
  -OutputDirectory (Join-Path $workspace "assets\store\vehicles") `
  -Items $vehicles

Export-Thumbnails `
  -SourcePath (Join-Path $workspace "assets\item-atlas.png") `
  -OutputDirectory (Join-Path $workspace "assets\store\items") `
  -Items $items
