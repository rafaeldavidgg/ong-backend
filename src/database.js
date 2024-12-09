const mongoose = require('mongoose')

// Conexión
const URI = process.env.MONGODB_URI ? process.env.MONGODB_URI : 'mongodb://127.0.0.1/dbtest'
mongoose.connect(URI)

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('La base de datos ha sido conectada:', URI);
})