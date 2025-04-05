const { Schema, model } = require("mongoose");

const eventoSchema = new Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    fecha: { type: Date, required: true },
    entradasTotales: { type: Number, required: true },
    entradasDisponibles: { type: Number, required: true },
    trabajadoresMinimos: { type: Number, required: true },
    participantes: [{ type: Schema.Types.ObjectId, ref: "Trabajador" }],
    entradasSolicitadas: [
      {
        usuario: { type: Schema.Types.ObjectId, ref: "Persona" },
        cantidad: { type: Number },
      },
    ],
    creadoPor: {
      type: Schema.Types.ObjectId,
      ref: "Trabajador",
      required: true,
    },
  },
  { timestamps: true }
);

const Evento = model("Evento", eventoSchema);
module.exports = Evento;
