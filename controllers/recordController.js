const Item = require("../models/item");
const Genre = require("../models/category");
const async = require("async");

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

// Display list of all books.
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

// Display detail page for a specific book.
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
        const err = new Error("Book not found");
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

// Display book create form on GET.
exports.record_create_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Record create GET");
};

// Handle book create on POST.
exports.record_create_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Record create POST");
};

// Display book delete form on GET.
exports.record_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Record delete GET");
};

// Handle book delete on POST.
exports.record_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Record delete POST");
};

// Display book update form on GET.
exports.record_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Record update GET");
};

// Handle book update on POST.
exports.record_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Record update POST");
};