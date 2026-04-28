import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

export async function sendOtpEmail(to, otp) {
    await transporter.verify()

    await transporter.sendMail({
        from: `"ROPA" <${process.env.SMTP_USER}>`,
        to,
        subject: 'OTP',
        html: `
      <div style="font-family: sans-serif; max-width: 400px;">
        <h2>รีเซ็ตรหัสผ่าน</h2>
        <p>รหัส OTP ของคุณคือ:</p>
        <h1 style="letter-spacing: 8px; color: #6366f1;">${otp}</h1>
        <p>รหัสนี้จะหมดอายุใน <strong>5 นาที</strong></p>
        <p style="color: #999;">ข้อความสักอย่าง</p>
      </div>
    `,
    })
}
