const Familiar = require("../models/Familiar");
const Trabajador = require("../models/Trabajador");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    let usuario = await Familiar.findOne({ email }).select("+contraseña");
    let tipoUsuario = "Familiar";

    if (!usuario) {
      usuario = await Trabajador.findOne({ email }).select("+contraseña");
      tipoUsuario = "Trabajador";
    }

    if (!usuario)
      return res.status(400).json({ message: "Credenciales inválidas" });

    const esCorrecta = await usuario.compararContraseña(contraseña);
    if (!esCorrecta)
      return res.status(400).json({ message: "Credenciales inválidas" });

    const token = jwt.sign(
      { id: usuario._id, tipo: tipoUsuario },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      usuario: {
        id: usuario._id,
        email: usuario.email,
        tipo: tipoUsuario,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.message });
  }
};

exports.validateToken = async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader)
      return res.status(401).json({ message: "Acceso denegado" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token no válido" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: "Token válido", usuario: decoded });
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
  }
};
