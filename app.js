var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    seedDB = require("./seeds");

mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true });
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
seedDB();

//PASSPORT CONFIGURATION
app.use(require("express-session")({ secret: "Klapaucius", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

app.get("/", (req, res) => res.render("landing"));

app.get("/campgrounds", function(req, res) {
    Campground.find({}, function(err, campgrounds) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("campgrounds/index", { campgrounds: campgrounds });
        }
    })
});

//CREATE - add new campground to DB
app.post("/campgrounds", isLoggedin, function(req, res) {
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = { name: name, image: image, description: desc }
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated) {
        if (err) {
            console.log(err);
        }
        else {
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

app.get("/campgrounds/new", isLoggedin, (req, res) => res.render("campgrounds/new"));

app.get("/campgrounds/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });

});

// ======== COMENTS ROUTES ======

app.get("/campgrounds/:id/comments/new", isLoggedin, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("comments/new", { campground: campground });
        }
    })

});

app.post("/campgrounds/:id/comments", isLoggedin, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds/");
        }
        else {
            Comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    console.log(err)
                }
                else {
                    campground.comments.push(comment);
                    campground.save();
                }
            });
            res.redirect("/campgrounds/" + campground._id);
        }
    })
});

app.get('/register', (req, res) => res.render('register'));
app.post('/register', (req, res) => User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
    if (err) {
        console.log(err);
        return res.render('register');
    }
    passport.authenticate('local')(req, res, () => res.redirect('/campgrounds'));
}));

app.get('/login', (req, res) => res.render('login'));
app.post('/login', passport.authenticate('local', { successRedirect: '/campgrounds', failureRedirect: '/login' }), (req, res) => {});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('campgrounds');
});

function isLoggedin(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}

app.listen(process.env.PORT, process.env.IP, () => console.log("YelpCamp has started!!!"));
