var express = require("express");
var router = express.Router();
var User = require("../models/user.js");
var UserThing = require("../models/userThing.js");
var GlobalThing = require("../models/globalThing.js");
var middleware = require("./middleware.js");

// All routes /mythings root

// Show All My Things
router.get("/", middleware.isLoggedIn, function(req, res) {
  var things = UserThing.find();
  User.findOne({username: req.user.username})
  .populate({
    path: "things",
    populate: {
      path: "globalThing",
      model: "GlobalThing"
    }
  })
  .exec(function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      console.log(user);
      res.render("mythings", {user: user, things: things});
    }
  })
  // UserThing.find({}, function(err, myThings) {
  //   if(err) {
  //     console.log(err);
  //   } else {
  //     res.render("mythings", {myThings: myThings});
  //   }
  // })
});

// Submit form for a new thing
router.post("/", middleware.isLoggedIn, function(req, res) {
  User.findOne({username: req.user.username}, function (err, foundUser) {
    if (err) {
      console.log(err);
      req.flash("error", "Something went wrong!");
      res.redirect("/mythings");
    } else {
      GlobalThing.findOne({name: req.query.name}), function(err, foundGlobalThing) {
        if(err) {
          console.log(err);
        } else {
          console.log(foundGlobalThing);
          var newThing = {
            globalThing: foundGlobalThing,
            purchaseDate: req.body.purchaseDate,
            purchasePrice: req.body.purchasePrice
          };
          UserThing.create(newThing, function(err, addedThing) {
            if (err) {
              console.log(err);
              req.flash("error", "Something went wrong!");
              res.redirect("/mythings");
            } else {
              addedThing.save();
              foundUser.things.push(addedThing);
              foundUser.save();
              req.flash("success", "Thing added!");
              res.redirect("/mythings");
            }
          });
        }
      }
    }
  })
})

// Form to create a new thing
router.get("/new", function(req, res) {
  var newThingName = req.query.name;
  var newThingType = req.query.type;
  res.render("things/new", {newThingName: newThingName, newThingType: newThingType});
})

// Show a single Thing page
router.get("/:id", function(req, res) {
  UserThing.findById(req.params.id, function(err, foundThing) {
    if (err) {
      console.log(err);
      res.redirect("mythings");
    } else {
      res.render("things/show", {thing: foundThing});
    }
  })
})

// Edit a single Thing
router.get("/:id/edit", function(req, res) {
  UserThing.findById(req.params.id, function(err, foundThing) {
    if (err) {
      console.log(err);
      res.redirect("mythings");
    } else {
      res.render("things/edit", {thing: foundThing});
    }
  })
});

// Update a single Thing
router.put("/:id", function(req, res) {
  UserThing.findByIdAndUpdate(req.params.id, req.body.thing, function(err, updatedThing) {
    if (err) {
      res.redirect("mythings");
    } else {
      req.flash("success", "Thing updated!");
      res.redirect("/mythings/" + req.params.id);
    }
  })
});

// Use a single Thing
router.get("/:id/use", function(req, res) {
  UserThing.findById(req.params.id, function(err, foundThing) {
    if (err) {
      console.log(err);
      res.redirect("mythings");
    } else {
      res.render("things/use", {thing: foundThing});
    }
  })
});

// Add a use to a single Thing
router.put("/:id/use", function(req, res) {
  // var addedUse = req.body.use;
  // User.findOne({current user}, function (err, foundUser) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     foundUser.things[usageDates].push(addedUse);
  //   }
  // })
  UserThing.findByIdAndUpdate(req.params.id, req.body.use, function(err, addedUse) {
    if (err) {
      console.log(err);
      // res.redirect somewhere
    } else {
      req.flash("success", "Use added!");
      res.redirect("/mythings/" + req.params.id);
    }
  })
})



module.exports = router;
