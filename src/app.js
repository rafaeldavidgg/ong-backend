const express = require('express')
const cors = require('cors')
const app = express();

// Configuración
app.set('port', process.env.PORT || 4000)

// Middlewares
app.use(cors())
app.use(express.json())

// Rutas
app.get('/', (req, res) => {
    res.send('Bienvenido a mi API Rest full')
})

app.use('/api/usuarios', require('./routes/usuario'))

module.exports = app;