param (
    [string]$windowTitle,
    [bool]$enabled
)

try {
Add-Type -TypeDefinition @"
using System;
using System.Text;
using System.Runtime.InteropServices;
public class User32 {
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
    [DllImport("user32.dll", SetLastError = true)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
    [DllImport("user32.dll", SetLastError = true)]
    public static extern int GetWindowLong(IntPtr hWnd, int nIndex);
    [DllImport("user32.dll", SetLastError = true)]
    public static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);
    public const int GWL_EXSTYLE = -20;
    public const int WS_EX_LAYERED = 0x80000;
    public const int WS_EX_TRANSPARENT = 0x20;
    public static string GetWindowTitle(IntPtr hWnd) {
        StringBuilder sb = new StringBuilder(256);
        GetWindowText(hWnd, sb, sb.Capacity);
        return sb.ToString();
    }
}
"@
} catch {}
$windowId = [IntPtr]::Zero
[User32]::EnumWindows({
    param ($hWnd, $lParam)
    if ([User32]::GetWindowTitle($hWnd) -eq $windowTitle) {
        $script:windowId = $hWnd
        return $false
    }
    return $true
}, [IntPtr]::Zero) | Out-Null

if ($windowId -ne [IntPtr]::Zero) {
    if ($enabled) {[User32]::SetWindowLong($windowId, [User32]::GWL_EXSTYLE, [User32]::GetWindowLong($windowId, [User32]::GWL_EXSTYLE) -bor [User32]::WS_EX_LAYERED -bor [User32]::WS_EX_TRANSPARENT) | Out-Null}
    else {[User32]::SetWindowLong($windowId, [User32]::GWL_EXSTYLE, [User32]::GetWindowLong($windowId, [User32]::GWL_EXSTYLE) -band -bnot ([User32]::WS_EX_LAYERED -bor [User32]::WS_EX_TRANSPARENT)) | Out-Null}
} else {Write-Host "NOHTING FOUND"}
