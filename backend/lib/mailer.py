import os
import resend

resend.api_key = os.getenv("RESEND_API_KEY")


def send_otp_email(to: str, otp: str):
    html = f"""
    <div style="font-family: sans-serif; max-width: 400px;">
        <h2>รีเซ็ตรหัสผ่าน</h2>
        <p>รหัส OTP ของคุณคือ:</p>
        <h1 style="letter-spacing: 8px; color: #6366f1;">{otp}</h1>
        <p>รหัสนี้จะหมดอายุใน <strong>5 นาที</strong></p>
        <p style="color: #999;">ข้อความสักอย่าง</p>
    </div>
    """

    try:
        resend.Emails.send({
            "from": "onboarding@resend.dev",  # ต้องใช้ตัวนี้ก่อน
            "to": to,
            "subject": "OTP",
            "html": html,
        })
    except Exception as e:
        print("EMAIL ERROR:", e)
        raise


def send_approve_email(
    to: str,
    status: str,
    comment: str = None,
    activity_name: str = "",
    purpose: str = ""
):
    
    comment_section = f"""
        <div style="background:#FFF3CD; padding:10px; border-radius:6px; margin-top:10px;">
            <b>ความคิดเห็น:</b> {comment}
        </div>
    """ if comment else ""

    html = f"""
    <div style="font-family: sans-serif; max-width: 480px;">
        <h2>ผลการพิจารณากิจกรรม</h2>

        <div style="background:#F5F7FF; padding:12px; border-radius:8px; margin-bottom:12px;">
            <p><b>ชื่อกิจกรรม:</b> {activity_name}</p>
            <p><b>วัตถุประสงค์:</b> {purpose}</p>
        </div>

        <p>สถานะของกิจกรรมได้รับการอัปเดตเป็น:</p>
        <h2 style="color: #03369D;">{status}</h2>

        {comment_section}

        <p style="color: #999;">กรุณาเข้าสู่ระบบเพื่อดูรายละเอียดเพิ่มเติม</p>
    </div>
    """
    print("SENDING EMAIL TO:", to) 
    try:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": to,
            "subject": f"ผลการอนุมัติ: {status}",
            "html": html,
        })
    except Exception as e:
        print("EMAIL ERROR:", e)
        raise