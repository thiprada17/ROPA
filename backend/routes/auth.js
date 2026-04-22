import express from 'express'
import crypto from 'crypto'
import supabase from '../lib/supabase.js'
import { sendOtpEmail } from '../lib/mailer.js'
import { login } from '../controllers/authController.js'

const router = express.Router()

router.post('/forget-password', async (req, res) => {
  try {
    const { email } = req.body

    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle()

    if (error) {
      console.error(error)
      return res.status(500).json({
        error: 'Server error'
      })
    }

    if (!data) {
      return res.json({
        message: 'หากอีเมลนี้มีในระบบ เราจะส่ง OTP ไปให้'
      })
    }

    const otp = crypto.randomInt(100000, 999999).toString()
    const expired = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    const { error_otp } = await supabase
      .from('password_reset_otps')
      .insert({ email, otp, expires_at: expired })

    if (error_otp) {
      return res.status(500).json({
        error: 'เกิดข้อผิดพลาด กรุณาลองใหม่'
      })
    }

    await sendOtpEmail(email, otp)

    return res.json({
      message: 'ส่ง OTP เรียบร้อยแล้ว'
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      error: 'Server error'
    })
  }
})

router.post('/login', login)

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  const { data, error } = await supabase
    .from('password_reset_otps')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    return res.status(400).json({ error: 'OTP ไม่ถูกต้องหรือหมดอายุแล้ว' })
  }

  if (new Date(data.expires_at) < new Date()) {
    return res.status(400).json({ error: 'OTP หมดอายุแล้ว กรุณาขอใหม่' })
  }

  console.log(data)
 
  res.json({ message: 'OTP ถูกต้อง', verified: true });
})

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body
    console.log("BODY:", req.body)

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Missing data' });
    }
    const { data, error } = await supabase
      .from('password_reset_otps')
      .select('*')
      .eq('email', email)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      return res.status(400).json({ error: 'OTP ไม่ถูกต้อง' });
    }

    if (data.otp !== otp) {
      return res.status(400).json({ error: 'OTP ไม่ถูกต้อง' });
    }

    if (new Date(data.expires_at) < new Date()) {
      return res.status(400).json({ error: 'OTP หมดอายุ' });
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('email', email);

    if (updateError) {
      return res.status(500).json({ error: 'เปลี่ยนรหัสไม่สำเร็จ' });
    }

    await supabase
      .from('password_reset_otps')
      .update({ used: true })
      .eq('id', data.id);

    return res.json({ message: 'เปลี่ยนรหัสสำเร็จ' })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'Server error' });
  }
})

export default router;