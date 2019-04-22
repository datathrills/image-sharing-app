/*
///////////////////////
// IMAGE SHARING APP //
///////////////////////
by Marko Bralic

#Principles of design
- Build a nice database; compromise on ugly SQL queries
- Make an usable UX and check all scenarios; compromise on adding extra features
- When possible use functional style of programming 
- Inspiration for app functionality from Imageboards and Reddit

# Extra Features
- EJS partials
- Login from all pages
- JOI validation (No "Robert'); DROP TABLE Students;--" allowed or uploading .exe files)
- Display useful or strage error messages to users on register, login and upload pictures
- One like per user system which make it easy to see what you can like
- Ajax calls for likes and comments to avoid reloading the whole page
- Redirect or back to Homepage responses when something goes wrong
- Store IP addresses; check double usernames; rename picture files

# Notes
- Tested on Chrome and Firefox
- Database built locally using XAMPP
*/

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
app.use(bodyParser.json());
app.use(fileUpload());

// Session cookie
app.use(session({
    secret:'crmorytp8vyp98p%&ADIB66^^&fjdfdfaklfdhf',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 600000} // 10 minutes
}));

// Define schema for joi validation when registering/login
// Only a-z or A-z letter and numbers
const schema = joi.object().keys({
    username: joi.string().alphanum().min(3).max(20).required(),
    password: joi.string().regex(/^[a-zA-Z0-9]{8,20}$/).min(8).max(20)
}).with('username', 'password');

// Define schema for joi validation of uploaded files
// File must end with .jpg || .gif || .png
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


//////////////////////
// Configure routes //
//////////////////////

// Home page
app.get('/', (req, res) => {

    // Session data
    const sessionData = req.session.data;  
    const sessionCheck = (sessionData) => {
        return (sessionData) ? sessionData : false;
    };
    const session = sessionCheck(sessionData);

    // SQL that returns which threads are liked by the login user
    const threadsWithHeart = "SELECT thread_id AS thread FROM likes WHERE likes.user_id= (SELECT users.id FROM users WHERE users.username='" + sessionData +"')";

    // SQL that calculates the number of likes for each thread
    // and returns the data need to create homepage with threads
    // ordered by the most liked threads
    const sql = "CREATE TABLE Temp(thread_id int(11), thread_likes int(11));INSERT INTO Temp SELECT threads.id AS thread_id, COUNT(likes.id) as num_likes FROM threads LEFT JOIN likes ON likes.thread_id = threads.id GROUP BY threads.id; SELECT threads.id, threads.thread_image_id, threads.thread_name, threads.thread_text, DATE_FORMAT(threads.thread_timestamp,'%d/%b/%Y(%a) %H:%i:%s') AS thread_timestamp, Temp.thread_likes, users.username FROM threads LEFT JOIN users ON threads.thread_opid=users.id LEFT JOIN Temp ON threads.id=Temp.thread_id ORDER BY thread_likes DESC;" + threadsWithHeart + ";DROP TABLE Temp"


    connection.query(sql, (err, results) => {
        if (err) {
            res.status(500).send("Database Error!");
        } else {
            if (results.length > 0) {
                res.render('index', {data: results[2], likedThread: results[3], session: session, uploadMessage: ""});
            } else {
                res.status(500).send("Database is empty!");
            };
        };
    });
});


// Unique page for each thread
app.get('/threads/:id', (req, res) => {

    // Session data
    const sessionData = req.session.data;  
    const sessionCheck = (sessionData) => {
        return (sessionData) ? sessionData : false;
    };
    const session = sessionCheck(sessionData);
    
    //URL
    const threadUrl = req.params.id;

    //SQL query that returns data for the single thread
    const sql_query_1 = "SELECT threads.thread_name, threads.id, threads.thread_text, threads.thread_image_id, DATE_FORMAT(threads.thread_timestamp,'%d/%b/%Y(%a) %H:%i:%s') AS thread_timestamp, users.username FROM threads LEFT JOIN users ON threads.thread_opid=users.id WHERE threads.id=" + String(threadUrl);
    
    //SQL query that returns data for the comments
    const sql_query_2 = "SELECT replies.id, replies.reply_text, DATE_FORMAT(replies.reply_timestamp,'%d/%b/%Y(%a) %H:%i:%s') AS reply_timestamp, users.username FROM replies LEFT JOIN users ON replies.reply_user_id=users.id WHERE thread_id=" + String(threadUrl);

    //SQL query checks if the tread was like by login user
    const sql_query_3 = "SELECT thread_id AS thread FROM likes WHERE likes.user_id= (SELECT users.id FROM users WHERE users.username='"+sessionData+"') AND likes.thread_id=" + String(threadUrl);

    //SQL query that count how many times was thread liked
    const sql_query_4 = "SELECT threads.id AS thread_id, COUNT(likes.id) as num_likes FROM threads LEFT JOIN likes ON likes.thread_id = threads.id WHERE threads.id="+ String(threadUrl);

    // Join all SQL queries
    const sql = sql_query_1 + "; " + sql_query_2 + "; " + sql_query_3 + "; " + sql_query_4 ;

    connection.query(sql, (err, results) => {
        if(err){
            res.status(500).send("Database Error!");
        } else {
            if(results.length > 0) {
                res.render('thread', {thread: results[0], replies: results[1], session: session, likedThread: results[2], likesNum: results[3]});
            } else {
                res.status(500).send("Database is empty!");
            }
        }
    })
});


