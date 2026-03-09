import { createApp } from './interfaces/http/app.js'
import { initializeDatabase } from './infrastructure/db/mysql.js'

const port = Number(process.env.PORT || 3000)
const app = createApp()

async function bootstrap() {
  await initializeDatabase()

  app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start backend:', error)
  process.exit(1)
})
