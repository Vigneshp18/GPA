const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fs = require("fs");
const mongoose = require("mongoose");
const MongoStore = require('connect-mongo');
var session = require("express-session");

const app = express();
var username = "";
var userid = "";
var verify = false;
var values = [];
var vX = [];
var vY = [];
var nodemailer = require('nodemailer');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

app.use(session({
    secret: "success",
    resave: false,
    saveUninitialized: true,
    crypto: {
        secret: 'squirrel'
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL,
        ttl: 60 * 60,
        autoRemove: 'native'
    })
}));

mongoose.connect(process.env.MONGODB_URL);

const userSchema = new mongoose.Schema({
    username: String,
    authX: Array,
    authY: Array,
    authimg: Array,
    status: Boolean,
    verify: Boolean
}, 
{ collection : 'gpa_users' });

const User = mongoose.model("User", userSchema)

//main
app.get("/", function(req, res) {
    res.render("login");
});

app.get("/l-password", function(req, res) {
    res.render("logpassword");
});

//login
app.get("/login", function(req, res) {
    res.render("login");
});


app.post("/login", function(req, res) {
    username = req.body.username;
    if(typeof req.session.user?.uuid === 'undefined')
    {        
        User.find({'username': username}, function (err, docs) {
            if (err){
                console.log(err);
            }
            else{
                if(Object.keys(docs).length === 1){
                    if(docs[0].verify) {
                        verify = docs[0].verify;
                        res.redirect("/auth");
                    }
                    else {
                        res.render("verify");
                    }
                }
                else {
                    return res.redirect("not-register");
                }
            }
        });
    }
    else {
        User.find({'username': username}, function (err, docs) {
            if (err){
                console.log(err);
            }
            else{
                if(docs[0]._id == req.session.user.uuid) {
                    res.redirect("home");
                }
                else {
                    res.redirect("/auth");
                }
            }
        });
    }
});

function sendEmailWithTemplate(toEmail, subject, templateFile) {
  try {
    // Read EJS template file
    const templateString = fs.readFileSync(templateFile, 'utf8');

    // Render the EJS template with data
    const renderedHTML = ejs.render(templateString, {time: new Date().toLocaleString('en-IN', {timeZone: 'IST'})});

    var transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
});

    // Send email
    transporter.sendMail({
      from: process.env.FROM,
      to: toEmail,
      subject: subject,
      html: renderedHTML
    });

    console.log("Email Sent Successfully");
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
      return false;
  }
}

app.get("/auth", function(req,res) {
    if(username)
    {
    User.find({'username': username}, function (err, docs) {
        if (err){
            console.log(err);
        }
        else{
            if(Object.keys(docs).length === 0) {
                return res.redirect("not-register");
            }
            else {
                if(docs[0]._doc.verify){
                    if(docs.length) {
                        var vXTemp = docs[0]._doc.authX;
                        var vYTemp = docs[0]._doc.authY;
                        vX = vXTemp.map(Number);
                        vY = vYTemp.map(Number);
                        userid = docs[0]._doc._id;
                        values = Object.values(docs[0]._doc.authimg);
                        res.render('logpassword',{'img1':values[0],'img2':values[1],'img3':values[2]});
                    }
                    else {
                        res.redirect("authfailure");
                    }
                }
                else {
                    res.redirect('verify');
                }
            }
        }
    });
}
else {
    res.redirect("authfailure");
}
});

