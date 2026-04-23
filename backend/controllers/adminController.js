import bcrypt from 'bcrypt'
import supabase from '../lib/supabase.js'

export async function createUser(req, res) {
    try {
        const {
            fullName,
            email,
            password,
            phone,
            position,
            department,
            team,
            role,
        } = req.body

        if (!email || !password || !fullName) {
            return res.status(400).json({
                error: 'Missing required fields'
            })
        }

        // const hashedPassword = await bcrypt.hash(password, 10)

        const { data, error } = await supabase
            .schema('auths')
            .from('users')
            .insert([
                {
                    username: fullName,
                    email,
                    password,
                    phone,
                    department_id: department,
                    position: team,
                    role,
                    status: 'ACTIVE',
                    is_locked: false,
                    failed_login_attempts: 0,
                }
            ])
            .select()
            .single()

        if (error) {
            console.error('SUPABASE ERROR:', error)
            return res.status(500).json({
                error: error.message
            })
        }

        return res.json({
            message: 'User created successfully',
            user: data
        })

    } catch (err) {
        console.error(err)
        return res.status(500).json({
            error: 'Server error'
        })
    }
}

export async function getUsers(req, res) {
    try {
        const { data, error } = await supabase
            .schema('auths')
            .from('users')
            .select(`
    *,
    departments (
      department_name
    )
  `)

        if (error) {
            console.error(error)
            return res.status(500).json({ error: error.message })
        }

        return res.json(data)
    } catch (err) {
        return res.status(500).json({ error: 'Server error' })
    }
}