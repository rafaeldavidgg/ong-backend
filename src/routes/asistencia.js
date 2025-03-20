const express = require("express");
const router = express.Router();
const asistenciaController = require("../controllers/asistencia.controller");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, asistenciaController.crearAsistencia);

router.get("/", authMiddleware, asistenciaController.obtenerAsistencias);

router.get(
  "/usuario/:usuarioId",
  authMiddleware,
  asistenciaController.obtenerAsistenciasPorUsuario
);

router.get("/:id", authMiddleware, asistenciaController.obtenerAsistenciaPorId);

router.put("/:id", authMiddleware, asistenciaController.editarAsistencia);

module.exports = router;
