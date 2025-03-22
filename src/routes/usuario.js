const { Router } = require("express");
const router = Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getUsers,
  createUser,
  getUserById,
  deleteUserById,
  updateUserById,
  getUsuariosByIds,
} = require("../controllers/usuario.controller");

router
  .route("/")
  .get(authMiddleware, getUsers)
  .post(authMiddleware, createUser);

router
  .route("/:id")
  .get(authMiddleware, getUserById)
  .delete(authMiddleware, deleteUserById)
  .put(authMiddleware, updateUserById);

router.post("/asociados", authMiddleware, getUsuariosByIds);

module.exports = router;
