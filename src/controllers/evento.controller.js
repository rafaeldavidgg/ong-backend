const mongoose = require("mongoose");
const Evento = require("../models/Evento");

const eventoCtrl = {};

eventoCtrl.getEventos = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const filtro = {};

    if (search) {
      filtro.nombre = { $regex: search, $options: "i" };
    }

    const totalEventos = await Evento.countDocuments(filtro);

    const eventos = await Evento.find(filtro)
      .populate("participantes", "nombre apellido")
      .populate("entradasSolicitadas.usuario", "nombre apellido")
      .populate("creadoPor", "nombre apellido")
      .sort({ fecha: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.json({
      eventos,
      totalEventos,
      totalPages: Math.ceil(totalEventos / limitNumber) || 1,
      currentPage: pageNumber,
    });
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo eventos", error });
  }
};

eventoCtrl.getEventoById = async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id)
      .populate("participantes", "nombre apellido")
      .populate({
        path: "entradasSolicitadas.usuario",
        select: "nombre apellido",
        model: "Persona",
      })
      .populate("creadoPor", "nombre apellido");

    if (!evento) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    res.json(evento);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo evento", error });
  }
};

eventoCtrl.createEvento = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      fecha,
      entradasTotales,
      trabajadoresMinimos,
      creadoPor,
    } = req.body;

    if (
      !nombre ||
      !descripcion ||
      !fecha ||
      !entradasTotales ||
      !trabajadoresMinimos ||
      !creadoPor
    ) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const nuevoEvento = new Evento({
      nombre,
      descripcion,
      fecha,
      entradasTotales: Number(entradasTotales),
      entradasDisponibles: Number(entradasTotales),
      trabajadoresMinimos: Number(trabajadoresMinimos),
      creadoPor,
    });

    await nuevoEvento.save();

    res.json({ message: "Evento creado correctamente", evento: nuevoEvento });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creando evento", error: error.message });
  }
};

eventoCtrl.participarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { trabajadorId } = req.body;

    const evento = await Evento.findById(id);
    if (!evento)
      return res.status(404).json({ message: "Evento no encontrado" });

    if (evento.participantes.includes(trabajadorId)) {
      return res
        .status(400)
        .json({ message: "Ya estás apuntado como participante" });
    }

    evento.participantes.push(trabajadorId);
    await evento.save();

    res.json({ message: "Participación registrada", evento });
  } catch (error) {
    res.status(500).json({ message: "Error al participar en evento", error });
  }
};

eventoCtrl.solicitarEntradas = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId, cantidad } = req.body;

    if (!usuarioId || !cantidad || cantidad <= 0) {
      return res.status(400).json({ message: "Cantidad o usuario inválido" });
    }

    const evento = await Evento.findById(id);
    if (!evento)
      return res.status(404).json({ message: "Evento no encontrado" });

    if (cantidad > evento.entradasDisponibles) {
      return res
        .status(400)
        .json({ message: "No hay suficientes entradas disponibles" });
    }

    const entradaExistente = evento.entradasSolicitadas.find(
      (e) => e.usuario?.toString() === usuarioId
    );

    if (entradaExistente) {
      entradaExistente.cantidad += cantidad;
    } else {
      evento.entradasSolicitadas.push({
        usuario: new mongoose.Types.ObjectId(usuarioId),
        cantidad,
      });
    }

    evento.entradasDisponibles -= cantidad;

    await evento.save();

    res.json({ message: "Entradas solicitadas correctamente", evento });
  } catch (error) {
    console.error("Error en solicitarEntradas:", error);
    res.status(500).json({ message: "Error al solicitar entradas", error });
  }
};

eventoCtrl.getEventosPorMes = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res
        .status(400)
        .json({ message: "Faltan parámetros de año o mes" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const eventos = await Evento.find({
      fecha: { $gte: startDate, $lte: endDate },
    })
      .populate("creadoPor", "nombre apellido")
      .sort({ fecha: 1 });

    res.json(eventos);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error obteniendo eventos por mes", error });
  }
};

eventoCtrl.updateEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, fecha, entradasTotales, trabajadoresMinimos } =
      req.body;

    const evento = await Evento.findById(id);
    if (!evento)
      return res.status(404).json({ message: "Evento no encontrado" });

    const entradasSolicitadas = evento.entradasSolicitadas.reduce(
      (acc, e) => acc + e.cantidad,
      0
    );

    if (entradasTotales < entradasSolicitadas) {
      return res.status(400).json({
        message: `Ya se han solicitado ${entradasSolicitadas} entradas. No puedes establecer un total menor.`,
      });
    }

    evento.nombre = nombre;
    evento.descripcion = descripcion;
    evento.fecha = fecha;
    evento.entradasTotales = entradasTotales;
    evento.entradasDisponibles = entradasTotales - entradasSolicitadas;
    evento.trabajadoresMinimos = trabajadoresMinimos;

    await evento.save();

    res.json({ message: "Evento actualizado correctamente", evento });
  } catch (error) {
    res.status(500).json({ message: "Error actualizando evento", error });
  }
};

eventoCtrl.deleteEvento = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await Evento.findByIdAndDelete(id);

    if (!evento) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    res.json({ message: "Evento eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando evento", error });
  }
};

module.exports = eventoCtrl;
