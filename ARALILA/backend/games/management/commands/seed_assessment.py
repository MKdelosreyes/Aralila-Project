from django.core.management.base import BaseCommand
from games.models import Area, AssessmentLesson, AssessmentChallenge, AssessmentChallengeOption

class Command(BaseCommand):
    help = 'Seeds assessment data for Playground area'

    def handle(self, *args, **kwargs):
        # Get or create Playground area
        playground, created = Area.objects.get_or_create(
            order_index=0,
            defaults={
                'name': 'Playground',
                'description': 'Learn basic Filipino words through play!',
                'is_active': True
            }
        )

        # Clear existing assessment data
        AssessmentLesson.objects.filter(area=playground).delete()

        # Create Assessment Lesson
        assessment = AssessmentLesson.objects.create(
            area=playground,
            title="Playground Assessment",
            order_index=999
        )

        # Assessment data
        challenges_data = [
            {
                'type': 'SELECT',
                'question': 'What does "Kumusta ka?" mean in English?',
                'options': [
                    {'text': 'How are you?', 'correct': True},
                    {'text': 'Good morning', 'correct': False},
                    {'text': 'Thank you', 'correct': False},
                    {'text': 'See you later', 'correct': False},
                ]
            },
            {
                'type': 'ASSIST',
                'question': 'Hello',
                'options': [
                    {'text': 'Kumusta', 'correct': True},
                    {'text': 'Salamat', 'correct': False},
                    {'text': 'Paalam', 'correct': False},
                ]
            },
            {
                'type': 'SELECT',
                'question': 'What is the Filipino word for "Red"?',
                'options': [
                    {'text': 'Pula', 'correct': True},
                    {'text': 'Asul', 'correct': False},
                    {'text': 'Dilaw', 'correct': False},
                    {'text': 'Berde', 'correct': False},
                ]
            },
            {
                'type': 'ASSIST',
                'question': 'Ball',
                'options': [
                    {'text': 'Bola', 'correct': True},
                    {'text': 'Laruan', 'correct': False},
                    {'text': 'Tao', 'correct': False},
                ]
            },
            {
                'type': 'SELECT',
                'question': 'How do you say "Five" in Filipino?',
                'options': [
                    {'text': 'Lima', 'correct': True},
                    {'text': 'Apat', 'correct': False},
                    {'text': 'Anim', 'correct': False},
                    {'text': 'Tatlo', 'correct': False},
                ]
            },
            {
                'type': 'ASSIST',
                'question': 'Friend',
                'options': [
                    {'text': 'Kaibigan', 'correct': True},
                    {'text': 'Pamilya', 'correct': False},
                    {'text': 'Guro', 'correct': False},
                ]
            },
            {
                'type': 'SELECT',
                'question': 'What does "Salamat" mean?',
                'options': [
                    {'text': 'Thank you', 'correct': True},
                    {'text': 'Hello', 'correct': False},
                    {'text': 'Goodbye', 'correct': False},
                    {'text': 'Please', 'correct': False},
                ]
            },
            {
                'type': 'ASSIST',
                'question': 'To play',
                'options': [
                    {'text': 'Maglaro', 'correct': True},
                    {'text': 'Kumain', 'correct': False},
                    {'text': 'Tulog', 'correct': False},
                ]
            },
            {
                'type': 'SELECT',
                'question': 'What is "Dog" in Filipino?',
                'options': [
                    {'text': 'Aso', 'correct': True},
                    {'text': 'Pusa', 'correct': False},
                    {'text': 'Ibon', 'correct': False},
                    {'text': 'Isda', 'correct': False},
                ]
            },
            {
                'type': 'ASSIST',
                'question': 'Happy',
                'options': [
                    {'text': 'Masaya', 'correct': True},
                    {'text': 'Malungkot', 'correct': False},
                    {'text': 'Galit', 'correct': False},
                ]
            },
            {
                'type': 'SELECT',
                'question': 'What does "Magandang umaga" mean?',
                'options': [
                    {'text': 'Good morning', 'correct': True},
                    {'text': 'Good night', 'correct': False},
                    {'text': 'Good afternoon', 'correct': False},
                    {'text': 'Good evening', 'correct': False},
                ]
            },
            {
                'type': 'ASSIST',
                'question': 'Slide',
                'options': [
                    {'text': 'Dulo-duluhan', 'correct': True},
                    {'text': 'Duyan', 'correct': False},
                    {'text': 'Hagdan', 'correct': False},
                ]
            },
            {
                'type': 'SELECT',
                'question': 'How do you say "One" in Filipino?',
                'options': [
                    {'text': 'Isa', 'correct': True},
                    {'text': 'Dalawa', 'correct': False},
                    {'text': 'Tatlo', 'correct': False},
                    {'text': 'Apat', 'correct': False},
                ]
            },
            {
                'type': 'ASSIST',
                'question': 'Swing',
                'options': [
                    {'text': 'Duyan', 'correct': True},
                    {'text': 'Dulo-duluhan', 'correct': False},
                    {'text': 'Bola', 'correct': False},
                ]
            },
            {
                'type': 'SELECT',
                'question': 'What is "Yellow" in Filipino?',
                'options': [
                    {'text': 'Dilaw', 'correct': True},
                    {'text': 'Pula', 'correct': False},
                    {'text': 'Asul', 'correct': False},
                    {'text': 'Berde', 'correct': False},
                ]
            },
        ]

        # Create challenges
        for idx, challenge_data in enumerate(challenges_data, start=1):
            challenge = AssessmentChallenge.objects.create(
                lesson=assessment,
                type=challenge_data['type'],
                question=challenge_data['question'],
                order_index=idx
            )

            # Create options
            for option_data in challenge_data['options']:
                AssessmentChallengeOption.objects.create(
                    challenge=challenge,
                    text=option_data['text'],
                    correct=option_data['correct']
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Successfully created assessment with {len(challenges_data)} challenges!'
            )
        )
        self.stdout.write(f'   Area: {playground.name}')
        self.stdout.write(f'   Lesson: {assessment.title}')