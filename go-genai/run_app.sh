#!/bin/bash

# Set environment variables if not already set
export PORT=${PORT:-8080}
export LLM_BASE_URL=${LLM_BASE_URL:-"http://localhost:11434"}
export LLM_MODEL_NAME=${LLM_MODEL_NAME:-"llama2"}
export LOG_LEVEL=${LOG_LEVEL:-"INFO"}

# Ensure directories exist
mkdir -p static
mkdir -p templates

# Check if swagger.json exists
if [ ! -f "static/swagger.json" ]; then
    echo "WARNING: swagger.json not found in static directory. Copying from project root if available."
    if [ -f "swagger.json" ]; then
        cp swagger.json static/
    fi
fi

# Check if test.html exists
if [ ! -f "static/test.html" ]; then
    echo "Creating test.html in static directory."
    echo '<!DOCTYPE html><html><head><title>Static File Test</title></head><body><h1>Static File Test</h1><p>If you can see this page, static files are being served correctly.</p></body></html>' > static/test.html
fi

# Print debug information
echo "Current directory: $(pwd)"
echo "Files in static directory:"
ls -la static/
echo "Files in templates directory:"
ls -la templates/

# Run the application
go run main.go
