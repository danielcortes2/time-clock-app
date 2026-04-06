from testcontainers.generic import ServerContainer
from testcontainers.core.waiting_utils import wait_for_logs
from testcontainers.core.image import DockerImage

def test_docker_run():
    with DockerImage(path=".", tag="fastapi-test:latest") as image:
        with ServerContainer(port=9090, image=image) as fastapi_server:
            wait_for_logs(fastapi_server, "Uvicorn running on http://0.0.0.0:9090")
            fastapi_server.get_api_url = lambda: fastapi_server._create_connection_url()
            print(f"API URL: {fastapi_server.get_api_url()}")
            client = fastapi_server.get_client()
            response = client.get("/health")
            assert response.status_code == 200
            assert response.json() == {"status":"Working"}