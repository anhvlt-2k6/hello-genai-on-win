@echo off
cd /d "%~dp0"

setlocal enabledelayedexpansion

set "LLM_MODEL_NAME="
for /f "usebackq tokens=1,2 delims==" %%A in (`findstr /B /V "#" .env ^| findstr "LLM_MODEL_NAME"`) do (
    set "LLM_MODEL_NAME=%%B"
)
if "%LLM_MODEL_NAME%"=="" (
    echo Error: LLM_MODEL_NAME not found in .env file or it's commented out.
    exit /b 1
)

echo Using LLM model: %LLM_MODEL_NAME%
docker model pull %LLM_MODEL_NAME%

echo Running Docker Compose...
docker compose up --build