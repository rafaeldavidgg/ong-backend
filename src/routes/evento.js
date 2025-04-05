const { Router } = require("express");
const router = Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getEventos,
  getEventoById,
  createEvento,
  updateEvento,
  deleteEvento,
  participarEvento,
  solicitarEntradas,
  getEventosPorMes,
} = require("../controllers/evento.controller");

router
  .route("/")
  .get(authMiddleware, getEventos)
  .post(authMiddleware, createEvento);

router
  .route("/:id")
  .get(authMiddleware, getEventoById)
  .put(authMiddleware, updateEvento)
  .delete(authMiddleware, deleteEvento);

router.route("/:id/participar").post(authMiddleware, participarEvento);

router.route("/:id/entradas").post(authMiddleware, solicitarEntradas);

router.route("/por-mes/listado").get(authMiddleware, getEventosPorMes);

module.exports = router;
