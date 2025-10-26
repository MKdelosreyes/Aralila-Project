import redis
import os

redis_url = os.getenv('REDIS_URL')
print(f"Testing: {redis_url}")

try:
    r = redis.from_url(redis_url)
    r.ping()
    print("✅ Redis OK")
except Exception as e:
    print(f"❌ Redis failed: {e}")