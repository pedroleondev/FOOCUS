---
name: docker-push
description: Automates the process of building a web application and pushing the resulting Docker image to a registry (Docker Hub or GitHub Container Registry).
---

# Skill: Docker Build and Push

This skill automates the workflow for containerizing a web application and deploying it to a remote registry.

## Prerequisites

- Docker installed and running.
- User logged into the target registry (`docker login`).
- A valid `Dockerfile` or `Dockerfile.production` in the project root.

## Usage

When the user asks to "build and push" or "deploy to docker", follow these steps:

1. **Environment Validation**:
   - Check for the existence of `Dockerfile` or `Dockerfile.production`.
   - Verify if a build folder (e.g., `dist` or `build`) is needed by the Dockerfile.

2. **Local Build**:
   - If the Dockerfile relies on pre-built assets, run the build command (e.g., `npm run build`).

3. **Docker Build**:
   - Build the image with the appropriate tag.
   - Example: `docker build -f Dockerfile.production -t <registry>/<repository>:<tag> .`

4. **Docker Push**:
   - Push the image to the registry.
   - Example: `docker push <registry>/<repository>:<tag>`

## Example Workflow

```bash
# 1. Build local assets
npm run build

# 2. Build Docker Image
docker build -f Dockerfile.production -t pedroleonpython/foocus:latest .

# 3. Push to Docker Hub
docker push pedroleonpython/foocus:latest
```

> [!IMPORTANT]
> Always verify if `.dockerignore` is present to avoid sending unnecessary files (like `node_modules`) to the Docker daemon.
