const Item = require("../models/item");
const Genre = require("../models/category");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.index = (req, res) => {
  async.parallel(
    {
      record_count(callback) {
        Item.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      genre_count(callback) {
        Genre.countDocuments({}, callback);
      },
    },
    (err, results) => {
      console.log(results);
      res.render("index", {
        title: "Records Inventory Home",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all records.
exports.record_list = function (req, res, next) {
  Item.find({}, "title quantity")
    .sort({ title: 1 })
    .populate("genre")
    .exec(function (err, list_records) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("record_list", { title: "Records List", record_list: list_records });
    });
};

// Display detail page for a specific record.
exports.record_detail = (req, res) => {
  async.parallel(
    {
      record(callback) {
        Item.findById(req.params.id)
          .populate("genre")
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.record == null) {
        // No results.
        const err = new Error("Record not found");
        err.status = 404;
        return next(err);
      }
      console.log(results.record.genre.name);
      // Successful, so render.
      res.render("record_detail", {
        title: results.record.title,
        record: results.record,
      });
    }
  );
};

// Display record create form on GET.
exports.record_create_get = (req, res) => {
  async.parallel(
    {
      genres(callback) {
        Genre.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("record_form", {
        title: "Create Record",
        genres: results.genres,
      });
    }
  );
};


// Handle record create on POST.
exports.record_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("artist", "Artistmust not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Record object with escaped and trimmed data.
    const record = new Item({
      title: req.body.title,
      artist: req.body.artist,
      description: req.body.description,
      format: req.body.format,
      release: req.body.release,
      rating: req.body.rating,
      price: req.body.price,
      quantity: req.body.quantity,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      // Get all genres for form.
      async.parallel(
        {
          genres(callback) {
            Genre.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (const genre of results.genres) {
            if (record.genre.includes(genre._id)) {
              genre.checked = "true";
            }
          }
          res.render("record_form", {
            title: "Create Record",
            genres: results.genres,
            record,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Save record.
    record.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new record record.
      res.redirect(record.url);
    });
  },
];

// Display record delete form on GET.
exports.record_delete_get = (req, res) => {
  async.parallel(
    {
      record(callback) {
        Item.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.record == null) {
        // No results.
        res.redirect("/records");
      }
      // Successful, so render.
      res.render("record_delete", {
        title: "Delete Record",
        record: results.record,
      });
    }
  );
};

// Handle record delete on POST.
exports.record_delete_post = (req, res, next) => {
  async.parallel(
    {
      record(callback) {
        Item.findById(req.body.recordid).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      Item.findByIdAndRemove(req.body.recordid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to records list
        res.redirect("/records");
      });
    }
  );
};

// Display record update form on GET.
exports.record_update_get = (req, res, next) => {
  // Get record, authors and genres for form.
  async.parallel(
    {
      record(callback) {
        Item.findById(req.params.id)
          .populate("genre")
          .exec(callback);
      },
      genres(callback) {
        Genre.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.record == null) {
        // No results.
        const err = new Error("Record not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected genres as checked.
      for (const genre of results.genres) {
        for (const recordGenre of results.record.genre) {
          if (genre._id.toString() === recordGenre._id.toString()) {
            genre.checked = "true";
          }
        }
      }
      res.render("record_form", {
        title: "Update Record",
        genres: results.genres,
        record: results.record,
      });
    }
  );
};

// Handle book update on POST.
exports.record_update_post = [
  // Convert the genre to an array
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("artist", "Artistmust not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a record object with escaped and trimmed data.
    const record = new Item({
      title: req.body.title,
      artist: req.body.artist,
      description: req.body.description,
      format: req.body.format,
      release: req.body.release,
      rating: req.body.rating,
      price: req.body.price,
      quantity: req.body.quantity,
      genre: req.body.genre,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          genres(callback) {
            Genre.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (const genre of results.genres) {
            if (record.genre.includes(genre._id)) {
              genre.checked = "true";
            }
          }
          res.render("record_form", {
            title: "Update Record",
            genres: results.genres,
            record,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Item.findByIdAndUpdate(req.params.id, record, {}, (err, therecord) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to record detail page.
      res.redirect(therecord.url);
    });
  },
];