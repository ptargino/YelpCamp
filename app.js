var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/yelp_camp', {useNewUrlParser: true});
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//Schema setup
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String
});

var Campground = mongoose.model("Campground", campgroundSchema);

app.get("/", function(req, res) {
    res.render("landing");
});

app.get("/campgrounds", function(req, res) {
    Campground.find({}, function(err, campgrounds){
        if(err){
            console.log(err);
        } else {
            res.render('campgrounds', { campgrounds: campgrounds });      
        }
    })
});

app.post("/campgrounds", function(req, res) {
    Campground.create({ name: req.body.name, image: req.body.image }, function(err, campground){
        if(err){
            console.log(err);
        } else {
            console.log("Campground created");
            console.log(campground);
            res.redirect("/campgrounds");
        }
    });
   
});

app.get("/campgrounds/new", function(req, res) {
    res.render("new")
})

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("YelpCamp has started!!!");
});