// Page for registration
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


// User login 
app.post('/login', (req, res) =>{

    // Session data
    const sessionData = req.session.data;  

    // Login is only possible if the user is not logged in
    if(sessionData){
        res.redirect('/');
    } else {

        const username = req.body.usernameLogin;
        const password = req.body.passwordLogin;

        // joi validation for username and password
        joi.validate({ username: username, password: password }, schema, (err, value) => {
            if(err){
                res.render('registration', {message: err});
            } else {
                console.log("JOI validation is OK!");

                //SQL that check the username and password in database
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


// Logout
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


// Registration 
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
        
        // IP ADDRESS and exception for testing on localhost
        let userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if(userIP === "::1") {
            userIP = "134.226.214.244";
        };

        //Check if the password is correctly repeated
        if(password === passwordRepeat){

             // joi validation for username and password
            joi.validate({ username: username, password: password }, schema, (err, value) => {
                if(err){
                    res.render('registration', {message: err});
                } else {
                    console.log("JOI validation is OK!");
        
                    //SQL check if username is taken
                    const sqlTestName = "SELECT * FROM users WHERE username='" + String(username) + "'";
        
                    connection.query(sqlTestName, (err, results) => {
                        
                        if(err){
                            res.render('registration', {message: err});
        
                        } else {
                            if(results.length > 0) {
                                
                                res.render('registration', {message: "~OMG!*{ERROR!}}// That username is taken. Try another!"});    
                            
                            } else {

                                // SQL to register new user
                                const sqlInsertUser = "INSERT INTO users (id, username, password, ip_address) VALUES (NULL, '"+ username +"', '"+ password+"', '" + userIP +"')";

                                console.log("Registering a new user...")

                                connection.query(sqlInsertUser, (err) => {
                        
                                    if(err){
                                        res.render('registration', {message: err});
                    
                                    } else {
                                        
                                        // User is registered log him in by 
                                        // creating a session cookie & redirect to homepage
                                        req.session.data = username;
                                        res.redirect('/');
                                    }
                                });
                            }
                        }
                    });
                }
            });
        } else {
            res.render('registration', {message: "ERROR!!!TYPE=FASTTYPER{/ *)^OMG!!? Your password didn't even match with previous entry!"});
        };
    };
});


// Upload pictures
app.post('/upload', (req, res) => {

    // Session data
    const sessionData = req.session.data;  
    const sessionCheck = (sessionData) => {
        return (sessionData) ? sessionData : false;
    };
    const session = sessionCheck(sessionData);

    // Check if file is uploaded
    if (Object.keys(req.files).length == 0) {
        return connectAndRenderHomepage(req, res, session, "ERROR!!)){'Little_error'}No files were uploaded!!");
    }
    
    // Rename files
    const file = req.files.uploadedPicture;
    const fileType = String(file.name).match(/\.(?:jpg|gif|png)/)[0];
    const fileRandomName =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const fileNewName = fileRandomName + fileType;
    
    // joi validation of file type (just filename String validation);
    joi.validate({ uploadFile: file.name}, schemaUpload, (err_joi, value) => {
        if(err_joi){
            connectAndRenderHomepage(req, res, session, err_joi);
        } else {
            // Store file in static folder
            file.mv("./static/images/" + fileNewName, err => {
                if(err){
                    connectAndRenderHomepage(req, res, session, err); 
                } else {

                    const subject = req.body.uploadTitle;
                    const comment = req.body.uploadComment;

                    const sqlUserID = "SELECT id FROM users WHERE username='" + String(sessionData) + "'";

                    //SQL to get the userID
                    connection.query(sqlUserID, (err, results) => {
                        
                        if (err) {
                            res.status(500).send("Database Error!");
                        } else {
                            
                            const userID = results[0]["id"];
                            
                            // Upload database
                            const sqlInsertUser = "INSERT INTO threads (id, thread_opid, thread_name, thread_text, thread_image_id) VALUES (NULL, '" + userID +"', '" + subject +"', '" + comment +"', '" + fileNewName + "')";

                            //SQL to create a new Thread
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


// Liking a thread (AJAX)
app.post('/likes/:id', (req, res) => {

    const sessionData = req.session.data;

    // Restrict access to login users
    if(!sessionData){
        res.redirect('/');
    } else { 
        // Just to be sure, check if user has allready liked this post
        
        const threadID = req.params.id;

        const isLegitSql = "SELECT IF (COUNT(*) > 0, 'true', 'false') AS thread FROM likes WHERE likes.user_id= (SELECT users.id FROM users WHERE users.username='" + sessionData +"') AND thread_id ="+ threadID;
        const UserIDSql = "SELECT id FROM users WHERE username='" + String(sessionData) + "'";
        const sql = isLegitSql + ";" + UserIDSql;

        //SQL check if user liked this post
        connection.query(sql, (err, results) => {
            if (err) {
                res.status(500).send("Database Error!");
            } else {
         
                if (results[0][0]["thread"]  == "true") {
                    console.log("ILLEGAL LIKES ERROR!!");
                    connectAndRenderHomepage(req, res, sessionData, "ILLEGAL LIKES ERROR! NO HACKING LIKES ALLOWED!!_@_@");
                }
                else if (results[0][0]["thread"] == "false") {
                    
                    // Since this post wasn't like by the user we will now write this like into the database
                    const sqlLike = "INSERT INTO likes (id, thread_id, user_id) VALUES (NULL, '" + threadID +"', '" + results[1][0]["id"] + "')";

                    // SQL write the like in database
                    connection.query(sqlLike, (err) => {
                        if (err) {
                            res.status(500).send("Database Error!");
                        } else {
                            // Send back thread ID
                            console.log("Sucessfuly updated like!");
                            res.json(threadID);
                        };
                    });

                } else {
                    console.log("Database got messed up somehow...");
                    res.redirect('/');
                };
            };
        });
    }
});

// Posting a comment (AJAX)
app.post('/threads/:id', (req, res) => {

    const sessionData = req.session.data;
    
    // Restrict access to login users
    if(!sessionData){
        res.redirect('/');
    } else {

        const message = req.body.message;
        const threadID = Number(req.params.id);

        const usernameSql = "(SELECT users.id FROM users WHERE users.username='" + sessionData + "')";
        const insertCommentSql = "INSERT INTO replies (id, thread_id, reply_user_id, reply_text, reply_timestamp) VALUES (NULL, " + threadID +", " + usernameSql + ",'" + message + "', NULL )";
        const repliesSql = "SELECT * FROM replies WHERE reply_user_id="+ usernameSql +" ORDER BY reply_timestamp DESC LIMIT 1";

        const sql = insertCommentSql + "; " + repliesSql;

        // SQL insert comment into database
        connection.query(sql, (err, results) => {
            if (err) {
                res.status(500).send("Database Error!");
            } else {
                // Return the last comment by the user
                results[1][0].username = sessionData;
                res.json(results[1]);
            }
        });
    }

});


// Start the server
const port = process.env.PORT || 8081;
app.listen(port, () => console.log(`Server running on ${port}`));


// Helper function that renders a homepage with upload a error messages
// usulally used when something goes wrong
function connectAndRenderHomepage(req, res, session, error_message){
    
    // SQL
    const threadsWithHeart = "SELECT thread_id AS thread FROM likes WHERE likes.user_id= (SELECT users.id FROM users WHERE users.username='" + session +"')";

    const sql = "CREATE TABLE Temp(thread_id int(11), thread_likes int(11));INSERT INTO Temp SELECT threads.id AS thread_id, COUNT(likes.id) as num_likes FROM threads LEFT JOIN likes ON likes.thread_id = threads.id GROUP BY threads.id; SELECT threads.id, threads.thread_image_id, threads.thread_name, threads.thread_text, DATE_FORMAT(threads.thread_timestamp,'%d/%b/%Y(%a) %H:%i:%s') AS thread_timestamp, Temp.thread_likes, users.username FROM threads LEFT JOIN users ON threads.thread_opid=users.id LEFT JOIN Temp ON threads.id=Temp.thread_id ORDER BY thread_likes DESC;" + threadsWithHeart + ";DROP TABLE Temp"

    connection.query(sql, (err, results) => {
        if (err) {
            res.status(500).send("Database Error!");
        } else {
            if (results.length > 0) {
                res.render('index', {data: results[2], likedThread: results[3], session: session, uploadMessage: error_message});
            } else {
                res.status(500).send("Database is empty!");
            };
        };
    });
};