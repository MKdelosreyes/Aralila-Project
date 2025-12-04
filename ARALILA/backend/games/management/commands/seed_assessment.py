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
            # ========== SELECT (2 items) ==========
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
                'type': 'SELECT',
                'question': 'What is the Filipino word for "Red"?',
                'options': [
                    {'text': 'Pula', 'correct': True},
                    {'text': 'Asul', 'correct': False},
                    {'text': 'Dilaw', 'correct': False},
                    {'text': 'Berde', 'correct': False},
                ]
            },
            
            # ========== ASSIST (2 items) ==========
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
                'type': 'ASSIST',
                'question': 'Ball',
                'options': [
                    {'text': 'Bola', 'correct': True},
                    {'text': 'Laruan', 'correct': False},
                    {'text': 'Tao', 'correct': False},
                ]
            },
            
            # ========== SPELL (5 items) ==========
            {
                'type': 'SPELL',
                'question': 'Spell the word shown in the image',
                'image_prompt': '/images/dog.png',  # You'll replace with actual image path
                'correct_answer': 'Aso',
                'options': []  # No options needed for SPELL
            },
            {
                'type': 'SPELL',
                'question': 'Spell the word shown in the image',
                'image_prompt': '/images/cat.png',
                'correct_answer': 'Pusa',
                'options': []
            },
            {
                'type': 'SPELL',
                'question': 'Spell the word shown in the image',
                'image_prompt': '/images/house.png',
                'correct_answer': 'Bahay',
                'options': []
            },
            {
                'type': 'SPELL',
                'question': 'Spell the word shown in the image',
                'image_prompt': '/images/tree.png',
                'correct_answer': 'Puno',
                'options': []
            },
            {
                'type': 'SPELL',
                'question': 'Spell the word shown in the image',
                'image_prompt': '/images/water.png',
                'correct_answer': 'Tubig',
                'options': []
            },
            

            # ========== PUNCTUATE (5 items) ==========
            {
                'type': 'PUNCTUATE',
                'question': 'Kumusta ka Ano ang pangalan mo',
                # Kumusta ka ? Ano ang pangalan mo ?
                # word indices: 0=Kumusta, 1=ka, 2=Ano, 3=ang, 4=pangalan, 5=mo
                'options': [
                    {'text': '?', 'correct': True, 'order_position': 1},  # ✅ After word 1 (ka)
                    {'text': '?', 'correct': True, 'order_position': 5},  # ✅ After word 5 (mo) = end
                ]
            },
            {
                'type': 'PUNCTUATE',
                'question': 'Magandang umaga po Salamat sa tulong',
                # Magandang umaga po , Salamat sa tulong .
                # 0=Magandang, 1=umaga, 2=po, 3=Salamat, 4=sa, 5=tulong
                'options': [
                    {'text': ',', 'correct': True, 'order_position': 2},  # ✅ After "po"
                    {'text': '.', 'correct': True, 'order_position': 5},  # ✅ End
                ]
            },
            {
                'type': 'PUNCTUATE',
                'question': 'Wow Ang ganda ng laruan mo',
                # Wow ! Ang ganda ng laruan mo !
                # 0=Wow, 1=Ang, 2=ganda, 3=ng, 4=laruan, 5=mo
                'options': [
                    {'text': '!', 'correct': True, 'order_position': 0},   # ✅ After "Wow"
                    {'text': '!', 'correct': True, 'order_position': 5},  # ✅ End
                ]
            },
            {
                'type': 'PUNCTUATE',
                'question': 'Saan ka pupunta Gusto mo bang sumama',
                # Saan ka pupunta ? Gusto mo bang sumama ?
                # 0=Saan, 1=ka, 2=pupunta, 3=Gusto, 4=mo, 5=bang, 6=sumama
                'options': [
                    {'text': '?', 'correct': True, 'order_position': 2},  # ✅ After "pupunta"
                    {'text': '?', 'correct': True, 'order_position': 6},  # ✅ End
                ]
            },
            {
                'type': 'PUNCTUATE',
                'question': 'Maglaro tayo sa labas Tara na',
                # Maglaro tayo sa labas . Tara na !
                # 0=Maglaro, 1=tayo, 2=sa, 3=labas, 4=Tara, 5=na
                'options': [
                    {'text': '.', 'correct': True, 'order_position': 3},  # ✅ After "labas"
                    {'text': '!', 'correct': True, 'order_position': 5},  # ✅ End
                ]
            },

            
            # ========== ARRANGE (5 items) ==========
            {
                'type': 'ARRANGE',
                'question': 'Arrange: "I am happy"',
                'correct_answer': 'Ako ay masaya',
                'options': [
                    {'text': 'Ako', 'correct': True, 'order_position': 1},
                    {'text': 'ay', 'correct': True, 'order_position': 2},
                    {'text': 'masaya', 'correct': True, 'order_position': 3},
                ]
            },
            {
                'type': 'ARRANGE',
                'question': 'Arrange: "The dog is playing"',
                'correct_answer': 'Ang aso ay naglalaro',
                'options': [
                    {'text': 'Ang', 'correct': True, 'order_position': 1},
                    {'text': 'aso', 'correct': True, 'order_position': 2},
                    {'text': 'ay', 'correct': True, 'order_position': 3},
                    {'text': 'naglalaro', 'correct': True, 'order_position': 4},
                ]
            },
            {
                'type': 'ARRANGE',
                'question': 'Arrange: "I eat rice"',
                'correct_answer': 'Kumakain ako ng kanin',
                'options': [
                    {'text': 'Kumakain', 'correct': True, 'order_position': 1},
                    {'text': 'ako', 'correct': True, 'order_position': 2},
                    {'text': 'ng', 'correct': True, 'order_position': 3},
                    {'text': 'kanin', 'correct': True, 'order_position': 4},
                ]
            },
            {
                'type': 'ARRANGE',
                'question': 'Arrange: "My name is Maria"',
                'correct_answer': 'Ang pangalan ko ay Maria',
                'options': [
                    {'text': 'Ang', 'correct': True, 'order_position': 1},
                    {'text': 'pangalan', 'correct': True, 'order_position': 2},
                    {'text': 'ko', 'correct': True, 'order_position': 3},
                    {'text': 'ay', 'correct': True, 'order_position': 4},
                    {'text': 'Maria', 'correct': True, 'order_position': 5},
                ]
            },
            {
                'type': 'ARRANGE',
                'question': 'Arrange: "I go to school"',
                'correct_answer': 'Pumupunta ako sa paaralan',
                'options': [
                    {'text': 'Pumupunta', 'correct': True, 'order_position': 1},
                    {'text': 'ako', 'correct': True, 'order_position': 2},
                    {'text': 'sa', 'correct': True, 'order_position': 3},
                    {'text': 'paaralan', 'correct': True, 'order_position': 4},
                ]
            },
            
            # ========== COMPOSE (3 items) ==========
            {
                'type': 'COMPOSE',
                'question': 'Write a sentence using: 🌧️ 📚 ☕',
                'correct_answer': 'rain book coffee reading study',  # Keywords for validation
                'options': []
            },
            {
                'type': 'COMPOSE',
                'question': 'Write a sentence using: 👨‍👩‍👧‍👦 🏠 ❤️',
                'correct_answer': 'family home love happy together',
                'options': []
            },
            {
                'type': 'COMPOSE',
                'question': 'Write a sentence using: 🎮 👬 😊',
                'correct_answer': 'game play friends happy fun',
                'options': []
            },
            
            # ========== TAG_POS (3 items) ==========
            {
                'type': 'TAG_POS',
                'question': 'Naglalaro ang mga bata sa palaruan',
                'options': [
                    # ✅ Words to match - use word_index to identify them
                    {'text': 'Naglalaro', 'correct': True, 'word_index': 0, 'pos_tag': 'Pandiwa', 'order_position': 0},
                    {'text': 'bata', 'correct': True, 'word_index': 1, 'pos_tag': 'Pangngalan', 'order_position': 1},
                    
                    # ✅ POS options - NO word_index (this is the key difference)
                    {'text': 'Pandiwa', 'correct': True, 'order_position': 100},  # High order_position = POS option
                    {'text': 'Pangngalan', 'correct': True, 'order_position': 101},
                    {'text': 'Pang-uri', 'correct': False, 'order_position': 102},
                    {'text': 'Pang-abay', 'correct': False, 'order_position': 103},
                ]
            },
            {
                'type': 'TAG_POS',
                'question': 'Mabilis na tumakbo ang aso',
                'options': [
                    {'text': 'Mabilis', 'correct': True, 'word_index': 0, 'pos_tag': 'Pang-uri', 'order_position': 0},
                    {'text': 'tumakbo', 'correct': True, 'word_index': 1, 'pos_tag': 'Pandiwa', 'order_position': 1},
                    
                    {'text': 'Pang-uri', 'correct': True, 'order_position': 100},
                    {'text': 'Pandiwa', 'correct': True, 'order_position': 101},
                    {'text': 'Pangngalan', 'correct': False, 'order_position': 102},
                    {'text': 'Panghalip', 'correct': False, 'order_position': 103},
                ]
            },
            {
                'type': 'TAG_POS',
                'question': 'Siya ay masipag na estudyante',
                'options': [
                    {'text': 'Siya', 'correct': True, 'word_index': 0, 'pos_tag': 'Panghalip', 'order_position': 0},
                    {'text': 'masipag', 'correct': True, 'word_index': 1, 'pos_tag': 'Pang-uri', 'order_position': 1},
                    
                    {'text': 'Panghalip', 'correct': True, 'order_position': 100},
                    {'text': 'Pang-uri', 'correct': True, 'order_position': 101},
                    {'text': 'Pandiwa', 'correct': False, 'order_position': 102},
                    {'text': 'Pang-abay', 'correct': False, 'order_position': 103},
                ]
            },
        ]

        # Create challenges
        for idx, challenge_data in enumerate(challenges_data, start=1):
            challenge = AssessmentChallenge.objects.create(
                lesson=assessment,
                type=challenge_data['type'],
                question=challenge_data['question'],
                order_index=idx,
                correct_answer=challenge_data.get('correct_answer'),
                image_prompt=challenge_data.get('image_prompt')
            )

            # Create options (if any)
            for option_data in challenge_data.get('options', []):
                AssessmentChallengeOption.objects.create(
                    challenge=challenge,
                    text=option_data['text'],
                    correct=option_data.get('correct', False),
                    order_position=option_data.get('order_position'),
                    word_index=option_data.get('word_index'),
                    pos_tag=option_data.get('pos_tag')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Successfully created assessment with {len(challenges_data)} challenges!'
            )
        )
        self.stdout.write(f'   Area: {playground.name}')
        self.stdout.write(f'   Lesson: {assessment.title}')
        self.stdout.write(f'   SELECT: 2')
        self.stdout.write(f'   ASSIST: 2')
        self.stdout.write(f'   SPELL: 5')
        self.stdout.write(f'   PUNCTUATE: 5')
        self.stdout.write(f'   ARRANGE: 5')
        self.stdout.write(f'   COMPOSE: 3')
        self.stdout.write(f'   TAG_POS: 3')
        self.stdout.write(f'   Total: {len(challenges_data)} challenges')