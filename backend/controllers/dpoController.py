from fastapi import Request, HTTPException
from lib.supabase import supabase
from datetime import datetime
from lib.mailer import send_approve_email

async def createApprove(request: Request, user):
    try:
        body = await request.json()
        
        activity_id = body.get('activity_id')
        status = body.get('status')
        comments = body.get("comments", [])

        if not activity_id or not status:
            raise HTTPException(status_code=400, detail="Missing required fields")

        if comments:
            rows = [
                {
                    "activity_id": activity_id,
                    "user_id": user.get("userId"),
                    "status": status,
                    "comment": c["text"],
                    "decided_at": datetime.utcnow().isoformat(),
                }
                for c in comments
            ]
            result = supabase.schema("audit").table("dpo_approvals").insert(rows).execute()
        else:
            # ไม่มี comment (กรณี Complete)
            data = {
                "activity_id": activity_id,
                "user_id": user.get("userId"),
                "status": status,
                "comment": None,
                "decided_at": datetime.utcnow().isoformat(),
            }
            result = supabase.schema("audit").table("dpo_approvals").insert(data).execute()

        update_status = supabase.schema("ropa").table("processing_activities")\
                                .update({"approval_status": status})\
                                .eq('id', activity_id)\
                                .execute()

        activity_res = supabase.schema("ropa").table("processing_activities")\
                       .select("created_by, activity_name, purpose")\
                       .eq("id", activity_id)\
                       .single()\
                       .execute()

        creator_id = activity_res.data.get("created_by")
        activity_name_id = activity_res.data.get("activity_name")
        purpose = activity_res.data.get("purpose", "")

        activity_name = ""
        if activity_name_id:
            name_res = supabase.schema("ropa").table("activity_name")\
                .select("name")\
                .eq("id", activity_name_id)\
                .single()\
                .execute()
            
        activity_name = name_res.data.get("name", "")

        if creator_id:
            user_res = supabase.schema("auths").table("users")\
                .select("email")\
                .eq("id", creator_id)\
                .single()\
                .execute()

        creator_email = user_res.data.get("email")
        latest_comment = comments[-1]["text"] if comments else None

        if creator_email:
            send_approve_email(creator_email, status, latest_comment, activity_name, purpose)

            return {
                "success": True,
                "data": result.data,
                "updated data": update_status.data
            }

    except Exception as e:
        print("Approve Error", e)
        raise HTTPException(status_code=500, detail="Internal server error")
    
async def getComment(request: Request, activity_id: str):
    try:

        res = supabase.schema("audit").table("dpo_approvals") \
            .select("*") \
            .eq("activity_id", activity_id) \
            .execute()

        comments = res.data

        user_ids = list(set(c["user_id"] for c in comments if c.get("user_id")))
        
        users = {}
        if user_ids:
            user_res = supabase.schema("auths").table("users") \
                .select("id, username, email") \
                .in_("id", user_ids) \
                .execute()
            users = {u["id"]: u for u in user_res.data}

        result = [
            {
                **c,
                "username": users.get(c["user_id"], {}).get("username") or
                            users.get(c["user_id"], {}).get("email") or
                            "Unknown"
            }
            for c in comments
        ]

        return result

    except Exception as err:
        print("getComment Error", err)
        raise HTTPException(status_code=500, detail="Server error")