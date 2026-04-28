import express from 'express'
import { createUser, getUsers, editUser } from '../controllers/adminController.js'
import { verifyToken, requireAdmin } from '../middleware/auth.js'
import supabase from '../lib/supabase.js'

const router = express.Router()

router.post('/users', verifyToken, requireAdmin, createUser)

router.get('/departments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .schema('auths')
      .from('departments')
      .select('id, department_name')

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch departments' })
    }

    return res.json(data)

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

router.get('/users/get', getUsers)
router.put('/edit', verifyToken, requireAdmin, editUser)

export default router