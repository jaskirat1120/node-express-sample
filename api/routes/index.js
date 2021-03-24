var express = require("express");
var router = express.Router();

router.get("/", function(req, response) {
	response.render("index", { title: "Express" });
});

module.exports = router;