const { Router } = require("express");
const router = Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getTrabajadores,
  createTrabajador,
  getTrabajadorById,
  updateTrabajadorById,
  deleteTrabajadorById,
} = require("../controllers/trabajador.controller");

router
  .route("/")
  .get(
    authMiddleware,
    (req, res, next) => {
      const { tipo } = req.query;
      if (tipo && !["Auxiliar", "Tecnico"].includes(tipo)) {
        return res
          .status(400)
          .json({ message: "Tipo de trabajador no válido" });
      }
      next();
    },
    getTrabajadores
  )
  .post(authMiddleware, createTrabajador);

router
  .route("/:id")
  .get(authMiddleware, getTrabajadorById)
  .put(authMiddleware, updateTrabajadorById)
  .delete(authMiddleware, deleteTrabajadorById);

module.exports = router;
