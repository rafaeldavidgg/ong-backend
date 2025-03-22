const SolicitudAsociacion = require("../models/SolicitudAsociacion");
const Familiar = require("../models/Familiar");
const Usuario = require("../models/Usuario");

exports.crearSolicitud = async (req, res) => {
  const { dniUsuario, familiarId } = req.body;

  try {
    const usuario = await Usuario.findOne({ dni: dniUsuario });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const existe = await SolicitudAsociacion.findOne({
      familiar: familiarId,
      usuario: usuario._id,
      estado: "pendiente",
    });

    if (existe) {
      return res
        .status(400)
        .json({ message: "Ya has enviado una solicitud para este usuario." });
    }

    const nuevaSolicitud = await SolicitudAsociacion.create({
      familiar: familiarId,
      usuario: usuario._id,
    });

    res.status(201).json(nuevaSolicitud);
  } catch (error) {
    res.status(500).json({ message: "Error al crear solicitud", error });
  }
};

exports.obtenerSolicitudes = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const skip = (page - 1) * limit;

  try {
    const regex = new RegExp(search, "i");

    const [todas, total] = await Promise.all([
      SolicitudAsociacion.find({ estado: "pendiente" })
        .populate("familiar")
        .populate("usuario")
        .then((results) =>
          results.filter(
            (s) =>
              regex.test(s.usuario?.nombre || "") ||
              regex.test(s.usuario?.apellidos || "") ||
              regex.test(s.usuario?.dni || "")
          )
        ),
      SolicitudAsociacion.find({ estado: "pendiente" })
        .populate("usuario")
        .then(
          (results) =>
            results.filter(
              (s) =>
                regex.test(s.usuario?.nombre || "") ||
                regex.test(s.usuario?.apellidos || "") ||
                regex.test(s.usuario?.dni || "")
            ).length
        ),
    ]);

    const solicitudesPaginadas = todas.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      solicitudes: solicitudesPaginadas,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener solicitudes", error });
  }
};

exports.aceptarSolicitud = async (req, res) => {
  const { id } = req.params;

  try {
    const solicitud = await SolicitudAsociacion.findById(id);
    if (!solicitud)
      return res.status(404).json({ message: "Solicitud no encontrada" });

    const familiar = await Familiar.findById(solicitud.familiar);
    if (!familiar)
      return res.status(404).json({ message: "Familiar no encontrado" });

    if (!familiar.usuariosAsociados.includes(solicitud.usuario)) {
      familiar.usuariosAsociados.push(solicitud.usuario);
      await familiar.save();
    }

    solicitud.estado = "aceptada";
    await solicitud.save();

    res.json({ message: "Solicitud aceptada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al aceptar solicitud", error });
  }
};

exports.rechazarSolicitud = async (req, res) => {
  const { id } = req.params;

  try {
    await SolicitudAsociacion.findByIdAndDelete(id);
    res.json({ message: "Solicitud eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar solicitud", error });
  }
};
