const familiarCtrl = {};
const Familiar = require("../models/Familiar");

familiarCtrl.getFamiliares = async (req, res) => {
  try {
    const familiares = await Familiar.find();
    res.json(familiares);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo familiares", error });
  }
};

familiarCtrl.createFamiliar = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      telefono,
      dni,
      tipoDeRelacionConUsuario,
      email,
      contraseña,
    } = req.body;

    if (!nombre || !apellido || !email || !contraseña) {
      return res.status(400).json({
        message: "Todos los campos obligatorios deben ser proporcionados",
      });
    }

    const newFamiliar = new Familiar({
      nombre,
      apellido,
      telefono,
      dni,
      tipoDeRelacionConUsuario,
      email,
      contraseña,
    });
    await newFamiliar.save();
    res.json({ message: "Familiar creado", familiar: newFamiliar });
  } catch (error) {
    res.status(500).json({ message: "Error creando familiar", error });
  }
};

familiarCtrl.getFamiliarById = async (req, res) => {
  try {
    const familiar = await Familiar.findById(req.params.id);
    if (!familiar)
      return res.status(404).json({ message: "Familiar no encontrado" });
    res.json(familiar);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo familiar", error });
  }
};

familiarCtrl.updateFamiliarById = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      telefono,
      dni,
      tipoDeRelacionConUsuario,
      email,
      contraseña,
    } = req.body;

    const familiar = await Familiar.findById(req.params.id);
    if (!familiar)
      return res.status(404).json({ message: "Familiar no encontrado" });

    familiar.nombre = nombre;
    familiar.apellido = apellido;
    familiar.telefono = telefono;
    familiar.dni = dni;
    familiar.tipoDeRelacionConUsuario = tipoDeRelacionConUsuario;
    familiar.email = email;

    // Si se proporciona una nueva contraseña, actualizarla (se encriptará automáticamente por el modelo)
    if (contraseña) {
      familiar.contraseña = contraseña;
    }

    await familiar.save();
    res.json({ message: "Familiar actualizado", familiar });
  } catch (error) {
    res.status(500).json({ message: "Error actualizando familiar", error });
  }
};

familiarCtrl.deleteFamiliarById = async (req, res) => {
  try {
    const familiar = await Familiar.findByIdAndDelete(req.params.id);
    if (!familiar)
      return res.status(404).json({ message: "Familiar no encontrado" });
    res.json({ message: "Familiar eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando familiar", error });
  }
};

module.exports = familiarCtrl;
