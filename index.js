// Require modules
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const mysql = require("mysql");
const joi = require('joi');

// Express app object
const app = express();

// Register the middleware
app.use(express.static('static'));
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());

// Session cookie
app.use(session({
    secret:'crmorytp8vyp98p%&ADIB66^^&fjdfdfaklfdhf',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60000}
}));

// Define schema for joi validation
const schema = joi.object().keys({
    username: joi.string().alphanum().min(3).max(20).required(),
    password: joi.string().regex(/^[a-zA-Z0-9]{8,20}$/).min(8).max(20)
}).with('username', 'password');

const schemaUpload = joi.object().keys({
    uploadFile: joi.string().regex(/\.(?:jpg|gif|png)/)
});

// Database connection config
const connection = mysql.createConnection({
    // Enable multiple statement queries
    // Separate each statement with a semi-colon ;
    // Result will be an array for each statement
    multipleStatements: true,   
    host: "localhost",
    user: "root",
    password: "",
    database: "imageboard",
});

// Connect to database
connection.connect( err => {
    (err)? console.log("Error connecting to Database" + err) : console.log("Connected to Database");
});

// Variables for testing
//const sessionTest = true;


//////////////////////
// Configure routes //
//////////////////////

// Home page
app.get('/', (req, res) => {

    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    //console.log(userIP);

    // Session data
    const sessionData = req.session.data;  
    const sessionCheck = (sessionData) => {
        return (sessionData) ? sessionData : false;
    };
    const session = sessionCheck(sessionData);



    // SQL
    //const sql ="SELECT * FROM threads";
    const sql = "SELECT threads.*, users.username FROM threads LEFT JOIN users ON threads.thread_opid=users.id"

    connection.query(sql, (err, results) => {
        if (err) {
            res.status(500).send("Database Error!");
        } else {
            if (results.length > 0) {
                // Render index
                //console.log(results)
                res.render('index', {data: results, session: session, uploadMessage: ""});
            } else {
                res.status(500).send("Database is empty!");
            };
        };
    });

    //res.render('index', {sess: sessionTest});    
});

app.get('/threads/:id', (req, res) => {

    // Session data
    const sessionData = req.session.data;  
    const sessionCheck = (sessionData) => {
        return (sessionData) ? sessionData : false;
    };
    const session = sessionCheck(sessionData);
    
    //URL
    const threadUrl = req.params.id;

    //SQL

    const sql_query_1 = "SELECT * FROM threads WHERE id=" + String(threadUrl);        // results[0]
  
    
    const sql_query_2 = "SELECT replies.*, users.username FROM replies LEFT JOIN users ON replies.reply_user_id=users.id WHERE thread_id=" + String(threadUrl); // results[1]

    const sql = sql_query_1 + "; " + sql_query_2;
    console.log(sql);

    connection.query(sql, (err, results) => {
        if(err){
            res.status(500).send("Database Error!");
        } else {
            if(results.length > 0) {

                res.render('thread', {thread: results[0], replies: results[1], session: session});
                console.log("-----FIRST QUERY----")
                console.log(results[0]);
                //console.log("-----SECOND QUERY----");
                //console.log(results[1]);
                console.log("======END=============")
            } else {
                res.status(500).send("Database is empty!");
            }
        }
    })

    //req.params.id
    //USE THREAD ID
});

app.get('/registration', (req, res) => {

    // Session data
    const sessionData = req.session.data;  

    // Registration page is only displayed if the user is not logged in
    if(sessionData){
        res.redirect('/');
    } else {
        res.render('registration', {message: false});
    };
});


