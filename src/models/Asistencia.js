const { Schema, model } = require("mongoose");

const asistenciaSchema = new Schema(
  {
    fecha: { type: Date, required: true },
    presente: { type: Boolean, required: true },
    justificada: { type: Boolean, required: true },
    descripcion: { type: String },
    usuario: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    justificadaPor: { type: Schema.Types.ObjectId, ref: "Familiar" },
  },
  { timestamps: true }
);

const Asistencia = model("Asistencia", asistenciaSchema);
module.exports = Asistencia;
