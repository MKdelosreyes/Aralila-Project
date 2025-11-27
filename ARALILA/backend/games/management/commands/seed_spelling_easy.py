from django.core.management.base import BaseCommand
from games.models import Game, Area, GameItem, SpellingItem

class Command(BaseCommand):
    help = 'Seed 10 easy spelling items for Palaruan (Playground)'

    def handle(self, *args, **options):
        # Get the game and area
        game = Game.objects.get(game_type='spelling-challenge')
        area = Area.objects.get(name='Palaruan')  # or id=1
        
        # Delete existing items for this area/game/difficulty (optional - for clean slate)
        GameItem.objects.filter(game=game, area=area, difficulty=1).delete()
        
        # Easy words (3-5 letters, common playground/basic words)
        easy_words = [
            {
                'word': 'BOLA',
                'sentence': 'Naglalaro kami ng _____ sa palaruan.',
                'order': 0
            },
            {
                'word': 'LARO',
                'sentence': 'Ang _____ ay masaya.',
                'order': 1
            },
            {
                'word': 'TAWA',
                'sentence': 'Ang _____ ng mga bata ay malakas.',
                'order': 2
            },
            {
                'word': 'TAKBO',
                'sentence': 'Mabilis ang _____ ng aso.',
                'order': 3
            },
            {
                'word': 'BUKAS',
                'sentence': 'Babalik ako _____ sa paaralan.',
                'order': 4
            },
            {
                'word': 'DAMIT',
                'sentence': 'Malinis ang _____ ko ngayon.',
                'order': 5
            },
            {
                'word': 'GAMIT',
                'sentence': 'Ito ang _____ ko sa pag-aaral.',
                'order': 6
            },
            {
                'word': 'TAHANAN',
                'sentence': 'Ang _____ ko ay masaya.',
                'order': 7
            },
            {
                'word': 'KAIBIGAN',
                'sentence': 'Ang _____ ko ay mabait.',
                'order': 8
            },
            {
                'word': 'DILIM',
                'sentence': 'May _____ sa loob ng kuweba.',
                'order': 9
            },
        ]
        
        # Create the items
        for data in easy_words:
            # Create GameItem
            item = GameItem.objects.create(
                game=game,
                area=area,
                difficulty=1,
                order_index=data['order']
            )
            
            # Create SpellingItem linked to GameItem
            SpellingItem.objects.create(
                item=item,
                word=data['word'],
                sentence=data['sentence']
            )
            
            self.stdout.write(
                self.style.SUCCESS(f"✓ Created: {data['word']} (Order {data['order']})")
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'\n✅ Successfully created 10 easy spelling items for Palaruan!')
        )