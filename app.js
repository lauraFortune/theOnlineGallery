//===============================================================================================//
//                                                                                                                                                                                              //
//                                                             APPLICATION SETUP                                                                                                     //     
//                                                                                                                                                                                              //
//===============================================================================================//
//dev dependencies
var dotenv = require('dotenv').config();
var express = require("express"); 
var app = express();
var bodyParser = require("body-parser");
var mysql = require('mysql'); 
var fs = require('fs'); 

//authentication dependencies
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var localStorage = require('node-localstorage');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var auth = require('./middleware/auth.js');
var bcrypt = require('bcrypt-nodejs');

//=========================== JSON MODELS =======================================================//
var jsonArtists = require("./model/artists.json"); // var to store artists json
var jSonartWorks = require("./model/artWorks.json"); // var to store json artwroks

//============================ CONFIGURATION  =======================================================//
app.set('view engine', 'ejs'); 
app.use(express.static("views")); //make views folder available 
app.use(express.static("style")); //make styles folder available
app.use(express.static("images")); //make images folder available
app.use(express.static("javascript")); //make javascript folder available
app.use(express.static("media/images")); //application images
app.use(express.static("media/profiles")); //profile images of members
app.use(express.static("media/artists")); //images of artists
app.use(express.static("media/artwork")); //images of artwork
app.use(bodyParser.urlencoded({extended:true})); //reads data from body
app.use(cookieParser()); //read cookies (needed for authentication)

app.use(session({ // required for passport
	secret: 'Itsasecretshhhh',
	resave: true,
	saveUninitialized: true
} )); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session 

//global vars
var catsArray = []; //this is required by two different requests below, so I have declared up here 

//===============================================================================================//
//                                                                                                                                                                                              //
//                                                             PASSPORT LOGIC                                                                                                         //     
//                                                                                                                                                                                              //
//===============================================================================================//

//session
passport.serializeUser(function(user, done) { // serialize user for the session
    done(null, user.Id); 
});

passport.deserializeUser(function(Id, done) { // deserialize user out of session
    db.query("SELECT * FROM users WHERE Id = ? ",[Id], function(err, rows){
        done(err, rows[0]);
    });
});

//registration logic
passport.use(
    'local-signup',
    new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        db.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
            if (err)
                return done(err);
            if (rows.length) {
                return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
            } else {
                // if there is no user with that username
                // create the user
                var newUserMysql = {
                    username: username,
                    email: req.body.email,
                    password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                };

                var insertQuery = "INSERT INTO users ( username, email, password ) values (?,?,?)";

                db.query(insertQuery,[newUserMysql.username, newUserMysql.email, newUserMysql.password],function(err, rows) {
                    newUserMysql.Id = rows.insertId;

                    return done(null, newUserMysql);
                });
            }
        });
    })
);

//login logic
passport.use(
    'local-login',
    new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with email and password from our form
        db.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
            if (err)
                return done(err);
            if (!rows.length) {
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            }

            // if the user is found but the password is wrong
            if (!bcrypt.compareSync(password, rows[0].password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, rows[0]);
        });
    })
);

//===============================================================================================//
//                                                                                                                                                                                              //
//                                                             REGISTER ROUTES                                                                                                        //     
//                                                                                                                                                                                              //
//===============================================================================================//
// get register page
app.get('/register', function(req, res){
    res.render('register'); //render the page and pass in any flash data if it exists
});

//post register form
app.post('/register', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/register', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

//===============================================================================================//
//                                                                                                                                                                                              //
//                                                             LOGIN ROUTES                                                                                                            //     
//                                                                                                                                                                                              //
//===============================================================================================//

// get login page
app.get('/login', function(req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });// render the page and pass in any flash data if it exists
});

// post login form
app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}),
function(req, res) {
    if (req.body.remember) {
      req.session.cookie.maxAge = 365 * 24 * 60 * 60 * 1000; //1000 * 60 * 3;
    } else {
      req.session.cookie.expires = false;
    }
res.redirect('/');
});

