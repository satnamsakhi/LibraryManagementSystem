import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Standardizes error responses across all DRF views.
    Ensures consistent format:
    {
        "success": False,
        "message": "Error description",
        "errors": { ... }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            'success': False,
            'message': 'An error occurred while processing your request.',
            'status_code': response.status_code,
            'errors': response.data
        }

        # If data is a dict and has a 'detail' field, use it as the message
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                custom_data['message'] = str(response.data['detail'])
            elif 'non_field_errors' in response.data:
                custom_data['message'] = str(response.data['non_field_errors'][0])
        elif isinstance(response.data, list) and len(response.data) > 0:
            custom_data['message'] = str(response.data[0])

        response.data = custom_data
    else:
        logger.error(f"Unhandled exception in request: {str(exc)}", exc_info=True)
        response = Response(
            {
                'success': False,
                'message': 'An unexpected internal server error occurred.',
                'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'errors': {'detail': str(exc)}
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response
