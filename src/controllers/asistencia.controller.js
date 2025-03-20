const Asistencia = require("../models/Asistencia");

exports.crearAsistencia = async (req, res) => {
  try {
      const { fecha, usuario } = req.body;

      const fechaISO = new Date(fecha).toISOString().split("T")[0];

      const asistenciaExistente = await Asistencia.findOne({
          usuario,
          fecha: { $gte: new Date(fechaISO), $lt: new Date(`${fechaISO}T23:59:59.999Z`) }
      });

      if (asistenciaExistente) {
          return res.status(400).json({ message: "Ya hay una falta para este usuario en ese día." });
      }

      const nuevaAsistencia = new Asistencia(req.body);
      const asistenciaGuardada = await nuevaAsistencia.save();
      res.status(201).json(asistenciaGuardada);
  } catch (error) {
      res.status(500).json({ message: "Error al crear la asistencia", error });
  }
};

exports.obtenerAsistencias = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const filtro = search
      ? {
          $or: [
            { descripcion: { $regex: search, $options: "i" } },
            { usuario: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const asistencias = await Asistencia.find(filtro)
      .populate("usuario", "nombre email")
      .populate("justificadaPor", "nombre email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ fecha: -1 });

    const total = await Asistencia.countDocuments(filtro);

    res.status(200).json({ total, asistencias });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener asistencias", error });
  }
};

exports.obtenerAsistenciasPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const asistencias = await Asistencia.find({ usuario: usuarioId })
      .populate("usuario", "nombre email")
      .populate("justificadaPor", "nombre email")
      .sort({ fecha: -1 });

    res.status(200).json(asistencias);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al obtener asistencias del usuario", error });
  }
};

exports.obtenerAsistenciaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const asistencia = await Asistencia.findById(id)
      .populate("usuario", "nombre email")
      .populate("justificadaPor", "nombre email");

    if (!asistencia) {
      return res.status(404).json({ mensaje: "Asistencia no encontrada" });
    }

    res.status(200).json(asistencia);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener la asistencia", error });
  }
};

exports.editarAsistencia = async (req, res) => {
  try {
    const { id } = req.params;
    const asistenciaActualizada = await Asistencia.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );

    if (!asistenciaActualizada) {
      return res.status(404).json({ mensaje: "Asistencia no encontrada" });
    }

    res.status(200).json(asistenciaActualizada);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al editar la asistencia", error });
  }
};
