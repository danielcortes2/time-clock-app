from pydantic import BaseModel, Field
from typing import Union, List

class ErrorDetail(BaseModel):
    loc: Union[List[Union[str, int]], None] = None
    msg: str = Field(..., description="Specific error message.")
    type: str = Field(..., description="Type of error (e.g., 'value_error.missing').")

class UnifiedErrorResponse(BaseModel):
    detail: str = Field(..., description="General error description.")
    errors: Union[List[ErrorDetail], None] = Field(None, description="List of specific errors, if applicable.")