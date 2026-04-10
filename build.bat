@echo off
chcp 65001 > nul
echo.
echo ================================================
echo   Budget Manager — Compilacion a .exe
echo ================================================
echo.

echo [PREREQUISITO] Este proceso requiere:
echo   - Node.js 18+
echo   - Visual Studio Build Tools (C++ workload)
echo     Descargar en: https://visualstudio.microsoft.com/visual-cpp-build-tools/
echo   - Python 3.x (para node-gyp)
echo.
echo Presiona cualquier tecla para continuar o CTRL+C para cancelar...
pause > nul

echo.
echo [1/4] Instalando dependencias npm...
call npm install
if %errorlevel% neq 0 (
  echo.
  echo [ERROR] Fallo la instalacion de dependencias.
  echo Si el error menciona "better-sqlite3" o "node-gyp", instala:
  echo   Visual Studio Build Tools con el componente "Desarrollo para escritorio con C++"
  echo   Descarga: https://visualstudio.microsoft.com/visual-cpp-build-tools/
  echo.
  pause
  exit /b 1
)

echo.
echo [2/4] Compilando frontend React con Vite...
call npm run build
if %errorlevel% neq 0 (
  echo [ERROR] Fallo la compilacion del frontend.
  pause
  exit /b 1
)

echo.
echo [3/4] Empaquetando como ejecutable Windows (.exe portable)...
call npx electron-builder --win --x64
if %errorlevel% neq 0 (
  echo [ERROR] Fallo el empaquetado con electron-builder.
  pause
  exit /b 1
)

echo.
echo ================================================
echo   COMPILACION EXITOSA
echo   El ejecutable esta en: dist-electron\
echo ================================================
echo.
echo RECORDATORIO: Si deseas cambiar el icono de la app,
echo reemplaza el archivo assets\icon.png y vuelve a compilar.
echo.
pause
