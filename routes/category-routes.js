const express = require("express");
const categoryController = require("../controllers/category-controller");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

router.get("/", categoryController.getCategories);
router.get("/:cid", categoryController.getCategory);

router.use(checkAuth);
router.post("/", categoryController.createCategory);
router.delete("/:cid", categoryController.deleteCategory);
module.exports = router;
