from django.core.management.base import BaseCommand
from django.core.mail import send_mail

class Command(BaseCommand):
    help = 'Test email sending'

    def handle(self, *args, **kwargs):
        try:
            send_mail(
                subject='Test Email from Aralila',
                message='This is a test message. If you receive this, email is working!',
                from_email='noreply@aralila.com',
                recipient_list=['aralila.team@gmail.com'],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS('✅ Email sent successfully!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Email failed: {str(e)}'))