app.post("/logpassword", function(req, res) {
    var coordX = req.body.coordX;
    var coordY = req.body.coordY;
    var cXTemp = coordX.split(",");
    var cYTemp = coordY.split(",");
    var cX = cXTemp.map(Number);
    var cY = cYTemp.map(Number);
    if((vX[0]-30 <= cX[0] && cX[0] <= vX[0]+30) && (vX[1]-30 <= cX[1] && cX[1] <= vX[1]+30) && (vX[2]-30 <= cX[2] && cX[2] <= vX[2]+30)) {
        if((vY[0]-30 <= cY[0] && cY[0] <= vY[0]+30) && (vY[1]-30 <= cY[1] && cY[1] <= vY[1]+30) && (vY[2]-30 <= cY[2] && cY[2] <= vY[2]+30)) {
            req.session.user = {
                uuid: userid,
            }
            req.session.save();
            res.redirect("/home");
        }
        else {
            sendEmailWithTemplate(username, 'UnAuthorized Access to Account', 'views/mailtemp.ejs');
            res.redirect("authfailure");
        }
    }
    else {
        sendEmailWithTemplate(username, 'UnAuthorized Access to Account', 'views/mailtemp.ejs');
        res.redirect("authfailure");
    }
});

//register
app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {
    User.find({'username': req.body.username}, function (err, docs) {
        if (err){
            console.log(err);
        }
        else{
            if(docs.length == 0) {
                username = req.body.username;
                res.redirect('select');
            }
            else {
                return res.redirect("already-register");
            }
        }
    });
});

app.get("/select", function(req,res){
    if(username){
        res.render('select');
    }
    else {
        res.redirect("authfailure");
    }
})

app.post("/select", function(req,res) {
    values = Object.values(req.body);
    res.redirect("regpassword");
});

app.get("/regpassword", function(req,res){
    if(username) {
        res.render("regpassword",{'img1':values[0],'img2':values[1],'img3':values[2]});
    }
    else {
        res.redirect("authfailure");
    }
})

app.post("/regpassword", function(req, res) {
    var coordX = req.body.coordX;
    var coordY = req.body.coordY;
    var cX = coordX.split(",");
    var cY = coordY.split(",");
    var myData = new User({
        username: username,
        authX: [cX[0],cX[1],cX[2]],
        authY: [cY[0],cY[1],cY[2]],
        authimg: values,
        status: true,
        verify: false,
    });
    myData.save();
    res.redirect("mail");
});

//home
app.get("/home", function(req, res) {
    if(typeof req.session.user?.uuid === 'undefined') {
        res.redirect("authfailure");
    }
    else {
        console.log(req.session.user.uuid);
        res.render("home");
    }
});

//common
app.get("/verify", function(req, res) {
    if(verify) {
        res.redirect("/auth");
    }
    else {
        res.render("verify");
    }
});

app.get("/mail", function(req, res){
    User.find({'username': username}, function (err, docs) {
        if (err){
            console.log(err);
        }
        else{

            var transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
});
            
            const mailOptions = {
                from: process.env.FROM,
                to: username,
                subject: 'Verification Email',
                text: 'This is the Verification Email to activate your account - '+'https://gpa-pzn0.onrender.com/authverify?uname='+username+'&auth='+docs[0]._id.toString()
            }
            
            transporter.sendMail(mailOptions, function(error, response){
                if(error){
                    console.log(error);
                }    else{
                    console.log('mail sent');
                } 
            });
        }
    });
    res.render('sendmail');
});

app.get("/authverify",function(req,res){
    var uname = req.query.uname;
    var authVal = req.query.auth;
    if(uname) {
        User.find({'username': uname, '_id': authVal}, function (err, docs) {
            if (err){
                console.log(err);
            }
              else{
                User.updateOne({'username': uname},{ $set: { verify: true } },
                (err, doc) => {
                if (!err) {
                    res.redirect("/authsuccess");
                }
                else {
                    console.log(err);
                    res.status(200).send("Failed to Verify the Account");
                }
                });
            }
        });
    }
    else {
        res.redirect("authfailure");
    }
});

app.get("/authsuccess",(req,res)=>{
    res.render("authsuccess");
})

app.get("/authfailure",(req,res)=>{
    res.render("authfailure");
})

app.get("/already-register", (req, res) => {
    res.render("emailAlreadyRegister");
});

app.get("/not-register", (req, res) => {
    res.render("emailNotRegister");
});

app.get("/logout",(req,res)=>{
    req.session.destroy();
    res.render("logout");
})

//PORT
app.listen(process.env.PORT || 3000, function() {
    console.log("Server started on port 3000");
});
