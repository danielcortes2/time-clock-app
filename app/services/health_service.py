from app.utils.log_utils import method_logger

@method_logger
class HealthService:

    def __init__(self):
        pass

    @staticmethod
    def health_check():
        return {"status": "Working"}