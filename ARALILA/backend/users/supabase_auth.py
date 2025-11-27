import os
import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import CustomUser

class SupabaseAuthentication(BaseAuthentication):
    """
    Authenticate requests using Supabase JWT tokens.
    Creates/updates Django CustomUser on successful auth.
    """
    
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]

        print(f"🔍 Attempting to decode token: {token[:50]}...")
        print(f"🔍 Using JWT secret: {os.getenv('SUPABASE_JWT_SECRET')[:20]}...")
        
        try:
            payload = jwt.decode(
                token,
                os.getenv('SUPABASE_JWT_SECRET'),
                algorithms=['HS256'],
                audience='authenticated',
                leeway=300  # Allow 5 minutes clock difference
            )
            
            # Extract user info
            user_id = payload.get('sub')
            email = payload.get('email')
            user_metadata = payload.get('user_metadata', {})
            
            print(f"✅ Authenticated user: {email} (ID: {user_id})")
            
            # Get or create Django user
            user, created = CustomUser.objects.get_or_create(
                supabase_user_id=user_id,
                defaults={
                    'email': email,
                    'first_name': user_metadata.get('first_name', ''),
                    'last_name': user_metadata.get('last_name', ''),
                    'school_name': user_metadata.get('school_name', ''),
                }
            )
            
            if created:
                print(f"✅ Created new Django user for {email}")
            
            # Update user info if changed (except profile_pic and school_name)
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
                    print(f"✅ Updated user info for {email}")
            
            print(f"🔑 Returning user instance: {user} (type: {type(user)})")
            return (user, None)
            
        except jwt.ExpiredSignatureError:
            print("❌ SupabaseAuthentication: token expired")
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError as e:
            print(f"❌ SupabaseAuthentication: invalid token: {e}")
            raise AuthenticationFailed('Invalid token')
        except Exception as e:
            print(f"❌ Auth error: {str(e)}")
            import traceback
            traceback.print_exc()
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')