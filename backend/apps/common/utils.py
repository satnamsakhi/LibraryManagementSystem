import uuid
from datetime import datetime, date

def generate_booking_reference():
    """
    Generates a unique human-friendly booking reference like:
    LIB-YYYYMMDD-XXXX
    """
    today_str = datetime.now().strftime('%Y%m%d')
    random_suffix = uuid.uuid4().hex[:6].upper()
    return f"LIB-{today_str}-{random_suffix}"

def times_overlap(start1, end1, start2, end2):
    """
    Determines if two time intervals [start1, end1) and [start2, end2) overlap.
    Standard interval overlap condition: start1 < end2 and start2 < end1.
    """
    return max(start1, start2) < min(end1, end2)
