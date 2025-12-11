import os
import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import CustomUser
from datetime import date, timedelta

class SupabaseAuthentication(BaseAuthentication):

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]

        try:
            payload = jwt.decode(
                token,
                os.getenv('SUPABASE_JWT_SECRET'),
                algorithms=['HS256'],
                audience='authenticated',
                leeway=300
            )
            
            user_id = payload.get('sub')
            email = payload.get('email')
            user_metadata = payload.get('user_metadata', {})

            user, created = CustomUser.objects.get_or_create(
                supabase_user_id=user_id,
                defaults={
                    'email': email,
                    'first_name': user_metadata.get('first_name', ''),
                    'last_name': user_metadata.get('last_name', ''),
                    'school_name': user_metadata.get('school_name', ''),
                }
            )

            # ---- UPDATE NAME INFO IF CHANGED ----
            if not created:
                updated = False
                if user.email != email:
                    user.email = email
                    updated = True
                if user.first_name != user_metadata.get('first_name', ''):
                    user.first_name = user_metadata.get('first_name', '')
                    updated = True
                if user.last_name != user_metadata.get('last_name', ''):
                    user.last_name = user_metadata.get('last_name', '')
                    updated = True
                
                if updated:
                    user.save()

            # ---- LOGIN STREAK LOGIC ----
            today = date.today()
            new_streak = False

            if user.last_login_date is None:
                # First login ever
                user.ls_points = 1
                new_streak = True
            else:
                # Check streak
                if user.last_login_date == today - timedelta(days=1):
                    # Consecutive day → +1 point
                    user.ls_points += 1
                    new_streak = True
                elif user.last_login_date == today:
                    # Same-day login → do nothing
                    new_streak = False
                else:
                    # Missed a day → reset streak
                    user.ls_points = 1
                    new_streak = True

            # Update login date
            user.last_login_date = today

            # ---- COLLECT BADGES BASED ON LOGIN STREAK ----
            badges_by_streak = {
                3: "1",
                5: "2",
                30: "3",
                100: "4",
                200: "5",
            }

            if new_streak:
                # Ensure collected_badges is a list of dicts
                if not user.collected_badges:
                    user.collected_badges = []

                # Convert old list of badge IDs to dict format if needed
                for i, b in enumerate(user.collected_badges):
                    if isinstance(b, str):
                        user.collected_badges[i] = {"id": b, "status": "unclaimed"}

                existing_badge_ids = [b["id"] for b in user.collected_badges]

                for streak, badge_id in badges_by_streak.items():
                    if user.ls_points >= streak and badge_id not in existing_badge_ids:
                        user.collected_badges.append({"id": badge_id, "status": "unclaimed"})
            user.save()


            # ---- RETURN USER ----
            return (user, None)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
        except Exception as e:
<<<<<<< HEAD
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')
=======
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')
>>>>>>> origin/sullano
