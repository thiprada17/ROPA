import express from 'express'
import crypto from 'crypto'
import supabase from '../lib/supabase.js'
import { sendOtpEmail } from '../lib/mailer.js'

const router = express.Router()

router.post('/forget-password', async (req, res) => {
  try {
    const { email } = req.body

    // เช็ค user
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

    // สร้าง OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    const expired = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // ลบ OTP เก่า
    // await supabase
    //   .from('password_reset_otps')
    //   .delete()
    //   .eq('email', email)

    // // บันทึก OTP ใหม่
    // const { error } = await supabase
    //   .from('password_reset_otps')
    //   .insert({ email, otp, expires_at: expired })

    if (error) {
      return res.status(500).json({
        error: 'เกิดข้อผิดพลาด กรุณาลองใหม่'
      })
    }

    // ส่ง email
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

export default router