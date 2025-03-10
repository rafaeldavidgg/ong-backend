const { Schema } = require("mongoose");
const Persona = require("./Persona");

const TipoAutismo = Object.freeze({
  AUTISMO_CLASICO: "AUTISMO_CLASICO",
  ASPERGER: "ASPERGER",
  TGD_NE: "TGD_NE",
  TRASTORNO_DESINTEGRATIVO: "TRASTORNO_DESINTEGRATIVO",
  AUTISMO_ALTO_FUNCIONAMIENTO: "AUTISMO_ALTO_FUNCIONAMIENTO",
});

const usuarioSchema = new Schema(
  {
    fechaNacimiento: { type: Date, required: true },
    tipoAutismo: {
      type: String,
      enum: Object.values(TipoAutismo),
      required: true,
    },
    gradoAutismo: { type: Number, min: 1, max: 100, required: true },
    grupoTrabajo: { type: Number, required: true },
  },
  { timestamps: true }
);

const Usuario = Persona.discriminator("Usuario", usuarioSchema);
module.exports = Usuario;
