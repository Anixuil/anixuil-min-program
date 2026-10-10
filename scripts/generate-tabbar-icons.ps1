# Editable vector construction for the native and custom tab bars.
# Run explicitly to regenerate the six transparent PNG assets; this is not a check.
Add-Type -AssemblyName System.Drawing
$assetDirectory = Join-Path $PSScriptRoot '../src/static/tabbar'
foreach ($selected in @($false, $true)) {
  $color = if ($selected) { '#e96b35' } else { '#65716a' }
  $suffix = if ($selected) { '-active' } else { '' }
  foreach ($name in @('home', 'history', 'profile')) {
    $bitmap = [Drawing.Bitmap]::new(120, 120)
    $graphics = [Drawing.Graphics]::FromImage($bitmap)
    $graphics.Clear([Drawing.Color]::Transparent)
    $graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.ScaleTransform(5, 5)
    $pen = [Drawing.Pen]::new([Drawing.ColorTranslator]::FromHtml($color), 1.85)
    $pen.StartCap = $pen.EndCap = [Drawing.Drawing2D.LineCap]::Round
    $pen.LineJoin = [Drawing.Drawing2D.LineJoin]::Round
    $brush = [Drawing.SolidBrush]::new($pen.Color)
    $shape = [Drawing.Drawing2D.GraphicsPath]::new()
    $detail = [Drawing.Drawing2D.GraphicsPath]::new()
    switch ($name) {
      'home' {
        # Soft roof, rounded shoulders and a wide doorway stay legible at 26 px.
        $shape.AddBezier(4,10,4,9,4.4,8.5,5.2,7.9)
        $shape.AddLine(5.2,7.9,10.5,3.8)
        $shape.AddBezier(10.5,3.8,11.4,3.1,12.6,3.1,13.5,3.8)
        $shape.AddLine(13.5,3.8,18.8,7.9)
        $shape.AddBezier(18.8,7.9,19.6,8.5,20,9,20,10)
        $shape.AddLine(20,10,20,18.2)
        $shape.AddBezier(20,18.2,20,19.8,19.2,20.5,17.6,20.5)
        $shape.AddLine(17.6,20.5,6.4,20.5)
        $shape.AddBezier(6.4,20.5,4.8,20.5,4,19.8,4,18.2)
        $shape.CloseFigure()
        $detail.AddLine(9,20.5,9,15)
        $detail.AddBezier(9,15,9,11.5,15,11.5,15,15)
        $detail.AddLine(15,15,15,20.5)
        if ($selected) {
          $detail.CloseFigure()
          $shape.AddPath($detail, $false)
          $graphics.FillPath($brush, $shape)
        } else {
          $graphics.DrawPath($pen, $shape)
          $graphics.DrawPath($pen, $detail)
        }
      }
      'history' {
        # A tilted shuttle replaces the grid-like court icon.
        $graphics.TranslateTransform(12,12)
        $graphics.RotateTransform(32)
        $graphics.TranslateTransform(-12,-12)
        $shape.AddBezier(5,4.8,8,2.4,16,2.4,19,4.8)
        $shape.AddLine(19,4.8,15,15.5)
        $shape.AddLine(15,15.5,9,15.5)
        $shape.CloseFigure()
        if ($selected) { $graphics.FillPath($brush, $shape) }
        $graphics.DrawPath($pen, $shape)
        $detail.AddLine(9,16,9,17.5)
        $detail.AddBezier(9,17.5,9,21.8,15,21.8,15,17.5)
        $detail.AddLine(15,17.5,15,16)
        if ($selected) { $graphics.FillPath($brush, $detail) }
        $graphics.DrawPath($pen, $detail)
        $featherPen = [Drawing.Pen]::new($pen.Color, 1.35)
        $featherPen.StartCap = $featherPen.EndCap = [Drawing.Drawing2D.LineCap]::Round
        if ($selected) {
          # SourceCopy cuts transparent feather grooves out of the silhouette.
          $graphics.CompositingMode = [Drawing.Drawing2D.CompositingMode]::SourceCopy
          $featherPen.Color = [Drawing.Color]::Transparent
        }
        $graphics.DrawLine($featherPen, 9,6,10.5,12.8)
        $graphics.DrawLine($featherPen, 15,6,13.5,12.8)
        $featherPen.Dispose()
      }
      'profile' {
        # Player badge: one compact circular silhouette instead of a stick figure.
        $shape.AddEllipse(3,3,18,18)
        $detail.AddEllipse(9,6.5,6,6)
        $detail.StartFigure()
        $detail.AddBezier(6.5,18.4,7.2,13.3,16.8,13.3,17.5,18.4)
        $detail.AddBezier(17.5,18.4,14.5,21,9.5,21,6.5,18.4)
        $detail.CloseFigure()
        if ($selected) {
          $shape.AddPath($detail, $false)
          $graphics.FillPath($brush, $shape)
        } else {
          $graphics.DrawPath($pen, $shape)
          $graphics.FillPath($brush, $detail)
        }
      }
    }
    $bitmap.Save((Join-Path $assetDirectory "$name$suffix.png"), [Drawing.Imaging.ImageFormat]::Png)
    $detail.Dispose(); $shape.Dispose(); $brush.Dispose(); $pen.Dispose()
    $graphics.Dispose(); $bitmap.Dispose()
  }
}