// get logout
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});



//===============================================================================================//
//                                                                                                                                                                                              //
//                                                             PROFILE ROUTES                                                                                                          //     
//                                                                                                                                                                                              //
//===============================================================================================//
//get profile page
app.get('/profile', auth.isLoggedIn, function(req, res) { // isLoggedIn, 
	res.render('profile', {
		user : req.user // get the user out of session and pass to template
	});
});

//get edit profile page
app.get('/editProfile/:id', auth.isLoggedIn, function(req,res){
    let sql = 'SELECT * FROM users WHERE Id =  "'+req.params.id+'" ';
    let query = db.query(sql, (err,result) => {
        if(err) throw err;
        res.render('editProfile', {result, user: req.user})
    });
})

//post edit profile form
app.post('/editProfile/:id', function(req,res){
    let sql = 'UPDATE users SET about ="'+req.body.about+'", image ="'+req.body.image+'", phonenumber ="'+req.body.phonenumber+'" WHERE Id =  "'+req.params.id+'" ';
    let query = db.query(sql, (err,res) => {
        if(err) throw err;
    });
    res.redirect('/profile'); //redirects to updated profile
})

//post edit profile form
app.post('/editMemberProfile/:id', function(req,res){
    let sql = 'UPDATE users SET about ="'+req.body.about+'", image ="'+req.body.image+'", phonenumber ="'+req.body.phonenumber+'" WHERE Id =  "'+req.params.id+'" ';
    let query = db.query(sql, (err,res) => {
        if(err) throw err;
    });
    res.redirect('/profiles'); //redirects to updated profile
})

//delete profile
app.get('/deleteProfile/:id', function(req,res){
    let sql = 'DELETE FROM users WHERE Id =  "'+req.params.id+'" ';
    let query = db.query(sql, (err,result) => {
        if(err) throw err;
    });
    res.redirect('/profiles')
})
//===============================================================================================//
//                                                                                                                                                                                              //
//                                                             ADMIN ROUTES                                                                                                            //     
//                                                                                                                                                                                              //
//===============================================================================================//
//get admin page
app.get('/admin', auth.isLoggedIn, auth.isAdmin, function(req, res) { 
    res.render('admin', {
		user : req.user // get the user out of session and pass to template
	});
});

//get ALL user profiles page
app.get('/profiles', function(req,res){
    let sql = 'SELECT * FROM users';
    let query = db.query(sql, (err,result) => {
        if(err) throw err;
        res.render('profiles', {result})
    });
})

//get admin gallery page
app.get('/gallery', function(req, res){ 
    var filtered =  jSonartWorks;
    var catsArray = [];

    jSonartWorks.forEach(function(el) { 
        if(catsArray.includes(el.category) == false && el.category != null){ //if catsArray does not already include category OR is not undefined
            catsArray.push(el.category); 
        }   
    });

    function filterByCat(el) { //filters artWorks.json - returns array of objects that have a category match
        var category = []; // category = empty array
    
        for (var i = 0; i < jSonartWorks.length; i++){ 
            if( jSonartWorks[i].category.toLowerCase().replace(/\s+/g, '') == el.toLowerCase().replace(/\s+/g, '')){ //white space removed and convert to lower case on both sides - so can be fairly compared
            category.push( jSonartWorks[i]);
            }
        }
        return category; 
    };
    var newCategory = req.query.category;
    if (newCategory != undefined){ //if newCategory has a value(only will after category is clicked - not on page load!)
        filtered = filterByCat(newCategory); //filtered is now equal to a filtered version of artWorks.json(only 'cat' matches) - we pass to gallery.ejs when we re render the page on cat click
    }
    res.render("gallery", {jSonartWorks, catsArray, filtered}); //pass the variables we need access to on gallery page inside {here!} 
});

//get addArtwork page
app.get('/addArtwork', function(req, res){
    res.render("addArtwork"); 
});

