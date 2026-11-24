from rest_framework.response import Response
from rest_framework import status

def success_response(data=None, message="Operation completed successfully.", status_code=status.HTTP_200_OK):
    """
    Standardized success response wrapper.
    """
    payload = {
        'success': True,
        'message': message,
        'data': data
    }
    return Response(payload, status=status_code)

def error_response(message="An error occurred.", errors=None, status_code=status.HTTP_400_BAD_REQUEST, data=None):
    """
    Standardized error response wrapper with optional diagnostic context.
    """
    payload = {
        'success': False,
        'message': message,
        'errors': errors or {}
    }
    if data is not None:
        payload['data'] = data
    return Response(payload, status=status_code)
