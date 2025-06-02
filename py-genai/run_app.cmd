@echo off
cd /d "%~dp0"
REM Set default environment variables if not already set
if not defined PORT set PORT=8080
if not defined DEBUG set DEBUG=false
if not defined LOG_LEVEL set LOG_LEVEL=INFO

REM Print configuration
echo Starting Hello-GenAI Python application
echo Port: %PORT%
echo Debug mode: %DEBUG%
echo Log level: %LOG_LEVEL%

REM Run the application
python app.py