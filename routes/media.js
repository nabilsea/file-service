const express = require("express");
const router = express.Router();
const { index, store, destroy } = require("../controllers/MediaController");

router.get("/", index);
router.post("/", store);
router.delete("/:id", destroy);

module.exports = router;
