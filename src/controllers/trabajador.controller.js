const trabajadorCtrl = {};
const Trabajador = require("../models/Trabajador");

trabajadorCtrl.getTrabajadores = async (req, res) => {
  try {
    const { tipo } = req.query;
    const filtro = tipo ? { tipo } : {};
    const trabajadores = await Trabajador.find(filtro);
    res.json(trabajadores);
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
