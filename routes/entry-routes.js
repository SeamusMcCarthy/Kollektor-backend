const express = require("express");
const { check } = require("express-validator");
const entryController = require("../controllers/entry-controller");
const router = express.Router();

router.get("/", entryController.getEntries);
router.get("/:eid", entryController.getEntryById);
router.get("/user/:uid", entryController.getEntriesByUserId);
router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  entryController.createEntry
);
router.patch(
  "/:eid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  entryController.updateEntry
);
router.delete("/:eid", entryController.deleteEntry);
module.exports = router;
