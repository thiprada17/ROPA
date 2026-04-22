import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { readFileSync } from 'fs'  
import swaggerUi from 'swagger-ui-express'  
import yaml from 'js-yaml'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'

const app = express()
app.use(cors())   
app.use(express.json())

const swaggerDocument = yaml.load(readFileSync('./swagger.yaml', 'utf8'))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)

app.listen(8000, () => {
  console.log('Server running on port 8000')
  console.log('Swagger UI: http://localhost:8000/api-docs')
})

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerDocument)
})