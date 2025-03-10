const { Schema } = require("mongoose");
const Trabajador = require("./Trabajador");

const AuxiliarSchema = new Schema(
  {
    usuariosAsignados: [{ type: Schema.Types.ObjectId, ref: "Usuario" }],
  },
  { timestamps: true }
);

const Auxiliar = Trabajador.discriminator("Auxiliar", AuxiliarSchema);
module.exports = Auxiliar;
