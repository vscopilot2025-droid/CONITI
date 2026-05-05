const { spawn } = require('child_process')

const mode = process.argv[2] || 'dev'

const commandSets = {
  dev: [
    { name: 'auth-service', command: 'npm run auth-service:dev' },
    { name: 'conferencias-service', command: 'npm run conferencias-service:dev' },
    { name: 'conferencistas-service', command: 'npm run conferencistas-service:dev' },
    { name: 'fechas-service', command: 'npm run fechas-service:dev' },
    { name: 'frontend', command: 'npm run frontend:dev' }
  ],
  start: [
    { name: 'auth-service', command: 'npm run auth-service:start' },
    { name: 'conferencias-service', command: 'npm run conferencias-service:start' },
    { name: 'conferencistas-service', command: 'npm run conferencistas-service:start' },
    { name: 'fechas-service', command: 'npm run fechas-service:start' },
    { name: 'frontend', command: 'npm run frontend:dev' }
  ]
}

const selectedCommands = commandSets[mode]

if (!selectedCommands) {
  console.error(`Modo no soportado: ${mode}`)
  process.exit(1)
}

const children = selectedCommands.map(({ name, command }) => {
  const child = spawn(command, {
    cwd: process.cwd(),
    shell: true,
    stdio: 'inherit'
  })

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] terminó con código ${code}`)
    }
  })

  return child
})

function shutdown() {
  children.forEach((child) => {
    if (!child.killed) {
      child.kill()
    }
  })
}

process.on('SIGINT', () => {
  shutdown()
  process.exit(0)
})

process.on('SIGTERM', () => {
  shutdown()
  process.exit(0)
})
