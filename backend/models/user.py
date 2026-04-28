from lib.supabase import supabase
from datetime import datetime

async def findUserByIdentifier(identifier: str):
    
    try:
        res = supabase.schema('auths') \
            .table('users') \
            .select('*') \
            .or_(f"email.eq.{identifier},username.eq.{identifier}") \
            .execute()

        data = res.data
        return data[0] if data else None

    except Exception as e:
        print("error:", e)
        return None




async def incrementFailedAttempts(userId: str, currentAttempts: int):
    newAttempts = currentAttempts + 1
    shouldLock = newAttempts >= 5

    supabase.schema('auths') \
        .table('users') \
        .update({
            "failed_login_attempts": newAttempts,
            "is_locked": shouldLock,
            "updated_at": datetime.utcnow().isoformat(),
        }) \
        .eq('id', userId) \
        .execute()

    return {
        "newAttempts": newAttempts,
        "shouldLock": shouldLock
    }


async def resetFailedAttempts(userId: str):
    supabase.schema('auths') \
        .table('users') \
        .update({
            "failed_login_attempts": 0,
            "updated_at": datetime.utcnow().isoformat(),
        }) \
        .eq('id', userId) \
        .execute()