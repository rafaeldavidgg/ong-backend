const { Router } = require("express");
const router = Router();

const {
  getTrabajadores,
  createTrabajador,
  getTrabajadorById,
  updateTrabajadorById,
  deleteTrabajadorById,
} = require("../controllers/trabajador.controller");

router
  .route("/")
  .get((req, res, next) => {
    const { tipo } = req.query;
    if (tipo && !["Auxiliar", "Tecnico"].includes(tipo)) {
      return res.status(400).json({ message: "Tipo de trabajador no válido" });
    }
    next();
  }, getTrabajadores)
  .post(createTrabajador);

router
  .route("/:id")
  .get(getTrabajadorById)
  .put(updateTrabajadorById)
  .delete(deleteTrabajadorById);

module.exports = router;
