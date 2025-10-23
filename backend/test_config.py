"""
설정 로딩 테스트
"""
try:
    from app.config import settings
    print("\n✅ Config loaded successfully!")
    print(f"Debug mode: {settings.debug}")
    print(f"Supabase URL configured: {bool(settings.supabase_url)}")
except Exception as e:
    print(f"\n❌ Config loading failed: {e}")
