import pytest
import time
import requests
import subprocess
from testcontainers.core.container import DockerContainer
import os

def image_exists(image_name):
    """Check if a Docker image exists locally"""
    try:
        result = subprocess.run(
            ["docker", "images", "-q", image_name],
            capture_output=True,
            text=True,
            timeout=5
        )
        return bool(result.stdout.strip())
    except Exception:
        return False

@pytest.mark.integration
@pytest.mark.skipif(
    not os.path.exists('/var/run/docker.sock') and not os.environ.get('DOCKER_HOST'),
    reason="Docker daemon not available"
)
def test_docker_run():
    """
    Integration test that runs the FastAPI app in Docker.
    
    Prerequisites:
    - Docker daemon must be running
    - Image 'fastapi-test:latest' must be built first with:
      docker build -t fastapi-test:latest .
    
    To run this test:
      poetry run pytest -m integration
    """
    # Skip if image doesn't exist
    if not image_exists("fastapi-test:latest"):
        pytest.skip("Docker image 'fastapi-test:latest' not found. Build it first with: docker build -t fastapi-test:latest .")
    
    container = None
    try:
        # Start the container with proper timeout
        container = DockerContainer("fastapi-test:latest")
        container.with_exposed_ports(9090)
        
        container.start()
        
        # Get the mapped port
        host_port = container.get_exposed_port(9090)
        api_url = f"http://localhost:{host_port}"
        
        print(f"\nAPI URL: {api_url}")
        
        # Wait for server to be ready with retries
        max_retries = 15
        for attempt in range(max_retries):
            try:
                response = requests.get(f"{api_url}/health", timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    assert data == {"status": "Working"}, f"Unexpected response: {data}"
                    print(f"✓ Health check passed on attempt {attempt + 1}")
                    return  # Test passed
            except requests.exceptions.RequestException as e:
                if attempt < max_retries - 1:
                    print(f"Attempt {attempt + 1}/{max_retries} failed, retrying...")
                    time.sleep(2)
                else:
                    # Show container logs on failure
                    logs = container.get_logs()
                    print(f"\nContainer logs:\n{logs[0].decode() if logs else 'No logs available'}")
                    raise AssertionError(f"Failed to connect to container after {max_retries} attempts: {e}")
                    
    finally:
        if container:
            try:
                container.stop()
            except Exception as e:
                print(f"Warning: Failed to stop container: {e}")