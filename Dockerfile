# Use an official Python runtime as a parent image
FROM python:3.13-slim

# Install system dependencies (FFmpeg for audio processing)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set the working directory to /app
WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Copy the project files into the container
COPY pyproject.toml uv.lock /app/

# Install the project's dependencies using the lockfile and settings
RUN uv sync --frozen --no-install-project

# Copy the rest of the project files into the container
COPY . /app

# Sync the project environment using the lockfile
RUN uv sync --frozen

# Make sure the environment is on the PATH
ENV PATH="/app/.venv/bin:$PATH"

# Expose port
EXPOSE 8000

# Run the application
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
