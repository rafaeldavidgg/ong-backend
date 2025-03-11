const { Schema } = require("mongoose");
const Persona = require("./Persona");
const bcrypt = require("bcrypt");

const trabajadorSchema = new Schema(
  {
    fechaIncorporacion: { type: Date, required: true },
    email: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true, select: false },
    tipo: { type: String, enum: ["Auxiliar", "Tecnico"], required: true },
  },
  { timestamps: true }
);

trabajadorSchema.pre("save", async function (next) {
  if (!this.isModified("contraseña")) return next();
  const salt = await bcrypt.genSalt(10);
  this.contraseña = await bcrypt.hash(this.contraseña, salt);
  next();
});

trabajadorSchema.methods.compararContraseña = async function (
  contraseñaIngresada
) {
  return await bcrypt.compare(contraseñaIngresada, this.contraseña);
};

const Trabajador = Persona.discriminator("Trabajador", trabajadorSchema);
module.exports = Trabajador;
