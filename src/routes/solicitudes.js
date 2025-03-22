const express = require("express");
const router = express.Router();
const solicitudController = require("../controllers/solicitudes.controller");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, solicitudController.crearSolicitud);
router.get("/", authMiddleware, solicitudController.obtenerSolicitudes);
router.put(
  "/:id/aceptar",
  authMiddleware,
  solicitudController.aceptarSolicitud
);
router.delete("/:id", authMiddleware, solicitudController.rechazarSolicitud);

module.exports = router;