//post add artwork form (to json file)
app.post("/addArtwork", function(req, res){
    function getMax(el, id) { //1. find the largest id in json file
        var max;
        for(var i = 0; i < el.length; i++) {
            if(!max || parseInt(el[i][id]) > parseInt(max[id]))  //if it isn't the biggest number then...
            max = el[i];                  
        }
        return max;
    }
    maxCid = getMax(jSonartWorks, "id"); //2. made a new ID for the next item in the json file
    var newId = maxCid.id +1; 
    var newArtWork = { //3. get access to user input in form and pass to our JSON file as the new data 
        id: newId,
        image: req.body.image,
        artName: req.body.artName,
        artist: req.body.artist,
        category: req.body.category,
        medium: req.body.medium,
        sizeIn: req.body.sizeIn,
        sizeCm: req.body.sizeCm
    }
    fs.readFile('./model/artWorks.json', 'utf8', function readfileCallback(err){
        if (err) {
            throw(err)
        }   else {
            jSonartWorks.push(newArtWork); // add the new data to the JSON file
            json = JSON.stringify(jSonartWorks, null, 4); //this line structures the JSON so it is easy on the eye
            fs.writeFile('./model/artWorks.json', json, 'utf8',function(){});
        }
    })
    res.redirect('/gallery');
});

//get edit artwork page
app.get('/editArtwork/:id', function(req, res){
    function findartWork(el) {
        return el.id === parseInt(req.params.id);
    }    
    var artWork = jSonartWorks.filter(findartWork);
    res.render("editArtwork", {res:artWork});
});

//post edit artwork form
app.post('/editArtwork/:id', function(req, res){
    var json = JSON.stringify(jSonartWorks);// stringify our JSON data 
    var keyToFind = parseInt(req.params.id);  //declare incoming id from url as variable --id = param(not actual id) 
    var index = jSonartWorks.map(function(el) {return el.id}).indexOf(keyToFind);// map data 
    var sameId = parseInt(req.params.id); //user must not be allowed to change id
    var newImage = req.body.image;
    var newArtName = req.body.artName;
    var newArtist = req.body.artist;
    var newCategory = req.body.category;
    var newMedium = req.body.medium;
    var newsizeIn = req.body.sizeIn;
    var newsizeCm = req.body.sizeCm;
    jSonartWorks.splice(index, 1, {id: sameId, image: newImage, artName: newArtName, artist: newArtist, category: newCategory, medium: newMedium, sizeCm: newsizeCm, sizeIn: newsizeIn});//push the new data into json using a splice()
    json = JSON.stringify(jSonartWorks, null, 4);// build actual information based on changes made by user
    fs.writeFile('./model/artWorks.json', json, 'utf8',function(){});// reformat JSON and push back to actual file
    res.redirect("/gallery");
});

//delete artwork
app.get('/deleteArtwork/:id', function(req, res){
    var keyToFind = parseInt(req.params.id);
    var index = jSonartWorks.map(function(el) {return el.id}).indexOf(keyToFind);
    jSonartWorks.splice(index ,1);
    var json = JSON.stringify(jSonartWorks);
    fs.writeFile('./model/artWorks.json', json, 'utf8',function(){});
    res.redirect("/gallery");
});

//get admin artists page
app.get('/artists', function(req, res){
    var filteredArtists =  jsonArtists;
    res.render("artists", {jsonArtists, filteredArtists});
});

//get add artist page
app.get('/addArtist', function(req, res){
    res.render("addArtist"); 
  });

