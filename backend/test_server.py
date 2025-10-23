#!/usr/bin/env python3
"""서버 기동 및 기본 테스트"""
import subprocess
import time
import requests
import json

print("🚀 Starting server...")
server = subprocess.Popen(
    ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

time.sleep(3)

print("\n✅ Server started! Testing endpoints...\n")

# Test root endpoint
try:
    response = requests.get("http://localhost:8000/")
    print("GET / →", json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"❌ Error: {e}")

print("\n---\n")

# Test health endpoint
try:
    response = requests.get("http://localhost:8000/health")
    print("GET /health →", json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"❌ Error: {e}")

print("\n---\n")
print("📚 API Docs available at: http://localhost:8000/docs")
print("\n⏸️  Server running in background (PID: {})".format(server.pid))
print("💡 To stop: kill {}".format(server.pid))
print("\nPress Enter to stop server and continue...")
input()

server.terminate()
server.wait()
print("👋 Server stopped")
