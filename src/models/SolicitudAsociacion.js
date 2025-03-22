const mongoose = require("mongoose");

const SolicitudAsociacionSchema = new mongoose.Schema({
  familiar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Familiar",
    required: true,
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  estado: {
    type: String,
    enum: ["pendiente", "aceptada", "rechazada"],
    default: "pendiente",
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "SolicitudAsociacion",
  SolicitudAsociacionSchema
);
