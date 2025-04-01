const { Router } = require("express");
const router = Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getActividades,
  getActividadById,
  createActividad,
  updateActividadById,
  deleteActividadById,
  getActividadesPorUsuario,
  getActividadesPorUsuarioYMes,
} = require("../controllers/actividad.controller");

router
  .route("/")
  .get(authMiddleware, getActividades)
  .post(authMiddleware, createActividad);

router.route("/usuario").get(authMiddleware, getActividadesPorUsuario);

router
  .route("/:id")
  .get(authMiddleware, getActividadById)
  .put(authMiddleware, updateActividadById)
  .delete(authMiddleware, deleteActividadById);

router
  .route("/por-usuario/:id")
  .get(authMiddleware, getActividadesPorUsuarioYMes);

module.exports = router;
