Add-Type -AssemblyName System.Drawing

$size = 512
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
$c1 = [System.Drawing.Color]::FromArgb(243, 146, 118)
$c2 = [System.Drawing.Color]::FromArgb(201, 79, 61)
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 90)
$g.FillRectangle($bg, $rect)

# circulo de luz no fundo
$luzFundo = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 255, 255, 255))
$g.FillEllipse($luzFundo, 26, 26, 460, 460)

# forma da forminha (trapezio)
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$pts = New-Object 'System.Drawing.Point[]' 4
$pts[0] = New-Object System.Drawing.Point(160, 298)
$pts[1] = New-Object System.Drawing.Point(352, 298)
$pts[2] = New-Object System.Drawing.Point(318, 432)
$pts[3] = New-Object System.Drawing.Point(194, 432)
$path.AddPolygon($pts)
$forminha = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(247, 217, 176))
$g.FillPath($forminha, $path)

# listras da forminha
$canetaListra = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(110, 198, 148, 98), 9)
$canetaListra.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$canetaListra.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
foreach ($x in @(206, 246, 286, 326)) {
  $g.DrawLine($canetaListra, $x, 306, ($x + 5), 424)
}

# cobertura (nuvem de bolinhas)
$cobertura = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 247, 236))
$g.FillEllipse($cobertura, 132, 238, 124, 124)
$g.FillEllipse($cobertura, 256, 238, 124, 124)
$g.FillEllipse($cobertura, 170, 196, 172, 164)
$g.FillEllipse($cobertura, 204, 164, 104, 104)

# cereja
$cereja = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(190, 46, 38))
$g.FillEllipse($cereja, 226, 126, 60, 60)
$brilho = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(90, 255, 255, 255))
$g.FillEllipse($brilho, 238, 138, 20, 16)

# cabinho
$canetaCabo = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(99, 58, 40), 9)
$canetaCabo.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$canetaCabo.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$cabo = New-Object 'System.Drawing.PointF[]' 3
$cabo[0] = New-Object System.Drawing.PointF(256, 130)
$cabo[1] = New-Object System.Drawing.PointF(267, 108)
$cabo[2] = New-Object System.Drawing.PointF(289, 97)
$g.DrawCurve($canetaCabo, $cabo)

# confeitos
$conf1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(226, 103, 79))
$conf2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(214, 158, 46))
$conf3 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(88, 150, 106))
$g.FillEllipse($conf1, 196, 270, 13, 13)
$g.FillEllipse($conf2, 292, 256, 12, 12)
$g.FillEllipse($conf3, 248, 300, 13, 13)
$g.FillEllipse($conf2, 318, 296, 11, 11)

$destino512 = Join-Path $PSScriptRoot "..\public\app-sol-512.png"
$destino192 = Join-Path $PSScriptRoot "..\public\app-sol-192.png"
$bmp.Save($destino512, [System.Drawing.Imaging.ImageFormat]::Png)

$b192 = New-Object System.Drawing.Bitmap(192, 192)
$g2 = [System.Drawing.Graphics]::FromImage($b192)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g2.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g2.DrawImage($bmp, 0, 0, 192, 192)
$b192.Save($destino192, [System.Drawing.Imaging.ImageFormat]::Png)

$g2.Dispose(); $b192.Dispose(); $g.Dispose(); $bmp.Dispose()
Write-Output "ok"
