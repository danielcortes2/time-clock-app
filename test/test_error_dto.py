import pytest
from app.dto.error_dto import ErrorDetail, UnifiedErrorResponse

class TestErrorDTO:
    def test_error_detail_creation(self):
        error = ErrorDetail(loc=["field", "subfield"], msg="Field is required", type="value_error.missing")
        assert error.loc == ["field", "subfield"]
        assert error.msg == "Field is required"
        assert error.type == "value_error.missing"

    def test_error_detail_optional_loc(self):
        error = ErrorDetail(msg="Some error", type="custom_error")
        assert error.loc is None
        assert error.msg == "Some error"
        assert error.type == "custom_error"

    def test_unified_error_response_creation(self):
        response = UnifiedErrorResponse(detail="General error", errors=None)
        assert response.detail == "General error"
        assert response.errors is None

    def test_unified_error_response_with_errors(self):
        errors = [
            ErrorDetail(msg="Error 1", type="type1"),
            ErrorDetail(msg="Error 2", type="type2")
        ]
        response = UnifiedErrorResponse(detail="Multiple errors", errors=errors)
        assert response.detail == "Multiple errors"
        assert len(response.errors) == 2
        assert response.errors[0].msg == "Error 1"
        assert response.errors[1].msg == "Error 2"