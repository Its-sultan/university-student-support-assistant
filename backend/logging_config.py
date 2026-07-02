"""
Logging setup (Task 8).

Records every interaction with a timestamp: received questions, generated
answers, and errors. Logs go to both the console and `logs/app.log`.
"""
import logging
import os
from logging.handlers import RotatingFileHandler

from config import settings


def setup_logging() -> logging.Logger:
    # Make sure the logs/ directory exists before we try to write to it.
    log_path = settings.log_file
    os.makedirs(os.path.dirname(log_path) or ".", exist_ok=True)

    logger = logging.getLogger("student_support")
    logger.setLevel(settings.log_level.upper())

    # Avoid adding duplicate handlers if setup_logging() is called twice.
    if logger.handlers:
        return logger

    fmt = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Rotating file handler keeps app.log from growing without bound.
    file_handler = RotatingFileHandler(
        log_path, maxBytes=1_000_000, backupCount=3, encoding="utf-8"
    )
    file_handler.setFormatter(fmt)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(fmt)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    logger.propagate = False
    return logger


logger = setup_logging()
