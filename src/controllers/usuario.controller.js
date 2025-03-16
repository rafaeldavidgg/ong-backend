const usuarioCtrl = {};
const Usuario = require("../models/Usuario");

usuarioCtrl.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const grupoTrabajo = req.query.grupoTrabajo;

    let query = {};
    if (grupoTrabajo) {
      query.grupoTrabajo = grupoTrabajo;
    }

    const totalUsuarios = await Usuario.countDocuments(query);

    const usuarios = await Usuario.find(query).skip(skip).limit(limit);

    res.json({
      usuarios,
      totalUsuarios,
      totalPages: Math.ceil(totalUsuarios / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo usuarios", error });
  }
};

usuarioCtrl.createUser = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      telefono,
      dni,
      fechaNacimiento,
      tipoAutismo,
      gradoAutismo,
      grupoTrabajo,
    } = req.body;

    if (
      !nombre ||
      !apellido ||
      !fechaNacimiento ||
      !tipoAutismo ||
      !grupoTrabajo
    ) {
      return res.status(400).json({
        message: "Todos los campos obligatorios deben ser proporcionados",
      });
    }

    const newUser = new Usuario({
      nombre,
      apellido,
      telefono,
      dni,
      fechaNacimiento,
      tipoAutismo,
      gradoAutismo,
      grupoTrabajo,
    });
    await newUser.save();
    res.json({ message: "Usuario creado", usuario: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error creando usuario", error });
  }
};

usuarioCtrl.getUserById = async (req, res) => {
  try {
    const user = await Usuario.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo usuario", error });
  }
};

usuarioCtrl.updateUserById = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      telefono,
      dni,
      fechaNacimiento,
      tipoAutismo,
      gradoAutismo,
      grupoTrabajo,
    } = req.body;

    const user = await Usuario.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    user.nombre = nombre;
    user.apellido = apellido;
    user.telefono = telefono;
    user.dni = dni;
    user.fechaNacimiento = fechaNacimiento;
    user.tipoAutismo = tipoAutismo;
    user.gradoAutismo = gradoAutismo;
    user.grupoTrabajo = grupoTrabajo;

    await user.save();
    res.json({ message: "Usuario actualizado", user });
  } catch (error) {
    res.status(500).json({ message: "Error actualizando usuario", error });
  }
};

usuarioCtrl.deleteUserById = async (req, res) => {
  try {
    const user = await Usuario.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando usuario", error });
  }
};

module.exports = usuarioCtrl;
