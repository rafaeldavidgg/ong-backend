const { Schema } = require("mongoose");
const Persona = require("./Persona");
const bcrypt = require("bcrypt");

const FamiliarSchema = new Schema(
  {
    tipoDeRelacionConUsuario: { type: String },
    email: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true, select: false },
    usuariosAsociados: [{ type: Schema.Types.ObjectId, ref: "Usuario" }],
  },
  { timestamps: true }
);

FamiliarSchema.pre("save", async function (next) {
  if (!this.isModified("contraseña")) return next();
  const salt = await bcrypt.genSalt(10);
  this.contraseña = await bcrypt.hash(this.contraseña, salt);
  next();
});

FamiliarSchema.methods.compararContraseña = async function (
  contraseñaIngresada
) {
  return await bcrypt.compare(contraseñaIngresada, this.contraseña);
};

const Familiar = Persona.discriminator("Familiar", FamiliarSchema);
module.exports = Familiar;
