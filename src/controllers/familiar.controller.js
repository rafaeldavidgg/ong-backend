const familiarCtrl = {};
const Familiar = require("../models/Familiar");
const Trabajador = require("../models/Trabajador");

familiarCtrl.getFamiliares = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const filtro = search
      ? {
          $or: [
            { nombre: { $regex: search, $options: "i" } },
            { apellido: { $regex: search, $options: "i" } },
            { dni: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const totalFamiliares = await Familiar.countDocuments(filtro);

    const familiares = await Familiar.find(filtro)
      .skip(skip)
      .limit(limitNumber);

    res.json({
      familiares,
      totalFamiliares,
      totalPages: Math.ceil(totalFamiliares / limitNumber) || 1,
      currentPage: pageNumber,
    });
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

    const existingFamiliar = await Familiar.findOne({ email });
    const existingTrabajador = await Trabajador.findOne({ email });
    if (existingFamiliar || existingTrabajador) {
      return res.status(400).json({
        message: "Ya existe un usuario registrado con ese email",
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

    if (email !== familiar.email) {
      const existingFamiliar = await Familiar.findOne({ email });
      const existingTrabajador = await Trabajador.findOne({ email });

      if (existingFamiliar || existingTrabajador) {
        return res.status(400).json({
          message: "Ya existe otro usuario con ese email",
        });
      }
    }

    familiar.nombre = nombre;
    familiar.apellido = apellido;
    familiar.telefono = telefono;
    familiar.dni = dni;
    familiar.tipoDeRelacionConUsuario = tipoDeRelacionConUsuario;
    familiar.email = email;

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
