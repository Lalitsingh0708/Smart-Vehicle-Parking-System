Add-Type -AssemblyName System.Drawing

$srcPath = Resolve-Path "public\images\landing-design.jpg"
$destPath = Join-Path (Resolve-Path "public\images") "landing-design-2k.jpg"

$src = [System.Drawing.Image]::FromFile($srcPath)
$newW = [int]($src.Width * 2.5)
$newH = [int]($src.Height * 2.5)

$dest = New-Object System.Drawing.Bitmap $newW, $newH
$g = [System.Drawing.Graphics]::FromImage($dest)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$rect = New-Object System.Drawing.Rectangle 0, 0, $newW, $newH
$g.DrawImage($src, $rect)

$dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)

$g.Dispose()
$dest.Dispose()
$src.Dispose()

Write-Host ("Upscaled successfully to " + $newW + "x" + $newH + ": " + $destPath)
