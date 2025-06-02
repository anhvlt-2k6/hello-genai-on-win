FROM python:3.11-slim AS builder

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim

WORKDIR /app

# Create non-root user
RUN adduser --disabled-password --gecos "" nomadicmehul

# Copy dependencies from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Make sure directories exist
RUN mkdir -p templates static/css static/js static/images && chown -R nomadicmehul:nomadicmehul /app

# Copy application code
COPY app.py requirements.txt ./
COPY templates/ templates/
COPY static/ static/

# Switch to non-root user
USER nomadicmehul

# Expose port 8080 (matching docker-compose.yml)
EXPOSE 8080

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Run the application
CMD ["python", "app.py"]
