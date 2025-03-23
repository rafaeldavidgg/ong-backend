const TipoActividad = require("../models/TipoActividad");

const tipoActividadCtrl = {};

tipoActividadCtrl.getTipoActividades = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const filtro = search
      ? {
          $or: [
            { nombreTipo: { $regex: search, $options: "i" } },
            { descripcion: { $regex: search, $options: "i" } },
            { materiales: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const totalTipoActividades = await TipoActividad.countDocuments(filtro);
    const tipoActividades = await TipoActividad.find(filtro)
      .skip(skip)
      .limit(limitNumber);

    res.json({
      tipoActividades,
      totalTipoActividades,
      totalPages: Math.ceil(totalTipoActividades / limitNumber) || 1,
      currentPage: pageNumber,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error obteniendo tipos de actividad", error });
  }
};

tipoActividadCtrl.createTipoActividad = async (req, res) => {
  try {
    const { nombreTipo, descripcion, duracion, materiales } = req.body;

    if (!nombreTipo || !duracion) {
      return res.status(400).json({
        message: "Los campos 'nombreTipo' y 'duracion' son obligatorios",
      });
    }

    const newTipoActividad = new TipoActividad({
      nombreTipo,
      descripcion,
      duracion,
      materiales,
    });

    await newTipoActividad.save();
    res.json({
      message: "Tipo de actividad creado",
      tipoActividad: newTipoActividad,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creando tipo de actividad", error });
  }
};

tipoActividadCtrl.getTipoActividadById = async (req, res) => {
  try {
    const tipoActividad = await TipoActividad.findById(req.params.id);
    if (!tipoActividad)
      return res
        .status(404)
        .json({ message: "Tipo de actividad no encontrado" });
    res.json(tipoActividad);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error obteniendo tipo de actividad", error });
  }
};

tipoActividadCtrl.updateTipoActividadById = async (req, res) => {
  try {
    const { nombreTipo, descripcion, duracion, materiales } = req.body;

    const tipoActividad = await TipoActividad.findById(req.params.id);
    if (!tipoActividad)
      return res
        .status(404)
        .json({ message: "Tipo de actividad no encontrado" });

    tipoActividad.nombreTipo = nombreTipo;
    tipoActividad.descripcion = descripcion;
    tipoActividad.duracion = duracion;
    tipoActividad.materiales = materiales;

    await tipoActividad.save();
    res.json({ message: "Tipo de actividad actualizado", tipoActividad });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error actualizando tipo de actividad", error });
  }
};

tipoActividadCtrl.deleteTipoActividadById = async (req, res) => {
  try {
    const tipoActividad = await TipoActividad.findByIdAndDelete(req.params.id);
    if (!tipoActividad)
      return res
        .status(404)
        .json({ message: "Tipo de actividad no encontrado" });

    res.json({ message: "Tipo de actividad eliminado" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error eliminando tipo de actividad", error });
  }
};

module.exports = tipoActividadCtrl;
