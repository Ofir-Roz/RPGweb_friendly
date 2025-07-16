@echo off
echo Building Arachisya for Web...

REM Set up Emscripten environment
call D:\emsdk\emsdk_env.bat

REM Clean previous web build
if exist web\Arachisya.html del web\Arachisya.html
if exist web\Arachisya.js del web\Arachisya.js
if exist web\Arachisya.wasm del web\Arachisya.wasm
if exist web\Arachisya.data del web\Arachisya.data

REM Build the game for web
mingw32-make PLATFORM=PLATFORM_WEB -B

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Fixing canvas size to match desktop version...
    powershell -Command "$html = Get-Content 'web\Arachisya.html' -Raw; $html = $html -replace 'canvas\.emscripten\{[^}]*\}', 'canvas.emscripten{border:0 none;background:#000;width:682px;height:576px;display:block;margin:0 auto}'; $html = $html -replace '<title>[^<]*</title>', '<title>Arachisya - 2D Action RPG</title>'; Set-Content 'web\Arachisya.html' $html"
    echo.
    echo Build successful!
    echo Generated files in web/ folder:
    echo - web/Arachisya.html (fixed canvas size: 682x576)
    echo - web/Arachisya.js  
    echo - web/Arachisya.wasm
    echo - web/Arachisya.data
    echo.
    echo To test the game, run: python -m http.server 8080
    echo Then open: http://localhost:8080/web/Arachisya.html
) else (
    echo.
    echo Build failed! Check the error messages above.
)

pause
