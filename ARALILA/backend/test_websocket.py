from django.core.mail import send_mail

send_mail(
    'Test Email',
    'This is a test message.',
    'noreply@aralila.com',
    ['aralila-team@gmail.com'],
    fail_silently=False,
)