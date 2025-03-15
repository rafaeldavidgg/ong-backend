const { Router } = require("express");
const router = Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getFamiliares,
  createFamiliar,
  getFamiliarById,
  updateFamiliarById,
  deleteFamiliarById,
} = require("../controllers/familiar.controller");

router.route("/").get(authMiddleware, getFamiliares).post(createFamiliar);

router
  .route("/:id")
  .get(authMiddleware, getFamiliarById)
  .put(authMiddleware, updateFamiliarById)
  .delete(authMiddleware, deleteFamiliarById);

module.exports = router;
