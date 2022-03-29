const express = require("express");
const userController = require("../controllers/user-controller");
const router = express.Router();
const { check } = require("express-validator");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

router.get("/", userController.getUsers);
router.get("/:uid", userController.getUser);
router.post("/signup", fileUpload.single("image"), userController.signup);
router.post("/login", userController.login);

router.use(checkAuth);
router.patch("/:uid", userController.updateUser);
module.exports = router;
