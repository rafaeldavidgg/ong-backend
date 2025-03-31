const { Router } = require("express");
const router = Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getIncidencias,
  getIncidenciaById,
  createIncidencia,
  updateIncidenciaById,
  deleteIncidenciaById,
} = require("../controllers/incidencia.controller");

router
  .route("/")
  .get(authMiddleware, getIncidencias)
  .post(authMiddleware, createIncidencia);

router
  .route("/:id")
  .get(authMiddleware, getIncidenciaById)
  .put(authMiddleware, updateIncidenciaById)
  .delete(authMiddleware, deleteIncidenciaById);

module.exports = router;
