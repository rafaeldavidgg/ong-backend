const { Schema, model } = require("mongoose");

const actividadSchema = new Schema(
  {
    nombre: { type: String, required: true },
    fecha: { type: Date, required: true },
    realizadaPor: [{ type: Schema.Types.ObjectId, ref: "Usuario" }],
    ejecutadaPor: [{ type: Schema.Types.ObjectId, ref: "Auxiliar" }],
    creadaPor: { type: Schema.Types.ObjectId, ref: "Tecnico", required: true },
    tipoActividad: {
      type: Schema.Types.ObjectId,
      ref: "TipoActividad",
      required: true,
    },
  },
  { timestamps: true }
);

const Actividad = model("Actividad", actividadSchema);
module.exports = Actividad;
