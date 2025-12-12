from django.core.management.base import BaseCommand
from games.models import Area, AssessmentLesson, AssessmentChallenge, AssessmentChallengeOption

class Command(BaseCommand):
    help = 'Seeds assessment data for Playground area based on games vocabulary'

    def handle(self, *args, **kwargs):
        # Get or create Playground area
        playground, created = Area.objects.get_or_create(
            order_index=0,
            defaults={
                'name': 'Playground',
                'description':  'Learn basic Filipino words through play! ',
                'is_active': True
            }
        )

        # Clear existing assessment data
        AssessmentLesson. objects.filter(area=playground).delete()

        # Create Assessment Lesson
        assessment = AssessmentLesson.objects.create(
            area=playground,
            title="Playground Assessment",
            order_index=999
        )

        # Assessment data based on games_spellingitem.csv
        challenges_data = [
            # ========== SELECT (2 items) ==========
            {
                'type': 'SELECT',
                'question':  'Ano ang tawag sa larong may guhit sa semento na tatalunan gamit ang pamato? ',
                'options': [
                    {'text': 'PIKO', 'correct': True},
                    {'text': 'PATINTERO', 'correct': False},
                    {'text': 'TAGUAN', 'correct': False},
                    {'text': 'HABULAN', 'correct': False},
                ]
            },
            {
                'type': 'SELECT',
                'question': 'Ano ang tawag sa laruan na pinapalipad sa hangin gamit ang tali?',
                'options': [
                    {'text': 'SARANGGOLA', 'correct': True},
                    {'text': 'YOYO', 'correct': False},
                    {'text': 'TURUMPO', 'correct': False},
                    {'text': 'BOLA', 'correct': False},
                ]
            },
            
            # ========== ASSIST (2 items) ==========
            {
                'type': 'ASSIST',
                'question':  'Gawaing pampalipas-oras na may tuntunin at layuning maglibang',
                'options': [
                    {'text': 'LARO', 'correct': True},
                    {'text': 'PAHINGA', 'correct': False},
                    {'text': 'LARUAN', 'correct': False},
                ]
            },
            {
                'type': 'ASSIST',
                'question': 'Ang taong humahabol o nagbabantay sa laro',
                'options': [
                    {'text': 'TAYA', 'correct': True},
                    {'text': 'KALARO', 'correct': False},
                    {'text': 'KALABAN', 'correct': False},
                ]
            },
            
            # ========== SPELL (5 items) ==========
            {
                'type': 'SPELL',
                'question': 'I-type ang salitang tumutukoy sa:  "Bilog na laruan na ipinapasa, ipinapalo, o ipinapatalbog"',
                'image_prompt': '/images/bola.png',
                'correct_answer':  'BOLA',
                'options': []
            },
            {
                'type': 'SPELL',
                'question': 'I-type ang salitang tumutukoy sa: "Laruan na iniikot sa sahig gamit ang lubid o daliri"',
                'image_prompt': '/images/turumpo.png',
                'correct_answer': 'TURUMPO',
                'options':  []
            },
            {
                'type': 'SPELL',
                'question': 'I-type ang salitang tumutukoy sa: "Mahabang tali na ginagamit sa paglukso o paghila"',
                'image_prompt': '/images/lubid.png',
                'correct_answer': 'LUBID',
                'options': []
            },
            {
                'type': 'SPELL',
                'question': 'I-type ang salitang tumutukoy sa: "Upuang nakasabit na inuugoy pabalik-balik"',
                'image_prompt': '/images/duyan.png',
                'correct_answer': 'DUYAN',
                'options': []
            },
            {
                'type': 'SPELL',
                'question': 'I-type ang salitang tumutukoy sa: "Laruan na umaakyat-baba sa tali habang umiikot"',
                'image_prompt': '/images/yoyo.png',
                'correct_answer': 'YOYO',
                'options':  []
            },
            
            # ========== PUNCTUATE (5 items) ==========
            {
                'type': 'PUNCTUATE',
                'question': 'Tara maglaro tayo sa palaruan',
                # Tara , maglaro tayo sa palaruan ! 
                # 0=Tara, 1=maglaro, 2=tayo, 3=sa, 4=palaruan
                'options': [
                    {'text': ',', 'correct': True, 'order_position': 0},  # After "Tara"
                    {'text': '!', 'correct': True, 'order_position': 4},  # End
                ]
            },
            {
                'type': 'PUNCTUATE',
                'question': 'Sino ang taya sa laro Ikaw ba o ako',
                # Sino ang taya sa laro ?  Ikaw ba o ako ? 
                # 0=Sino, 1=ang, 2=taya, 3=sa, 4=laro, 5=Ikaw, 6=ba, 7=o, 8=ako
                'options': [
                    {'text': '?', 'correct': True, 'order_position': 4},  # After "laro"
                    {'text':  '?', 'correct': True, 'order_position': 8},  # End
                ]
            },
            {
                'type': 'PUNCTUATE',
                'question': 'Wow Ang taas ng lipad ng saranggola mo',
                # Wow !  Ang taas ng lipad ng saranggola mo !
                # 0=Wow, 1=Ang, 2=taas, 3=ng, 4=lipad, 5=ng, 6=saranggola, 7=mo
                'options': [
                    {'text': '!', 'correct': True, 'order_position': 0},  # After "Wow"
                    {'text': '!', 'correct': True, 'order_position': 7},  # End
                ]
            },
            {
                'type': 'PUNCTUATE',
                'question': 'Maglaro tayo ng patintero Pumili na ng kakampi',
                # Maglaro tayo ng patintero .  Pumili na ng kakampi . 
                # 0=Maglaro, 1=tayo, 2=ng, 3=patintero, 4=Pumili, 5=na, 6=ng, 7=kakampi
                'options': [
                    {'text':  '.', 'correct': True, 'order_position': 3},  # After "patintero"
                    {'text': '.', 'correct': True, 'order_position': 7},  # End
                ]
            },
            {
                'type': 'PUNCTUATE',
                'question': 'Nasaan ang bola Kailangan natin yan sa laro',
                # Nasaan ang bola ? Kailangan natin yan sa laro . 
                # 0=Nasaan, 1=ang, 2=bola, 3=Kailangan, 4=natin, 5=yan, 6=sa, 7=laro
                'options': [
                    {'text': '?', 'correct': True, 'order_position': 2},  # After "bola"
                    {'text': '.', 'correct': True, 'order_position': 7},  # End
                ]
            },
            
            # ========== ARRANGE (5 items) ==========
            {
                'type': 'ARRANGE',
                'question': 'Arrange:  "The children are playing in the playground"',
                'correct_answer': 'Naglalaro ang mga bata sa palaruan',
                'options': [
                    {'text': 'Naglalaro', 'correct': True, 'order_position': 1},
                    {'text': 'ang', 'correct': True, 'order_position': 2},
                    {'text': 'mga', 'correct':  True, 'order_position':  3},
                    {'text': 'bata', 'correct': True, 'order_position': 4},
                    {'text': 'sa', 'correct': True, 'order_position': 5},
                    {'text': 'palaruan', 'correct': True, 'order_position': 6},
                ]
            },
            {
                'type': 'ARRANGE',
                'question': 'Arrange: "I will throw the ball to my playmate"',
                'correct_answer': 'Ihahagis ko ang bola sa kalaro ko',
                'options': [
                    {'text': 'Ihahagis', 'correct': True, 'order_position': 1},
                    {'text': 'ko', 'correct': True, 'order_position': 2},
                    {'text': 'ang', 'correct': True, 'order_position': 3},
                    {'text': 'bola', 'correct': True, 'order_position': 4},
                    {'text': 'sa', 'correct': True, 'order_position': 5},
                    {'text': 'aking', 'correct':  True, 'order_position':  6},
                    {'text': 'kalaro', 'correct': True, 'order_position': 7},
                ]
            },
            {
                'type': 'ARRANGE',
                'question': 'Arrange: "The kite is flying high in the sky"',
                'correct_answer': 'Mataas na lumilipad ang saranggola sa langit',
                'options': [
                    {'text': 'Mataas', 'correct': True, 'order_position': 1},
                    {'text': 'na', 'correct': True, 'order_position': 2},
                    {'text': 'lumilipad', 'correct': True, 'order_position': 3},
                    {'text': 'ang', 'correct': True, 'order_position': 4},
                    {'text': 'saranggola', 'correct': True, 'order_position': 5},
                    {'text': 'sa', 'correct': True, 'order_position': 6},
                    {'text': 'langit', 'correct': True, 'order_position': 7},
                ]
            },
            {
                'type': 'ARRANGE',
                'question':  'Arrange: "We need speed and agility in this game"',
                'correct_answer': 'Kailangan natin ng bilis at liksi sa larong ito',
                'options': [
                    {'text': 'Kailangan', 'correct': True, 'order_position': 1},
                    {'text': 'natin', 'correct': True, 'order_position': 2},
                    {'text': 'ng', 'correct': True, 'order_position': 3},
                    {'text': 'bilis', 'correct': True, 'order_position': 4},
                    {'text': 'at', 'correct': True, 'order_position': 5},
                    {'text': 'liksi', 'correct': True, 'order_position': 6},
                    {'text': 'sa', 'correct': True, 'order_position': 7},
                    {'text': 'larong', 'correct': True, 'order_position': 8},
                    {'text': 'ito', 'correct': True, 'order_position': 9},
                ]
            },
            {
                'type': 'ARRANGE',
                'question': 'Arrange: "My team won the game"',
                'correct_answer': 'Nanalo ang pangkat ko sa laro',
                'options': [
                    {'text': 'Nanalo', 'correct':  True, 'order_position':  1},
                    {'text': 'ang', 'correct': True, 'order_position': 2},
                    {'text': 'pangkat', 'correct': True, 'order_position': 3},
                    {'text': 'ko', 'correct': True, 'order_position': 4},
                    {'text': 'sa', 'correct':  True, 'order_position':  5},
                    {'text': 'laro', 'correct': True, 'order_position': 6},
                ]
            },
            
            # ========== COMPOSE (3 items) ==========
            {
                'type': 'COMPOSE',
                'question': '👦👧 🏃 ⚽ 😊',
                'correct_answer': 'bata takbo bola masaya laro',  # Keywords: children running ball happy play
                'options': []
            },
            {
                'type': 'COMPOSE',
                'question': '🪁 ☁️ 🌤️ 📏',
                'correct_answer':  'saranggola langit lipad tali mataas',  # Keywords: kite sky fly string high
                'options': []
            },
            {
                'type': 'COMPOSE',
                'question': '🏆 👥 💪 🎉',
                'correct_answer':  'panalo pangkat lakas gantimpala saya',  # Keywords: win team strength reward celebration
                'options': []
            },
            
            # ========== TAG_POS (3 items) ==========
            {
                'type': 'TAG_POS',
                'question':  'Mabilis na tumakbo ang kalaro ko',
                'options': [
                    # Words to tag
                    {'text': 'Mabilis', 'correct': True, 'word_index': 0, 'pos_tag': 'Pang-uri', 'order_position': 0},
                    {'text': 'tumakbo', 'correct': True, 'word_index': 1, 'pos_tag':  'Pandiwa', 'order_position': 1},
                    
                    # POS options
                    {'text': 'Pang-uri', 'correct': True, 'order_position': 100},
                    {'text': 'Pandiwa', 'correct': True, 'order_position': 101},
                    {'text': 'Pangngalan', 'correct': False, 'order_position': 102},
                    {'text':  'Pang-abay', 'correct': False, 'order_position': 103},
                ]
            },
            {
                'type': 'TAG_POS',
                'question': 'Sila ay naglalaro ng patintero sa palaruan',
                'options': [
                    # Words to tag
                    {'text': 'Sila', 'correct': True, 'word_index': 0, 'pos_tag': 'Panghalip', 'order_position': 0},
                    {'text':  'naglalaro', 'correct':  True, 'word_index':  1, 'pos_tag': 'Pandiwa', 'order_position': 1},
                    
                    # POS options
                    {'text': 'Panghalip', 'correct': True, 'order_position': 100},
                    {'text': 'Pandiwa', 'correct':  True, 'order_position':  101},
                    {'text': 'Pangngalan', 'correct': False, 'order_position': 102},
                    {'text': 'Pang-uri', 'correct': False, 'order_position': 103},
                ]
            },
            {
                'type': 'TAG_POS',
                'question': 'Matapang na lumukso ang bata sa guhit',
                'options': [
                    # Words to tag
                    {'text': 'Matapang', 'correct':  True, 'word_index':  0, 'pos_tag': 'Pang-uri', 'order_position': 0},
                    {'text':  'lumukso', 'correct': True, 'word_index': 1, 'pos_tag': 'Pandiwa', 'order_position':  1},
                    
                    # POS options
                    {'text': 'Pang-uri', 'correct': True, 'order_position': 100},
                    {'text':  'Pandiwa', 'correct': True, 'order_position': 101},
                    {'text': 'Pangngalan', 'correct': False, 'order_position': 102},
                    {'text':  'Panghalip', 'correct': False, 'order_position': 103},
                ]
            },
        ]

        # Create challenges
        for idx, challenge_data in enumerate(challenges_data, start=1):
            challenge = AssessmentChallenge. objects.create(
                lesson=assessment,
                type=challenge_data['type'],
                question=challenge_data['question'],
                order_index=idx,
                correct_answer=challenge_data. get('correct_answer'),
                image_prompt=challenge_data.get('image_prompt')
            )

            # Create options (if any)
            for option_data in challenge_data. get('options', []):
                AssessmentChallengeOption.objects.create(
                    challenge=challenge,
                    text=option_data['text'],
                    correct=option_data. get('correct', False),
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
        self.stdout. write(f'   Lesson:  {assessment.title}')
        self.stdout. write(f'   SELECT: 2')
        self.stdout.write(f'   ASSIST: 2')
        self.stdout.write(f'   SPELL: 5')
        self.stdout.write(f'   PUNCTUATE: 5')
        self.stdout.write(f'   ARRANGE: 5')
        self.stdout.write(f'   COMPOSE: 3')
        self.stdout.write(f'   TAG_POS: 3')
        self.stdout.write(f'   Total: {len(challenges_data)} challenges')