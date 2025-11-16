from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from users.models import CustomUser

class Command(BaseCommand):
    help = 'Delete unverified users older than 24 hours'

    def handle(self, *args, **kwargs):
        cutoff_date = timezone.now() - timedelta(hours=24)
        
        deleted_count = CustomUser.objects.filter(
            is_active=False,
            date_joined__lt=cutoff_date
        ).delete()[0]
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Deleted {deleted_count} unverified users')
        )