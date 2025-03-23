const { Router } = require("express");
const router = Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getTipoActividades,
  createTipoActividad,
  getTipoActividadById,
  updateTipoActividadById,
  deleteTipoActividadById,
} = require("../controllers/tipoActividad.controller");

router
  .route("/")
  .get(authMiddleware, getTipoActividades)
  .post(authMiddleware, createTipoActividad);

router
  .route("/:id")
  .get(authMiddleware, getTipoActividadById)
  .put(authMiddleware, updateTipoActividadById)
  .delete(authMiddleware, deleteTipoActividadById);

module.exports = router;
