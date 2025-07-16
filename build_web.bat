@echo off
echo Building Arachisya for Web...

REM Set up Emscripten environment
call D:\emsdk\emsdk_env.bat

REM Create backup of current HTML file
if not exist backup mkdir backup
if exist Arachisya.html copy Arachisya.html backup\Arachisya.html

REM Clean previous web build
if exist Arachisya.html del Arachisya.html
if exist Arachisya.js del Arachisya.js
if exist Arachisya.wasm del Arachisya.wasm
if exist Arachisya.data del Arachisya.data

REM Build the game for web
mingw32-make PLATFORM=PLATFORM_WEB -B

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Fixing canvas size to match desktop version...
    powershell -Command "$html = Get-Content 'Arachisya.html' -Raw; $html = $html -replace 'canvas\.emscripten\{[^}]*\}', 'canvas.emscripten{border:0 none;background:#000;width:682px;height:576px;display:block;margin:0 auto}'; $html = $html -replace '<title>[^<]*</title>', '<title>Arachisya - 2D Action RPG</title>'; Set-Content 'Arachisya.html' $html"
    
    echo.
    echo Copying enhanced HTML from backup if it exists...
    if exist backup\Arachisya.html (
        copy backup\Arachisya.html Arachisya.html
        echo Enhanced HTML file restored from backup
    ) else (
        echo No backup HTML found, using generated version
    )
    
    echo.
    echo Build successful!
    echo Generated files:
    echo - Arachisya.html (enhanced version)
    echo - Arachisya.js  
    echo - Arachisya.wasm
    echo - Arachisya.data
    echo.
    echo To test the game, run: python -m http.server 8080
    echo Then open: http://localhost:8080/Arachisya.html
) else (
    echo.
    echo Build failed! Check the error messages above.
)

pause