//post add artist form
app.post("/addArtist", function(req, res){//post request to send JSON data to server
    function getMax(el, id) { // find largest artist id
        var max;
        for(var i = 0; i < el.length; i++) {
            if(!max || parseInt(el[i][id]) > parseInt(max[id]))  //if it isn't the biggest number then...
            max = el[i];                  
        }
        return max;
    }
   maxCid = getMax(jsonArtists, "id");
   var newId = maxCid.id +1; 
   var newArtist = {
        id: newId,
        image: req.body.image,
        name: req.body.name,
        tel: req.body.tel,
        email: req.body.email,
        nationality: req.body.nationality,
        bio: req.body.bio
    }
    fs.readFile('./model/artists.json', 'utf8', function readfileCallback(err){
        if (err) {
            throw(err)
        }   else {
            jsonArtists.push(newArtist);
            json = JSON.stringify(jsonArtists, null, 4);
            fs.writeFile('./model/artists.json', json, 'utf8',function(){});
        }
    })
    res.redirect('/artists');
});

//get edit artist page
app.get('/editArtist/:id', function(req, res){ 
    function findArtist(el) {
        return el.id === parseInt(req.params.id);
    }
    var artist = jsonArtists.filter(findArtist);
    res.render("editArtist", {res:artist});
})

//post edit artist form
app.post('/editArtist/:id', function(req, res){
    var json = JSON.stringify(jsonArtists);
    var keyToFind = parseInt(req.params.id); 
    var index = jsonArtists.map(function(el) {return el.id}).indexOf(keyToFind);
    var sameId = parseInt(req.params.id);  //user must not be allowed to change id
    var newImage = req.body.image;
    var newName = req.body.name;
    var newTel = req.body.tel;
    var newEmail = req.body.email;
    var newNationality = req.body.nationality;
    var newBio = req.body.bio;
    jsonArtists.splice(index, 1, {image: newImage, name: newName, tel: newTel, email: newEmail, nationality: newNationality, bio: newBio, id: sameId});
    json = JSON.stringify(jsonArtists, null, 4);
    fs.writeFile('./model/artists.json', json, 'utf8',function(){});
    res.redirect("/artists");
});

//delete artist
app.get('/deleteArtist/:id', function(req, res){

    var keyToFind = parseInt(req.params.id); //1. id of artist

    var index = jsonArtists.map(function(el) {return el.id}).indexOf(keyToFind); //2. artists index number in array

    jsonArtists.splice(index ,1); //3. delete artist from from array

    var json = JSON.stringify(jsonArtists); //4. stringify before sending

    fs.writeFile('./model/artists.json', json, 'utf8',function(){}); //5. rewrite Json file with newly deleted artist

    res.redirect("/artists"); //6. redirect to artists admin gallery
});

//search artwork (by artist name)
app.post('/search', function(req,res){ 
    let input =req.body.search;
    function filterByArtist(el) { 
        var artists = [];
         for (var i = 0; i < jSonartWorks.length; i++){ 
            if( jSonartWorks[i].artist.toLowerCase().replace(/\s+/g, '') == el.toLowerCase().replace(/\s+/g, '')){ 
            artists.push( jSonartWorks[i]); 
                }
            else{
                console.log("no artist in database");
            }
         }
        return artists;
    };
    filtered = filterByArtist(input);
    res.render("gallery", {jSonartWorks, catsArray, filtered}); 
})

//search artists (by artist name)
app.post('/searchArtists', function(req,res){ //Artists Admin Search
    let input =req.body.searchArtists;
    function filterByArtist(el) { 
        var artist = [];
         for (var i = 0; i < jsonArtists.length; i++){ 
            if( jsonArtists[i].name.toLowerCase().replace(/\s+/g, '') == el.toLowerCase().replace(/\s+/g, '')){ 
            artist.push( jsonArtists[i]); 
                }
            else{
                console.log("Cannot find Artist");
            }
         }
        return artist;
    };
    filteredArtists = filterByArtist(input); 
    res.render("artists", {jsonArtists, filteredArtists});
})

//SQL search profiles(members) by username
app.post('/searchUsers', function(req,res){
    let sql = 'SELECT * FROM users WHERE username LIKE  "%'+req.body.searchUsers+'%" ';
        let query = db.query(sql, (err,result) => {
            if(err) throw err;
            res.render('profiles', {result})
        });
})

