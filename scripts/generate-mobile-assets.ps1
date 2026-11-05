# scripts/generate-mobile-assets.ps1
# Script to generate Android App Icons and Clean Splash Screens from Hifzhly logo / Event Icon

Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not $projectRoot) { $projectRoot = Get-Location }

# Check for custom event icon or fallback to default Hifzhly logo
$sourceIcon = Join-Path $projectRoot "frontend/public/event-icon.png"
if (-not (Test-Path $sourceIcon)) {
    $sourceIcon = Join-Path $projectRoot "frontend/public/icon_favicon.png"
}

Write-Host "Using source icon: $sourceIcon"

$resDir = Join-Path $projectRoot "frontend/android/app/src/main/res"

function Generate-Icon {
    param(
        [string]$Src,
        [string]$Dst,
        [int]$Size,
        [bool]$Round = $false,
        [bool]$IsForeground = $false
    )
    $srcImg = [System.Drawing.Image]::FromFile($Src)
    $destBmp = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($destBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    if ($Round) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $Size, $Size)
        $g.SetClip($path)
    }

    if ($IsForeground) {
        # Foreground adaptive icon: padded in center (72dp in 108dp canvas = 66% size)
        $pad = [int]($Size * 0.18)
        $innerSize = $Size - ($pad * 2)
        $g.DrawImage($srcImg, $pad, $pad, $innerSize, $innerSize)
    } else {
        $g.DrawImage($srcImg, 0, 0, $Size, $Size)
    }

    $g.Dispose()
    $srcImg.Dispose()

    $destBmp.Save($Dst, [System.Drawing.Imaging.ImageFormat]::Png)
    $destBmp.Dispose()
}

# Icon configurations per density
$iconConfigs = @(
    @{ Dir = "mipmap-mdpi";    Launcher = 48;  Fg = 108 },
    @{ Dir = "mipmap-hdpi";    Launcher = 72;  Fg = 162 },
    @{ Dir = "mipmap-xhdpi";   Launcher = 96;  Fg = 216 },
    @{ Dir = "mipmap-xxhdpi";  Launcher = 144; Fg = 324 },
    @{ Dir = "mipmap-xxxhdpi"; Launcher = 192; Fg = 432 }
)

foreach ($c in $iconConfigs) {
    $dirPath = Join-Path $resDir $c.Dir
    if (Test-Path $dirPath) {
        Generate-Icon $sourceIcon (Join-Path $dirPath "ic_launcher.png") $c.Launcher $false $false
        Generate-Icon $sourceIcon (Join-Path $dirPath "ic_launcher_round.png") $c.Launcher $true $false
        Generate-Icon $sourceIcon (Join-Path $dirPath "ic_launcher_foreground.png") $c.Fg $false $true
        Write-Host "Updated icons for $($c.Dir) [Launcher: $($c.Launcher)px, Fg: $($c.Fg)px]"
    }
}

# Generate Clean Islamic Emerald Splash Screen
function Generate-SplashScreen {
    param(
        [string]$SrcIcon,
        [string]$DstPath,
        [int]$Width,
        [int]$Height
    )
    $srcImg = [System.Drawing.Image]::FromFile($SrcIcon)
    $bmp = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Clean Luminous White Background (#ffffff)
    $bgColor = [System.Drawing.ColorTranslator]::FromHtml("#ffffff")
    $g.Clear($bgColor)

    # Center Logo size (about 25% of min dimension)
    $minDim = [Math]::Min($Width, $Height)
    $logoSize = [int]($minDim * 0.28)
    if ($logoSize -lt 96) { $logoSize = 96 }
    if ($logoSize -gt 320) { $logoSize = 320 }

    $x = [int](($Width - $logoSize) / 2)
    $y = [int](($Height - $logoSize) / 2)

    $g.DrawImage($srcImg, $x, $y, $logoSize, $logoSize)

    $g.Dispose()
    $srcImg.Dispose()

    $bmp.Save($DstPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

# Logo murni untuk splash screen (tanpa kotak / border)
$splashSource = Join-Path $projectRoot "frontend/public/logo saja.png"
if (-not (Test-Path $splashSource)) { $splashSource = $sourceIcon }

# Update default splash.png
$defaultSplash = Join-Path $resDir "drawable/splash.png"
Generate-SplashScreen $splashSource $defaultSplash 1080 1920
Write-Host "Updated drawable/splash.png (Clean White & Green)"

# Update portrait and landscape splash folders if present
$splashDirs = @(
    @{ Dir = "drawable-port-mdpi"; W = 320; H = 480 },
    @{ Dir = "drawable-port-hdpi"; W = 480; H = 800 },
    @{ Dir = "drawable-port-xhdpi"; W = 720; H = 1280 },
    @{ Dir = "drawable-port-xxhdpi"; W = 960; H = 1600 },
    @{ Dir = "drawable-port-xxxhdpi"; W = 1280; H = 1920 }
)

foreach ($s in $splashDirs) {
    $dirPath = Join-Path $resDir $s.Dir
    if (Test-Path $dirPath) {
        $out = Join-Path $dirPath "splash.png"
        Generate-SplashScreen $splashSource $out $s.W $s.H
        Write-Host "Updated $($s.Dir)/splash.png (Clean White & Green)"
    }
}

Write-Host "All Android Icons & Splash Screens generated successfully!"

