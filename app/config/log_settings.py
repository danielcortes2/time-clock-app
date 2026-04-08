import os

from loguru import logger

from app.constants.constants import Constants


class LogSettings:
    def configure_logging(self):
        try:
            log_dir = Constants.LOG_DIR
            # Vercel and other serverless environments have read-only filesystems
            # Only add file logging if the directory is writable
            if os.access(os.path.dirname(os.path.abspath(log_dir)) if log_dir else ".", os.W_OK):
                os.makedirs(log_dir, exist_ok=True)
                log_path = os.path.join(log_dir, Constants.LOG_FILE)
                logger.add(
                    log_path,
                    format="{time} {level} {message}",
                    level=Constants.INFO,
                    rotation=Constants.ROTATION,
                    retention=Constants.RETENTION,
                )
            else:
                logger.info("File logging disabled (read-only filesystem).")
        except Exception as e:
            logger.error(
                f"{Constants.ERROR_CLASS} {self.__class__.__name__} {Constants.ERROR} {e}"
            )
            # Don't raise - logging failure should not crash the app
