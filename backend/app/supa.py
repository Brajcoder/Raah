from app.config import settings

client = None
client_admin = None
is_configured = False

try:
    from supabase import create_client, Client
    if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        is_configured = True
    
    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY:
        client_admin: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    elif client:
        client_admin = client
except ImportError:
    # Supabase library not installed yet
    pass
except Exception as e:
    print(f"Warning: Failed to initialize Supabase client: {e}")

def anon():
    """Returns the anonymous/public Supabase client."""
    return client

def admin():
    """Returns the service-role Supabase client."""
    return client_admin or client
