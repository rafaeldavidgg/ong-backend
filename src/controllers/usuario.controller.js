const usuarioCtrl = {};
const Usuario = require("../models/Usuario");

usuarioCtrl.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, grupoTrabajo, search } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    let filtro = {};

    if (grupoTrabajo) {
      filtro.grupoTrabajo = grupoTrabajo;
    }

    if (search) {
      filtro.$or = [
        { nombre: { $regex: search, $options: "i" } },
        { apellido: { $regex: search, $options: "i" } },
        { dni: { $regex: search, $options: "i" } },
        { tipoAutismo: { $regex: search, $options: "i" } },
      ];
    }

    const totalUsuarios = await Usuario.countDocuments(filtro);
    const usuarios = await Usuario.find(filtro).skip(skip).limit(limitNumber);

    res.json({
      usuarios,
      totalUsuarios,
      totalPages: Math.ceil(totalUsuarios / limitNumber) || 1,
      currentPage: pageNumber,
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

usuarioCtrl.getUsuariosByIds = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Debes proporcionar un array de IDs" });
    }

    const usuarios = await Usuario.find({ _id: { $in: ids } });
    res.json(usuarios);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error obteniendo usuarios asociados", error });
  }
};

module.exports = usuarioCtrl;
