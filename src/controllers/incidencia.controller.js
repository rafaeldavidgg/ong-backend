const Incidencia = require("../models/Incidencia");

const incidenciaCtrl = {};

incidenciaCtrl.getIncidencias = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const pipeline = [
      {
        $lookup: {
          from: "personas",
          localField: "usuario",
          foreignField: "_id",
          as: "usuario",
        },
      },
      { $unwind: { path: "$usuario", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "personas",
          localField: "creadaPor",
          foreignField: "_id",
          as: "creadaPor",
        },
      },
      { $unwind: { path: "$creadaPor", preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { tipoIncidencia: { $regex: search, $options: "i" } },
            { "usuario.nombre": { $regex: search, $options: "i" } },
            { "usuario.apellido": { $regex: search, $options: "i" } },
            { "creadaPor.nombre": { $regex: search, $options: "i" } },
            { "creadaPor.apellido": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    const totalCountPipeline = [...pipeline, { $count: "total" }];
    const dataPipeline = [
      ...pipeline,
      { $sort: { fecha: -1 } },
      { $skip: skip },
      { $limit: limitNumber },
    ];

    const [totalCountResult, incidencias] = await Promise.all([
      Incidencia.aggregate(totalCountPipeline),
      Incidencia.aggregate(dataPipeline),
    ]);

    const total = totalCountResult[0]?.total || 0;

    res.json({
      incidencias,
      totalIncidencias: total,
      totalPages: Math.ceil(total / limitNumber) || 1,
      currentPage: pageNumber,
    });
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo incidencias", error });
  }
};

incidenciaCtrl.getIncidenciaById = async (req, res) => {
  try {
    const incidencia = await Incidencia.findById(req.params.id)
      .populate("usuario", "nombre apellido")
      .populate("creadaPor", "nombre apellido");

    if (!incidencia)
      return res.status(404).json({ message: "Incidencia no encontrada" });

    res.json(incidencia);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo incidencia", error });
  }
};

incidenciaCtrl.createIncidencia = async (req, res) => {
  try {
    const { fecha, tipoIncidencia, descripcion, usuario, creadaPor } = req.body;

    if (!fecha || !tipoIncidencia || !usuario || !creadaPor) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const nuevaIncidencia = new Incidencia({
      fecha,
      tipoIncidencia,
      descripcion,
      usuario,
      creadaPor,
    });

    await nuevaIncidencia.save();

    res.json({
      message: "Incidencia creada correctamente",
      incidencia: nuevaIncidencia,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creando incidencia", error });
  }
};

incidenciaCtrl.updateIncidenciaById = async (req, res) => {
  try {
    const { fecha, tipoIncidencia, descripcion, usuario } = req.body;

    const incidencia = await Incidencia.findById(req.params.id);
    if (!incidencia)
      return res.status(404).json({ message: "Incidencia no encontrada" });

    incidencia.fecha = fecha;
    incidencia.tipoIncidencia = tipoIncidencia;
    incidencia.descripcion = descripcion;
    incidencia.usuario = usuario;

    await incidencia.save();

    res.json({ message: "Incidencia actualizada", incidencia });
  } catch (error) {
    res.status(500).json({ message: "Error actualizando incidencia", error });
  }
};

incidenciaCtrl.deleteIncidenciaById = async (req, res) => {
  try {
    const incidencia = await Incidencia.findByIdAndDelete(req.params.id);
    if (!incidencia)
      return res.status(404).json({ message: "Incidencia no encontrada" });

    res.json({ message: "Incidencia eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando incidencia", error });
  }
};

module.exports = incidenciaCtrl;
