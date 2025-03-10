const { Schema, model } = require("mongoose");

const TipoIncidencia = Object.freeze({
  AGITACION: "AGITACION",
  AGRESION_VERBAL: "AGRESION_VERBAL",
  AGRESION_FISICA: "AGRESION_FISICA",
  AUTOLESION: "AUTOLESION",
  SOBRECARGA_SENSORIAL: "SOBRECARGA_SENSORIAL",
  OTRO: "OTRO",
});

const incidenciaSchema = new Schema(
  {
    fecha: { type: Date, required: true },
    tipoIncidencia: {
      type: String,
      enum: Object.values(TipoIncidencia),
      required: true,
    },
    descripcion: { type: String },
    usuario: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    creadaPor: { type: Schema.Types.ObjectId, ref: "Auxiliar", required: true },
  },
  { timestamps: true }
);

const Incidencia = model("Incidencia", incidenciaSchema);
module.exports = Incidencia;
