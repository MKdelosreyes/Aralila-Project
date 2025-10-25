import asyncio
import websockets

async def test_lobby():
    uri = "ws://localhost:8000/ws/lobby/TEST123/?player=TestPlayer"
    print(f"🔌 Testing: {uri}")
    
    try:
        async with websockets.connect(uri) as ws:
            print("✅ Connected!")
            msg = await ws.recv()
            print(f"📨 Received: {msg}")
    except websockets.exceptions.InvalidStatusCode as e:
        print(f"❌ HTTP Error {e.status_code}: {e}")
    except Exception as e:
        print(f"❌ Error: {type(e).__name__}: {e}")

asyncio.run(test_lobby())