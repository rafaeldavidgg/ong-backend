const { Schema } = require("mongoose");
const Trabajador = require("./Trabajador");

const TecnicoSchema = new Schema({}, { timestamps: true });

const Tecnico = Trabajador.discriminator("Tecnico", TecnicoSchema);
module.exports = Tecnico;
