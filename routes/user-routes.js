const express = require("express");
const userController = require("../controllers/user-controller");
const router = express.Router();
const { check } = require("express-validator");
const fileUpload = require("../middleware/file-upload");

router.get("/", userController.getUsers);
// router.patch("/:uid", userController.updateUser);
router.get("/:uid", userController.getUser);
router.post("/signup", userController.signup);
router.post("/login", userController.login);
module.exports = router;
