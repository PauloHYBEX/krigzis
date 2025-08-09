!include "MUI2.nsh"

!ifndef APP_VERSION
!define APP_VERSION "1.0.1"
!endif

!ifdef ICON_PATH
!define MUI_ICON "${ICON_PATH}"
!define MUI_UNICON "${ICON_PATH}"
!else
!define MUI_ICON "assets\\icon.ico"
!define MUI_UNICON "assets\\icon.ico"
!endif

!define APP_NAME "Krigzis"
Name "${APP_NAME} ${APP_VERSION}"
OutFile "release\\Krigzis-Setup-${APP_VERSION}.exe"
InstallDir "$LOCALAPPDATA\\Krigzis"
RequestExecutionLevel user
SetCompressor /SOLID lzma

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_LANGUAGE "PortugueseBR"

Section "Install"
SetShellVarContext current
SetOutPath "$INSTDIR"
File /r "release\\win-unpacked\\*"
CreateDirectory "$SMPROGRAMS\\Krigzis"
CreateShortCut "$SMPROGRAMS\\Krigzis\\Krigzis.lnk" "$INSTDIR\\Krigzis.exe" "" "$INSTDIR\\Krigzis.exe" 0
CreateShortCut "$DESKTOP\\Krigzis.lnk" "$INSTDIR\\Krigzis.exe" "" "$INSTDIR\\Krigzis.exe" 0
WriteUninstaller "$INSTDIR\\Uninstall.exe"
SectionEnd

Section "Uninstall"
SetShellVarContext current
Delete "$SMPROGRAMS\\Krigzis\\Krigzis.lnk"
RMDir "$SMPROGRAMS\\Krigzis"
Delete "$DESKTOP\\Krigzis.lnk"
RMDir /r "$INSTDIR"
SectionEnd
