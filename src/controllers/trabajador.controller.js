const trabajadorCtrl = {};
const Trabajador = require("../models/Trabajador");
const Familiar = require("../models/Familiar");

trabajadorCtrl.getTrabajadores = async (req, res) => {
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
            { tipo: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const totalTrabajadores = await Trabajador.countDocuments(filtro);

    const trabajadores = await Trabajador.find(filtro)
      .skip(skip)
      .limit(limitNumber);

    res.json({
      trabajadores,
      totalTrabajadores,
      totalPages: Math.ceil(totalTrabajadores / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo trabajadores", error });
  }
};

trabajadorCtrl.createTrabajador = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      telefono,
      dni,
      fechaIncorporacion,
      email,
      contraseña,
      tipo,
    } = req.body;

    if (!nombre || !apellido || !email || !contraseña || !tipo) {
      return res.status(400).json({
        message: "Todos los campos obligatorios deben ser proporcionados",
      });
    }

    const existingTrabajador = await Trabajador.findOne({ email });
    const existingFamiliar = await Familiar.findOne({ email });
    if (existingTrabajador || existingFamiliar) {
      return res.status(400).json({
        message: "Ya existe un usuario registrado con ese email",
      });
    }

    if (!["Auxiliar", "Tecnico"].includes(tipo)) {
      return res.status(400).json({ message: "Tipo de trabajador no válido" });
    }

    const newTrabajador = new Trabajador({
      nombre,
      apellido,
      telefono,
      dni,
      fechaIncorporacion,
      email,
      contraseña,
      tipo,
    });

    await newTrabajador.save();
    res.json({ message: "Trabajador creado", trabajador: newTrabajador });
  } catch (error) {
    res.status(500).json({ message: "Error creando trabajador", error });
  }
};

trabajadorCtrl.getTrabajadorById = async (req, res) => {
  try {
    const trabajador = await Trabajador.findById(req.params.id);
    if (!trabajador)
      return res.status(404).json({ message: "Trabajador no encontrado" });
    res.json(trabajador);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo trabajador", error });
  }
};

trabajadorCtrl.updateTrabajadorById = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      telefono,
      dni,
      fechaIncorporacion,
      email,
      contraseña,
      tipo,
    } = req.body;

    const trabajador = await Trabajador.findById(req.params.id);
    if (!trabajador)
      return res.status(404).json({ message: "Trabajador no encontrado" });

    if (email !== trabajador.email) {
      const existingTrabajador = await Trabajador.findOne({ email });
      const existingFamiliar = await Familiar.findOne({ email });

      if (existingTrabajador || existingFamiliar) {
        return res.status(400).json({
          message: "Ya existe otro usuario con ese email",
        });
      }
    }

    trabajador.nombre = nombre;
    trabajador.apellido = apellido;
    trabajador.telefono = telefono;
    trabajador.dni = dni;
    trabajador.fechaIncorporacion = fechaIncorporacion;
    trabajador.email = email;

    if (!["Auxiliar", "Tecnico"].includes(tipo)) {
      return res.status(400).json({ message: "Tipo de trabajador no válido" });
    }

    trabajador.tipo = tipo;

    if (contraseña) {
      trabajador.contraseña = contraseña;
    }

    await trabajador.save();
    res.json({ message: "Trabajador actualizado", trabajador });
  } catch (error) {
    res.status(500).json({ message: "Error actualizando trabajador", error });
  }
};

trabajadorCtrl.deleteTrabajadorById = async (req, res) => {
  try {
    const trabajador = await Trabajador.findByIdAndDelete(req.params.id);
    if (!trabajador)
      return res.status(404).json({ message: "Trabajador no encontrado" });
    res.json({ message: "Trabajador eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando trabajador", error });
  }
};

module.exports = trabajadorCtrl;
