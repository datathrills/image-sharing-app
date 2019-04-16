// Require modules
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const mysql = require("mysql");

// Express app object
const app = express();

// Register the middleware
app.use(express.static('static'));
app.set('view engine', 'ejs');
app.set('views', 'views');

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
const sessionTest = true;


//////////////////////
// Configure routes //
//////////////////////

// Home page
app.get('/', (req, res) => {

    // SQL
    const sql ="SELECT * FROM threads";

    connection.query(sql, (err, results) => {
        if (err) {
            res.status(500).send("Database Error!");
        } else {
            if (results.length > 0) {
                // Render index
                //console.log(results)
                res.render('index', {data: results, sess: sessionTest});
            } else {
                res.status(500).send("Database is empty!");
            };
        };
    });

    //res.render('index', {sess: sessionTest});    
});

app.get('/threads/:id', (req, res) => {
    
    const threadUrl = req.params.id;

    //SQL
    const sql_query_1 = "SELECT * FROM threads WHERE id=" + String(threadUrl);        // results[0]
    const sql_query_2 = "SELECT * FROM replies WHERE thread_id=" + String(threadUrl); // results[1]
    const sql = sql_query_1 + "; " + sql_query_2;
    console.log(sql);

    connection.query(sql, (err, results) => {
        if(err){
            res.status(500).send("Database Error!");
        } else {
            if(results.length > 0) {

                res.render('thread', {thread: results[0], replies: results[1], sess: sessionTest});
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

// Start the server
const port = process.env.PORT || 8081;
app.listen(port, () => console.log(`Server running on ${port}`));
