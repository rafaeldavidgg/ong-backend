const { Schema, model } = require("mongoose");

const tipoActividadSchema = new Schema(
  {
    nombreTipo: { type: String, required: true },
    descripcion: { type: String },
    duracion: { type: Number, required: true },
    materiales: { type: String },
  },
  { timestamps: true }
);

const TipoActividad = model("TipoActividad", tipoActividadSchema);
module.exports = TipoActividad;
