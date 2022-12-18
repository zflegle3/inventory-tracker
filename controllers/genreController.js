const Genre = require("../models/category");
const Item = require("../models/item");
const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.genre_list = (req, res) => {
    Genre.find({}, "name")
      .sort({ name: 1 })
      .exec(function (err, list_genres) {
        if (err) {
          return next(err);
        }
        //Successful, so render
        res.render("genre_list", { title: "All Genres in Collection", genre_list: list_genres });
      });
  };

// Display detail page for a specific Genre.
exports.genre_detail = (req, res) => {
    async.parallel(
      {
        genre(callback) {
          Genre.findById(req.params.id).exec(callback);
        },
  
        genre_records(callback) {
          Item.find({ genre: req.params.id }).exec(callback);
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }
        if (results.genre == null) {
          // No results.
          const err = new Error("Genre not found");
          err.status = 404;
          return next(err);
        }
        // Successful, so render
        res.render("genre_detail", {
          title: "Genre Detail",
          genre: results.genre,
          genre_records: results.genre_records,
        });
      }
    );
  };

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
    res.render("genre_form", { title: "Create Genre" });
};

// exports.genre_create_post = (req, res, next) => {
//     res.render("genre_form", { title: "Create Genre" });
// };

// Handle Genre create on POST.
exports.genre_create_post = [
    // Validate and sanitize the name field.
    body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),
    body("description", "Genre description required").trim().isLength({ min: 1, max: 500 }).escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a genre object with escaped and trimmed data.
      const genre = new Genre({ name: req.body.name, description: req.body.description });
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render("genre_form", {
          title: "Create Genre",
          genre,
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid.
        // Check if Genre with same name already exists.
        Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
          if (err) {
            return next(err);
          }
  
          if (found_genre) {
            // Genre exists, redirect to its detail page.
            res.redirect(found_genre.url);
          } else {
            genre.save((err) => {
              if (err) {
                return next(err);
              }
              // Genre saved. Redirect to genre detail page.
              res.redirect(genre.url);
            });
          }
        });
      }
    },
  ];
  


// Display Genre delete form on GET.
exports.genre_delete_get = (req, res, next) => {
    async.parallel(
      {
        genre(callback) {
          Genre.findById(req.params.id).exec(callback);
        },
        genre_records(callback) {
          Item.find({ genre: req.params.id }).exec(callback);
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }
        if (results.genre == null) {
          // No results.
          res.redirect("/catalog/genres");
        }
        // Successful, so render.
        res.render("genre_delete", {
          title: "Delete Genre",
          genre: results.genre,
          genre_records: results.genre_records,
        });
      }
    );
};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res, next) => {
    async.parallel(
      {
        genre(callback) {
          Genre.findById(req.body.genreid).exec(callback);
        },
        genre_records(callback) {
          Item.find({ genre: req.body.genreid }).exec(callback);
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }
        // Success
        if (results.genre_records.length > 0) {
          // Genre has books. Render in same way as for GET route.
          res.render("genre_delete", {
            title: "Delete Genre",
            genre: results.genre,
            genre_records: results.genre_records,
          });
          return;
        }
        // Genre has no books. Delete object and redirect to the list of genres.
        Genre.findByIdAndRemove(req.body.genreid, (err) => {
          if (err) {
            return next(err);
          }
          // Success - go to author list
          res.redirect("/genres");
        });
      }
    );
};

// Display Genre update form on GET.
exports.genre_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res, next) {
    Genre.findById(req.params.id, function (err, genre) {
      if (err) {
        return next(err);
      }
      if (genre == null) {
        // No results.
        var err = new Error("Genre not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      console.log(genre);
      res.render("genre_form", { title: "Update Genre", genre: genre });
    });
  };
  

// Handle Genre update on POST.
exports.genre_update_post = [
    // Validate and sanitze the name field.
    body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),
    body("description", "Genre description required").trim().isLength({ min: 1, max: 500 }).escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
      // Extract the validation errors from a request .
      const errors = validationResult(req);
  
      // Create a genre object with escaped and trimmed data (and the old id!)
      var genre = new Genre({
        name: req.body.name,
        description: req.body.description,
        _id: req.params.id,
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values and error messages.
        res.render("genre_form", {
          title: "Update Genre",
          genre: genre,
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid. Update the record.
        Genre.findByIdAndUpdate(
          req.params.id,
          genre,
          {},
          function (err, thegenre) {
            if (err) {
              return next(err);
            }
            // Successful - redirect to genre detail page.
            res.redirect(thegenre.url);
          }
        );
      }
    },
  ];