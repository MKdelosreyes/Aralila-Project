from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from .models import CustomUser
from .serializers import CustomUserSerializer
from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
import traceback

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            print("📥 Received registration data:", request.data)
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            print("✅ Serializer valid, creating user...")
            user = serializer.save()
            
            print(f"✅ User created: {user.email}")
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            response_data = {
                'user': CustomUserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }
            
            print("✅ Returning response:", response_data)
            return Response(response_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print("❌ Registration error:", str(e))
            print(traceback.format_exc())
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        school_name = request.data.get('school_name', '')

        print(f"📧 Attempting to register: {email}")

        # Check if user already exists - using CustomUser
        if CustomUser.objects.filter(email=email).exists():
            return Response(
                {'error': 'User with this email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user (inactive until verified) - using CustomUser
        user = CustomUser.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            school_name=school_name,
            is_active=False  # User must verify email first
        )
        print(f"✅ User created: {user.email}")

        # Generate verification token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Create verification link
        verification_link = f"{settings.FRONTEND_URL}/verify-email?uid={uid}&token={token}"
        
        print(f"🔗 Verification link: {verification_link}")
        print(f"📧 Sending email from: {settings.DEFAULT_FROM_EMAIL}")
        print(f"📧 Sending email to: {email}")
        print(f"📧 Using SMTP: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
        print(f"📧 Email user: {settings.EMAIL_HOST_USER}")

        # Send verification email
        try:
            result = send_mail(
                subject='Verify your Aralila account',
                message=f'''
Hello {first_name},

Welcome to Aralila! Please verify your email address by clicking the link below:

{verification_link}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

Best regards,
The Aralila Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            print(f"✅ Email sent successfully! Result: {result}")
        except Exception as email_error:
            print(f"❌ Email sending failed: {str(email_error)}")
            print(traceback.format_exc())
            # Still return success but log the error
            # In production, you might want to handle this differently

        return Response({
            'message': 'Registration successful! Please check your email to verify your account.',
            'email': email
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"❌ Registration error: {str(e)}")
        print(traceback.format_exc())
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    try:
        uid = request.data.get('uid')
        token = request.data.get('token')

        # Decode user ID - using CustomUser
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response(
                {'error': 'Invalid verification link'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify token
        if not default_token_generator.check_token(user, token):
            return Response(
                {'error': 'Invalid or expired verification link'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Activate user
        user.is_active = True
        user.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Email verified successfully!',
            'user': CustomUserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification(request):
    try:
        email = request.data.get('email')

        # Using CustomUser
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if user.is_active:
            return Response(
                {'error': 'Email already verified'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate new token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Create verification link
        verification_link = f"{settings.FRONTEND_URL}/verify-email?uid={uid}&token={token}"

        # Send verification email
        send_mail(
            subject='Verify your Aralila account',
            message=f'''
            Hello {user.first_name},

            Here's your new verification link:

            {verification_link}

            This link will expire in 24 hours.

            Best regards,
            The Aralila Team
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({
            'message': 'Verification email sent! Please check your inbox.',
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User login endpoint."""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'error': 'Email and password are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user exists first
    try:
        user = CustomUser.objects.get(email=email)
        if not user.is_active:
            return Response(
                {'error': 'Please verify your email before logging in. Check your inbox for the verification link.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
    except CustomUser.DoesNotExist:
        pass  # Continue to authenticate to avoid revealing if email exists
    
    # Authenticate using email
    user = authenticate(request, username=email, password=password)
    
    if user is None:
        return Response(
            {'error': 'Invalid email or password'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Double-check active status
    if not user.is_active:
        return Response(
            {'error': 'Please verify your email before logging in'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'user': CustomUserSerializer(user).data,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Get current user profile."""
    serializer = CustomUserSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    """Update user profile."""
    serializer = CustomUserSerializer(
        request.user, 
        data=request.data, 
        partial=True
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)