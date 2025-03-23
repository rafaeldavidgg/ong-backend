const Actividad = require("../models/Actividad");

const actividadCtrl = {};

actividadCtrl.getActividades = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, tipos } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const filtro = {};

    if (search) {
      filtro.nombre = { $regex: search, $options: "i" };
    }

    if (tipos) {
      const tipoArray = Array.isArray(tipos) ? tipos : tipos.split(",");
      filtro.tipoActividad = { $in: tipoArray };
    }

    const totalActividades = await Actividad.countDocuments(filtro);

    const actividades = await Actividad.find(filtro)
      .populate("tipoActividad", "nombreTipo")
      .populate("realizadaPor", "nombre apellido")
      .populate("ejecutadaPor", "nombre apellido")
      .populate("creadaPor", "nombre apellido")
      .sort({ fecha: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.json({
      actividades,
      totalActividades,
      totalPages: Math.ceil(totalActividades / limitNumber) || 1,
      currentPage: pageNumber,
    });
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo actividades", error });
  }
};

actividadCtrl.getActividadById = async (req, res) => {
  try {
    const actividad = await Actividad.findById(req.params.id)
      .populate("tipoActividad")
      .populate("realizadaPor", "nombre apellido")
      .populate("ejecutadaPor", "nombre apellido")
      .populate("creadaPor", "nombre apellido");

    if (!actividad)
      return res.status(404).json({ message: "Actividad no encontrada" });

    res.json(actividad);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo actividad", error });
  }
};

actividadCtrl.createActividad = async (req, res) => {
  try {
    const {
      nombre,
      fecha,
      realizadaPor,
      ejecutadaPor,
      tipoActividad,
      creadaPor,
    } = req.body;

    if (!nombre || !fecha || !tipoActividad || !creadaPor) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const nuevaActividad = new Actividad({
      nombre,
      fecha,
      realizadaPor,
      ejecutadaPor,
      tipoActividad,
      creadaPor,
    });

    await nuevaActividad.save();

    res.json({
      message: "Actividad creada correctamente",
      actividad: nuevaActividad,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creando actividad", error });
  }
};

actividadCtrl.updateActividadById = async (req, res) => {
  try {
    const { nombre, fecha, realizadaPor, ejecutadaPor, tipoActividad } =
      req.body;

    const actividad = await Actividad.findById(req.params.id);
    if (!actividad)
      return res.status(404).json({ message: "Actividad no encontrada" });

    actividad.nombre = nombre;
    actividad.fecha = fecha;
    actividad.realizadaPor = realizadaPor;
    actividad.ejecutadaPor = ejecutadaPor;
    actividad.tipoActividad = tipoActividad;

    await actividad.save();

    res.json({ message: "Actividad actualizada", actividad });
  } catch (error) {
    res.status(500).json({ message: "Error actualizando actividad", error });
  }
};

actividadCtrl.deleteActividadById = async (req, res) => {
  try {
    const actividad = await Actividad.findByIdAndDelete(req.params.id);
    if (!actividad)
      return res.status(404).json({ message: "Actividad no encontrada" });

    res.json({ message: "Actividad eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando actividad", error });
  }
};

module.exports = actividadCtrl;
