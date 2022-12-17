const express = require("express");
const router = express.Router();

// Require controller modules.
const item_controller = require("../controllers/recordController");
const genre_controller = require("../controllers/genreController");

/// ITEM ROUTES ///

// GET catalog home page.
router.get("/", item_controller.index);

// GET request for creating a Record. NOTE This must come before routes that display Book (uses id).
router.get("/record/create", item_controller.record_create_get);

// POST request for creating Book.
router.post("/record/create", item_controller.record_create_post);

// GET request to delete Book.
router.get("/record/:id/delete", item_controller.record_delete_get);

// POST request to delete Book.
router.post("/record/:id/delete", item_controller.record_delete_post);

// GET request to update Book.
router.get("/record/:id/update", item_controller.record_update_get);

// POST request to update Book.
router.post("/record/:id/update", item_controller.record_update_post);

// GET request for one Book.
router.get("/record/:id", item_controller.record_detail);

// GET request for list of all Book items.
router.get("/records", item_controller.record_list);

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get("/genre/create", genre_controller.genre_create_get);

//POST request for creating Genre.
router.post("/genre/create", genre_controller.genre_create_post);

// GET request to delete Genre.
router.get("/genre/:id/delete", genre_controller.genre_delete_get);

// POST request to delete Genre.
router.post("/genre/:id/delete", genre_controller.genre_delete_post);

// GET request to update Genre.
router.get("/genre/:id/update", genre_controller.genre_update_get);

// POST request to update Genre.
router.post("/genre/:id/update", genre_controller.genre_update_post);

// GET request for one Genre.
router.get("/genre/:id", genre_controller.genre_detail);

// GET request for list of all Genre.
router.get("/genres", genre_controller.genre_list);

module.exports = router;