app.post('/login', (req, res) =>{

    // Session data
    const sessionData = req.session.data;  

    // Registration page is only displayed if the user is not logged in
    if(sessionData){
        res.redirect('/');
    } else {

        const username = req.body.usernameLogin;
        const password = req.body.passwordLogin;

        // joi validation 
        joi.validate({ username: username, password: password }, schema, (err, value) => {
            if(err){
                res.render('registration', {message: err});
            } else {
                console.log("JOI validation is OK!");

                //SQL
                const sql = "SELECT * FROM users WHERE username='" + String(username) + "' AND password='" + String(password) + "'";

                connection.query(sql, (err, results) => {
                    
                    if(err){
                        res.render('registration', {message: err});

                    } else {
                        if(results.length > 0) {
                            
                            //Create session cookie
                            req.session.data = username;
                            // Reload previous page
                            res.redirect('/');

                        } else {
                            res.render('registration', {message: "ERROR!!! Wrong username or password!"});
                        };
                    };
                });
            };
        });
    };
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.post('/register', (req, res) => {

    // Session data
    const sessionData = req.session.data;  

    // Registration page is only displayed if the user is not logged in
    if(sessionData){
        res.redirect('/');
    } else {
        const username = req.body.usernameRegister;
        const password = req.body.passwordRegister;
        const passwordRepeat = req.body.passwordRegisterRepeat;
        
        // IP ADRESS and exception for testing on localhost problem
        let userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if(userIP === "::1") {
            userIP = "134.226.214.244";
        };

        //Check if the password is correctly repeated
        if(password === passwordRepeat){

            ///////////////////
            joi.validate({ username: username, password: password }, schema, (err, value) => {
                if(err){
                    res.render('registration', {message: err});
                } else {
                    console.log("JOI validation is OK!");
        
                    //SQL CHECK THE USERNAME
                    const sqlTestName = "SELECT * FROM users WHERE username='" + String(username) + "'";
        
                    connection.query(sqlTestName, (err, results) => {
                        
                        if(err){
                            res.render('registration', {message: err});
        
                        } else {
                            if(results.length > 0) {
                                
                                res.render('registration', {message: "~OMG!*{ERROR!}}// That username is taken. Try another!"});    
                            } else {

                                // SQL REGISTER NEW USER
                                const sqlInsertUser = "INSERT INTO users (id, username, password, ip_address) VALUES (NULL, '"+ username +"', '"+ password+"', '" + userIP +"')";

                                console.log(sqlInsertUser);
                                console.log("Registering a new user...")

                                connection.query(sqlInsertUser, (err) => {
                        
                                    if(err){
                                        res.render('registration', {message: err});
                    
                                    } else {
                                        
                                        //Create session cookie & redirect to homepage
                                        req.session.data = username;
                                        res.redirect('/');
                                    }
                                });
                            }
                        }
                    });
                }
            });
            /////////////////////////////////


        } else {
            res.render('registration', {message: "ERROR!!!TYPE=FASTTYPER{/ *)^OMG!!? Your password didn't match with previous entry!"});
        };
    };
});

app.post('/upload', (req, res) => {

    // Session data
    const sessionData = req.session.data;  
    const sessionCheck = (sessionData) => {
        return (sessionData) ? sessionData : false;
    };
    const session = sessionCheck(sessionData);

    if (Object.keys(req.files).length == 0) {
        return  connectAndRenderHomepage(req, res, session, "ERROR!!)){'Little_error'}No files were uploaded!!");
    }
    
    const file = req.files.uploadedPicture;
    const fileType = String(file.name).match(/\.(?:jpg|gif|png)/)[0];
    const fileRandomName =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const fileNewName = fileRandomName + fileType;
    //console.log(fileNewName);


    
    joi.validate({ uploadFile: file.name}, schemaUpload, (err_joi, value) => {
        if(err_joi){
            connectAndRenderHomepage(req, res, session, err_joi);
        } else {

            file.mv("./static/images/" + fileNewName, err => {
                if(err){
                    connectAndRenderHomepage(req, res, session, err); 
                } else {

                    const subject = req.body.uploadTitle;
                    const comment = req.body.uploadComment;

                    const sqlUserID = "SELECT id FROM users WHERE username='" + String(sessionData) + "'";

                    connection.query(sqlUserID, (err, results) => {
                        
                        if (err) {
                            res.status(500).send("Database Error!");
                        } else {
                            
                            const userID = results[0]["id"];
                            
                            // Upload database
                            const sqlInsertUser = "INSERT INTO threads (id, thread_opid, thread_name, thread_text, thread_image_id) VALUES (NULL, '" + userID +"', '" + subject +"', '" + comment +"', '" + fileNewName + "')";

                            connection.query(sqlInsertUser, (err_update) => {
                                
                                if (err_update) {
                                    res.status(500).send("Database Error!");
                                } else {
                                    res.redirect('/'); 
                                };
                            });
                        };    
                    });
                };
            });
        };
    });
});


// Start the server
const port = process.env.PORT || 8081;
app.listen(port, () => console.log(`Server running on ${port}`));


// Renders a homepage with upload error messages
function connectAndRenderHomepage(req, res, session, error_message){
    // SQL
    const sql ="SELECT * FROM threads";

    connection.query(sql, (err, results) => {
        if (err) {
            res.status(500).send("Database Error!");
        } else {
            if (results.length > 0) {
                res.render('index', {data: results, session: session, uploadMessage: error_message});
            } else {
                res.status(500).send("Database is empty!");
            };
        };
    });
};