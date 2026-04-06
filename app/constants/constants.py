class Constants:
    
    FILE_EXTRACTOR = "file_extractor"
    RECURSIVE_TEXT_SPLITTER = "recursive_text_splitter"
    LLM_EMBEDDING_MODEL = "llm_embedding_model"
    AZURE_SEARCH_INDEXER = "azure_search_indexer"
    AZURE_BLOB_STORAGE_EXTRACTOR = "azure_blob_storage_extractor"
    CHANGE_SOURCE_TO_BLOB_RUNNABLE = "change_source_to_blob_runnable"
    WEB_EXTRACTOR = "web_extractor"
    
    # Error message
    ERROR = "The error is: "
    ERROR_CLASS = "The error has occurred in this class: "
    ERROR_INITIALIZING = "Error initializing"
    ERROR_INITIALIZING_COMPONENTS = "Error initializing components:"
    ERROR_NO_EXPECTED_FILES = "Files not found in the expected path"
    ERROR_FILES_NOT_FOUND_ON_SERVER = "Files not found in the server"
    ERROR_TRANSCRIPTION_API_CALL_FAILED = "Call to transcription service failed"
    ERROR_SSH_MESSAGE_CLOSE = "SSH connection close failed"
    ERROR_AZURE_BLOB_MESSAGE_CLOSE = "Azure connection close failed"
    ERROR_SFTP_MESSAGE_CLOSE = "SFTP connection close failed"
    ERROR_BLOB_INITIALIZING = "Error initializing blob connection"
    ERROR_UPDATE_PROCESS_STATUS = "Error while updating process status:"
    ERROR_CONVERTING_FILE = "Error converting file:" 
    ERROR_CONVERSION_PROCESS = "Error in conversion process:"
    ERROR_DURING_CONVERSION = "Error during conversion:"
    ERROR_NOT_EXIST_OR_NOT_ACCESSIBLE = "does not exist or is not accessible"
    ERROR_PROCESSING = "Error processing file:"
    ERROR_COULD_NOT_CREATE_LOCAL_DIRECTORY = "Error could not create local directory: "
    ERROR_CLOSING_BLOB_SERVICE_CLIENT = "Error closing blob service client for container: "
    ERROR_SESSION_DATABASE = "An error occurred while using the database session"

    # Process File
    CREATING = "Creating"
    DOWNLOADING = "Downloading"
    DOWNLOADED_FILE_EMPTY = "Downloaded file is empty:"
    FILE_NOT_FOUND = "file not found:"
    SUCCESSFULLY_DOWNLOADED = "Successfully downloaded"
    CONVERTING = "Converting"
    UPLOADING = "Uploading"
    SUCCESSFULLY_PROCESSED = "Successfully processed"
    ERROR_PROCESSING = "Error processing"
    ERROR_CLOSING_VIDEO = "Error closing video:"
    CLEANED = "Cleaned up"
    ERROR_CLEANING = "Error cleaning up"
    DOWNLOADING_FILE = "Downloading file:"
    TEMPORARY_FILE = "Temporary file: "

    # DB
    MIGRATIONS_TO_BE_EXECUTED="Migrations to be executed:"
    EXECUTING_MIGRATIONS="Executing migrations..."
    CHECKING_MIGRATION_STATUS="Checking migration status..."
    LOCAL_MIGRATIONS_RECORDED="Local migrations recorded:"
    ROLLBACK_DONE = "Transaction rollback completed"

    # Logging messages 
    STARTING = "Starting - "
    ENDING = "Ending - "
    ERROR = "Error - "
    CLASS = "Class: "
    METHOD = "Method: "
    USER_LOG = "User: "
    USER_ID = "User"
    ASSISTANT = "Assistant: "
    TEST = "Test: "
    TABLE_LOG = "Table: "
    CREATING_NEW_TABLE = "Creating new table  "
    ALREADY_EXISTS_SKIPPING = "already exists, skipping..."
    ROLLBACK_DONE = "Transaction rollback completed"
    VERIFY_TABLE = "Verifying table:"
    LOG_UNKNOWN_USER = "UnknownUser"
    LOG_UNKNOWN_CLASS = "UnknownClass"

    # Logging fields
    ROTATION = "10 MB"
    RETENTION = "30 days"
    LOG_SEPARATOR = "=" * 80

    # Logging level
    INFO = "INFO"

    # paths
    LOG_FILE = "app.log"
    LOG_DIR = "./logs"
    TEMP_PREFFIX = "tmp_"
    TEMP_SUFFIX = "_dir"

    # Texts
    RECORDING_NAME = "NombreGrabacion"
    RECORDS = "records"
    UTF_8 = "utf-8"
    XLS_ENGINE = "xlrd"
    TXT_EXT = ".txt"
    MP3_EXT = ".mp3"
    MP4_EXT = ".mp4"
    ROLE = "role"
    USER = "user"
    SYSTEM = "system"
    CONTENT = "content"
    SHEET_NAME = "Sheet1"
    STATUS = "status"
    STATUS_SUCCESS = "success"
    STATUS_OK = "ok"
    STATUS_ERROR = "error"
    FILE_NAME = "file_name"
    
    BLOB_CORE_WINDOWS_NET = ".blob.core.windows.net"

    # WEB
    HTTPS = "https://"


    # Splitters #
    BREAKPOINT_THRESHOLD_TYPE = "percentile"
    BREAKPOINT_THRESHOLD_AMOUNT = 95

    # Map Markdown conversion -> file extensions
    FORMAT_MAP = {
        # Text documents formats
        'docx': 'docx',
        'odt': 'odt',
        'pptx': 'pptx',
        'pdf': 'pdf',
        'xlsx': 'xlsx',
    }

    PDF_CLEAN = r'\n\s*|\s+'

    WORD_AVAILABLE_FORMATS = [
        '.docx',
        '.odt',
    ]

    # Azure Search Indexer
    SOURCE="source"
    CONTEXT="context"
    PAGE_LABEL="page_label"
    TOTAL_PAGES="total_pages"
    TYPE_EDM_STRING = "Edm.String"
    TYPE_EDM_INT32 = "Edm.Int32"
    
