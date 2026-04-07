import pytest
from unittest.mock import patch, MagicMock
from app.utils.log_utils import log_method, method_logger
from app.constants.constants import Constants

class TestLogUtils:
    @patch('app.utils.log_utils.logger')
    def test_log_method_success(self, mock_logger):
        @log_method
        def sample_function():
            return "success"

        result = sample_function()
        assert result == "success"
        assert mock_logger.opt.return_value.info.call_count == 2  # start and end

    @patch('app.utils.log_utils.logger')
    def test_log_method_error(self, mock_logger):
        @log_method
        def sample_function():
            raise ValueError("test error")

        with pytest.raises(ValueError, match="test error"):
            sample_function()
        mock_logger.opt.return_value.error.assert_called_once()

    @patch('app.utils.log_utils.logger')
    def test_method_logger_decorates_methods(self, mock_logger):
        @method_logger
        class TestClass:
            def method1(self):
                return "method1"

            def method2(self):
                return "method2"

        obj = TestClass()
        result1 = obj.method1()
        result2 = obj.method2()
        assert result1 == "method1"
        assert result2 == "method2"
        # Check that logger was called for each method call
        assert mock_logger.opt.return_value.info.call_count == 4  # 2 start + 2 end