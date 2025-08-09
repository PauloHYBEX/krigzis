!include "MUI2.nsh"
!define APP_NAME "Krigzis"
!ifndef APP_VERSION
!define APP_VERSION "1.0.1"
!endif
OutFile "release\Krigzis-Setup-${APP_VERSION}.exe"
InstallDir "$LOCALAPPDATA\Krigzis"
RequestExecutionLevel user
!define MUI_ICON "assets\icon.ico"
!define MUI_UNICON "assets\icon.ico"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_LANGUAGE "PortugueseBR"
Section "Install"
SetOutPath "$INSTDIR"
File /r "release\win-unpacked\*"
CreateDirectory "$SMPROGRAMS\Krigzis"
CreateShortCut "$SMPROGRAMS\Krigzis\Krigzis.lnk" "$INSTDIR\Krigzis.exe"
CreateShortCut "$DESKTOP\Krigzis.lnk" "$INSTDIR\Krigzis.exe"
WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd
Section "Uninstall"
Delete "$SMPROGRAMS\Krigzis\Krigzis.lnk"
RMDir "$SMPROGRAMS\Krigzis"
RMDir /r "$INSTDIR"
SectionEnd