//===============================================================================================//
//                                                                                                                                                                                              //
//                                                             GALLERY ROUTES                                                                                                         //     
//                                                                                                                                                                                              //
//===============================================================================================//
//get landing page
app.get('/', function(req, res){
res.render("index");
});

//get public gallery page
app.get('/userGallery', auth.isLoggedIn, function(req, res){
    var filtered =  jSonartWorks;
    
    function filterByCat(el) { //filters artWorks.json - returns array of objects that have a category match
        var category = []; 
        
        for (var i = 0; i < jSonartWorks.length; i++){ 
            if( jSonartWorks[i].category.toLowerCase().replace(/\s+/g, '') == el.toLowerCase().replace(/\s+/g, '')){ //white space removed and convert to lower case on both sides - so can be fairly compared
            category.push( jSonartWorks[i]); //push json object(if 'cat' matches) into category array
            }
        }
        return category; 
    };

    var newCategory = req.query.category;

    if (newCategory != undefined){ 
        filtered = filterByCat(newCategory); 
    }
    res.render("userGallery", {jSonartWorks, catsArray, filtered});
});

//get public artists page
app.get('/userArtists', auth.isLoggedIn, function(req, res){
    var filteredArtists =  jsonArtists;
    res.render("userArtists", {jsonArtists, filteredArtists});
});

//search gallery artwork (by artist name)
app.post('/userSearch', function(req,res){
    
    let input =req.body.userSearch;

    function filterByArtist(el) { 
        var artists = [];
         for (var i = 0; i < jSonartWorks.length; i++){ 
            if( jSonartWorks[i].artist.toLowerCase().replace(/\s+/g, '') == el.toLowerCase().replace(/\s+/g, '')){ 
            artists.push( jSonartWorks[i]); 
                }
            else{
                console.log("no artist in database");
            }
         }
        return artists;
    };
    filtered = filterByArtist(input);
    res.render("userGallery", {jSonartWorks, catsArray, filtered}); 
})


//===============================================================================================//                                                                                                                                                                                            //
//                                                  DATABASE SETUP -SQL  QUERIES                                                                                               //                                                                                                                                                                                         //
//===============================================================================================//
// //CREATE USERS TABLE
// app.get('/createusers', function(req, res){
//     let sql = 'CREATE TABLE users (Id int NOT NULL AUTO_INCREMENT PRIMARY KEY, username varchar(255), email varchar(255), password varchar(255), nationality varchar(255), phonenumber varchar(50), image varchar(50), admin BOOLEAN DEFAULT FALSE);'
//     let query = db.query(sql, (err,res) => {
//      if(err) throw err;
//     });
//     res.send("Created Users Table!");
//     });
//     //visit  'http://localhost:3000/createusers' to create the users table - Only do once!

// //CREATE ADMIN
// app.get('/makeAdmin', function(req, res){
//     let sql = "UPDATE users SET admin = true WHERE username = 'Admin'"; 
//      let query = db.query(sql, (err, res) => {
//       if(err) throw err;
//      console.log(res); 
//      });
//      res.send("Made an admin!");
//      });
//     //visit  'http://localhost:3000/makeAdmin' to create an admin user

 //===============================================================================================//                                                                                                                                                                                             //
//                                                    DB CONNECTION SETUP                                                                                                        //                                                                                                                                                                                              //
//===============================================================================================//
//db details 
 const db = mysql.createConnection({ //mysql var was created to require mysql
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB
});

//create connection
db.connect((err) =>{
    if(err){
        console.log("Go back and check the connection details. Something is wrong!");
        // throw(err)
    }
    else{
        console.log("Database connected: '" + process.env.DB  + "'")
    }
});
//===============================================================================================//                                                                                                                                                                                            //
//                                                    START THE SERVER                                                                                                                 //                                                                                                                                                                                                //
//===============================================================================================//
//this code provides the server port for our application to run on
app.listen(process.env.PORT, function() {
    console.log("Application Running: 'The Online Gallery'");
});


