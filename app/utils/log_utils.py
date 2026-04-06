from functools import wraps
from loguru import logger
from app.constants.constants import Constants


def log_method(func):
    """
    Decorator for logging method entry, exit, and errors, while fixing stack trace issues.
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        instance = args[0] if args else None
        user = getattr(instance, "_user", Constants.LOG_UNKNOWN_USER)

        class_name = (
            instance.__class__.__name__ if instance else Constants.LOG_UNKNOWN_CLASS
        )
        method_name = func.__name__

        logger.opt(depth=1).info(
            f"{Constants.STARTING} {Constants.CLASS} {class_name} - {Constants.METHOD} {method_name} - {Constants.USER_LOG} {user}"
        )

        try:
            result = func(*args, **kwargs)
            logger.opt(depth=1).info(
                f"{Constants.ENDING} {Constants.CLASS} {class_name} - {Constants.METHOD} {method_name} - {Constants.USER_LOG} {user}"
            )
            return result
        except Exception as e:
            logger.opt(depth=1).error(
                f"{Constants.ERROR} {Constants.CLASS} {class_name} - {Constants.METHOD} {method_name} - {Constants.USER_LOG} {user} - {e}"
            )
            raise

    return wrapper


def method_logger(cls):
    """
    Decorator for logging all methods of a class.
    """
    for attr_name, attr_value in cls.__dict__.items():
        if callable(attr_value) and not attr_name.startswith("__"):
            setattr(cls, attr_name, log_method(attr_value))
    return cls
