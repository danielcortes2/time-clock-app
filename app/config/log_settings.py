import os

from loguru import logger

from app.constants.constants import Constants


class LogSettings:
    def configure_logging(self):
        """
        Configures the logging settings for the application.

        This method sets up the logging configuration by ensuring that the log directory exists,
        defining the log file path, and adding a log handler with specified formatting, log level,
        log rotation, and retention policies. In case of any errors during the setup, it logs the
        error and raises the exception.

        Raises:
            Exception: If an error occurs while setting up the logging configuration.
        """
        try:
            os.makedirs(Constants.LOG_DIR, exist_ok=True)

            log_path = os.path.join(Constants.LOG_DIR, Constants.LOG_FILE)

            logger.add(
                log_path,
                format="{time} {level} {message}",
                level=Constants.INFO,
                rotation=Constants.ROTATION,
                retention=Constants.RETENTION,
            )
        except Exception as e:
            logger.error(
                f"{Constants.ERROR_CLASS} {self.__class__.__name__} {Constants.ERROR} {e}"
            )
            raise
