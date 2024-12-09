const {Router} = require('express')
const router = Router()

const { getUser, createUser, getUserById, deleteUserById, putUserById} = require('../controller/usuario.controller')

router.route('/')
    .get(getUser)
    .post(createUser)

router.route('/:id')
    .get(getUserById)
    .delete(deleteUserById)
    .put(putUserById)

module.exports = router;