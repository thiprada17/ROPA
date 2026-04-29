import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os


def send_otp_email(to: str, otp: str):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "OTP"
    msg["From"] = f"ROPA <{smtp_user}>"
    msg["To"] = to

    html = f"""
    <div style="font-family: sans-serif; max-width: 400px;">
        <h2>รีเซ็ตรหัสผ่าน</h2>
        <p>รหัส OTP ของคุณคือ:</p>
        <h1 style="letter-spacing: 8px; color: #6366f1;">{otp}</h1>
        <p>รหัสนี้จะหมดอายุใน <strong>5 นาที</strong></p>
        <p style="color: #999;">ข้อความสักอย่าง</p>
    </div>
    """

    part = MIMEText(html, "html")
    msg.attach(part)

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, to, msg.as_string())

    except Exception as e:
        print("EMAIL ERROR:", e)
        raise

def send_approve_email(to: str, status: str, comment: str = None, activity_name: str = "", purpose: str = ""):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"ผลการอนุมัติกิจกรรม: {status}"
    msg["From"] = f"ROPA <{smtp_user}>"
    msg["To"] = to

    comment_section = f"""
        <div style="background:#FFF3CD; padding:10px; border-radius:6px; margin-top:10px;">
            <b>ความคิดเห็น:</b> {comment}
        </div>
    """ if comment else ""

    html = f"""
    <div style="font-family: sans-serif; max-width: 480px;">
        <h2>ผลการพิจารณากิจกรรม</h2>

        <div style="background:#F5F7FF; padding:12px; border-radius:8px; margin-bottom:12px;">
            <p style="margin:0 0 6px 0;"><b>ชื่อกิจกรรม:</b> {activity_name}</p>
            <p style="margin:0;"><b>วัตถุประสงค์:</b> {purpose}</p>
        </div>

        <p>สถานะของกิจกรรมได้รับการอัปเดตเป็น:</p>
        <h2 style="color: #03369D;">{status}</h2>

        {comment_section}

        <p style="color: #999;">กรุณาเข้าสู่ระบบเพื่อดูรายละเอียดเพิ่มเติม</p>
    </div>
    """

    part = MIMEText(html, "html")
    msg.attach(part)

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, to, msg.as_string())
    except Exception as e:
        print("EMAIL ERROR:", e)
        raise