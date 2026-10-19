import time
from typing import Dict, List
from fastapi import HTTPException, status

# In-memory timestamp tracker: user_id -> List[timestamp]
_USER_REQUEST_TIMESTAMPS: Dict[str, List[float]] = {}

def check_rate_limit(user_id: str, max_requests: int = 10, window_seconds: int = 60) -> bool:
    """
    Enforces per-user rate limiting using a sliding window.
    Returns True if allowed, False if limit exceeded.
    """
    now = time.time()
    cutoff = now - window_seconds
    
    timestamps = _USER_REQUEST_TIMESTAMPS.get(user_id, [])
    # Retain only timestamps within the active sliding window
    active_timestamps = [ts for ts in timestamps if ts > cutoff]
    
    if len(active_timestamps) >= max_requests:
        return False
    
    active_timestamps.append(now)
    _USER_REQUEST_TIMESTAMPS[user_id] = active_timestamps
    return True

def reset_rate_limits() -> None:
    """Helper to clear rate limit states during test runs."""
    _USER_REQUEST_TIMESTAMPS.clear()
