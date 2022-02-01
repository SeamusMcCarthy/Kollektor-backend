const express = require("express");
const categoryController = require("../controllers/category-controller");
const router = express.Router();

router.get("/", categoryController.getCategories);
router.get("/:cid", categoryController.getCategory);
router.post("/", categoryController.createCategory);
router.delete("/:cid", categoryController.deleteCategory);
module.exports = router;
