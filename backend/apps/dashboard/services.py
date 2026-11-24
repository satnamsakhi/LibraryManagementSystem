from datetime import date, timedelta
from django.db.models import Count, Q
from apps.accounts.models import User
from apps.library.models import Seat, TimeSlot
from apps.bookings.models import Booking
from apps.bookings.serializers import BookingReadSerializer

class DashboardService:
    @staticmethod
    def get_student_dashboard_stats(user):
        """
        Gathers metrics and upcoming bookings for the student dashboard.
        """
        today = date.today()
        user_bookings = Booking.objects.filter(user=user)

        total_bookings = user_bookings.count()
        active_bookings_count = user_bookings.filter(booking_status='CONFIRMED', booking_date__gte=today).count()
        completed_bookings_count = user_bookings.filter(
            Q(booking_status='COMPLETED') | (Q(booking_status='CONFIRMED') & Q(booking_date__lt=today))
        ).count()
        cancelled_bookings_count = user_bookings.filter(booking_status='CANCELLED').count()

        # Next upcoming reservation
        upcoming_reservation = user_bookings.filter(
            booking_status='CONFIRMED',
            booking_date__gte=today
        ).select_related('seat', 'slot').order_by('booking_date', 'slot__start_time').first()

        # Recent 5 bookings
        recent_bookings = user_bookings.select_related('seat', 'slot').order_by('-created_at')[:5]

        # Library overall seat count
        total_seats = Seat.objects.filter(is_active=True).count()
        maintenance_seats = Seat.objects.filter(is_under_maintenance=True).count()

        return {
            'overview': {
                'total_bookings': total_bookings,
                'active_bookings': active_bookings_count,
                'completed_bookings': completed_bookings_count,
                'cancelled_bookings': cancelled_bookings_count,
            },
            'upcoming_booking': BookingReadSerializer(upcoming_reservation).data if upcoming_reservation else None,
            'recent_bookings': BookingReadSerializer(recent_bookings, many=True).data,
            'library_summary': {
                'total_operational_seats': total_seats - maintenance_seats,
                'under_maintenance': maintenance_seats,
            }
        }

    @staticmethod
    def get_admin_dashboard_stats():
        """
        Gathers high-level operational statistics for the administrator overview.
        """
        today = date.today()

        # User metrics
        total_users = User.objects.count()
        total_students = User.objects.filter(role='STUDENT').count()
        total_admins = User.objects.filter(role='ADMIN').count()
        active_users = User.objects.filter(account_status='ACTIVE').count()

        # Seat metrics
        total_seats = Seat.objects.count()
        active_seats = Seat.objects.filter(is_active=True, is_under_maintenance=False).count()
        maintenance_seats = Seat.objects.filter(is_under_maintenance=True).count()

        # Booking metrics
        total_bookings = Booking.objects.count()
        today_bookings_qs = Booking.objects.filter(booking_date=today)
        today_confirmed = today_bookings_qs.filter(booking_status='CONFIRMED').count()
        today_cancelled = today_bookings_qs.filter(booking_status='CANCELLED').count()
        all_cancelled = Booking.objects.filter(booking_status='CANCELLED').count()

        # Today's seat utilization rate
        total_capacity_today = active_seats * TimeSlot.objects.filter(is_active=True).count()
        utilization_rate = round((today_confirmed / total_capacity_today * 100), 1) if total_capacity_today > 0 else 0

        # Recent today reservations
        recent_today_bookings = today_bookings_qs.select_related('seat', 'slot', 'user').order_by('-created_at')[:10]

        return {
            'users': {
                'total': total_users,
                'students': total_students,
                'admins': total_admins,
                'active': active_users,
            },
            'seats': {
                'total': total_seats,
                'operational': active_seats,
                'maintenance': maintenance_seats,
            },
            'bookings': {
                'total_all_time': total_bookings,
                'today_confirmed': today_confirmed,
                'today_cancelled': today_cancelled,
                'total_cancelled': all_cancelled,
                'today_utilization_percent': utilization_rate,
            },
            'today_reservations': BookingReadSerializer(recent_today_bookings, many=True).data
        }

    @staticmethod
    def get_admin_reports():
        """
        Generates structured analytical reports covering daily trends and seat utilization.
        """
        today = date.today()
        past_14_days = [today - timedelta(days=i) for i in range(13, -1, -1)]

        # Daily reservations trend (last 14 days)
        daily_trends = []
        for day in past_14_days:
            day_str = day.strftime('%Y-%m-%d')
            confirmed = Booking.objects.filter(booking_date=day, booking_status='CONFIRMED').count()
            cancelled = Booking.objects.filter(booking_date=day, booking_status='CANCELLED').count()
            daily_trends.append({
                'date': day_str,
                'day_name': day.strftime('%a'),
                'confirmed': confirmed,
                'cancelled': cancelled,
                'total': confirmed + cancelled
            })

        # Utilization breakdown by Floor
        floor_distribution = Seat.objects.values('floor').annotate(
            total_seats=Count('id')
        ).order_by('floor')

        floor_report = []
        for f in floor_distribution:
            floor_name = f['floor']
            total = f['total_seats']
            # Bookings on this floor today
            floor_today = Booking.objects.filter(
                booking_date=today,
                seat__floor=floor_name,
                booking_status='CONFIRMED'
            ).count()
            floor_report.append({
                'floor': floor_name,
                'total_seats': total,
                'today_bookings': floor_today
            })

        # Breakdown by Seat Type
        type_distribution = Seat.objects.values('seat_type').annotate(
            count=Count('id')
        ).order_by('seat_type')

        return {
            'daily_trends': daily_trends,
            'floor_report': floor_report,
            'type_distribution': list(type_distribution),
        }
