import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import formRoutes from './routes/form.js'

const app = express()

app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/form', formRoutes)

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})