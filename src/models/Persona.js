const { Schema, model } = require("mongoose");

const personaSchema = new Schema(
  {
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    telefono: { type: Number },
    dni: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
    discriminatorKey: "kind",
    collection: "personas",
  }
);

const Persona = model("Persona", personaSchema);
module.exports = Persona;
