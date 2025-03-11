const { Router } = require("express");
const router = Router();

const {
  getUsers,
  createUser,
  getUserById,
  deleteUserById,
  updateUserById,
} = require("../controllers/usuario.controller");

router.route("/")
  .get(getUsers)
  .post(createUser);

router.route("/:id")
  .get(getUserById)
  .delete(deleteUserById)
  .put(updateUserById);

module.exports = router;
