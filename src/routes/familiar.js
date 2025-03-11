const { Router } = require("express");
const router = Router();

const {
  getFamiliares,
  createFamiliar,
  getFamiliarById,
  updateFamiliarById,
  deleteFamiliarById,
} = require("../controllers/familiar.controller");

router.route("/")
  .get(getFamiliares)
  .post(createFamiliar);

router.route("/:id")
  .get(getFamiliarById)
  .put(updateFamiliarById)
  .delete(deleteFamiliarById);

module.exports = router;