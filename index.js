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



// Variables for testing
const sessionTest = true;


//////////////////////
// Configure routes //
//////////////////////

// Home page
app.get('/', (req, res) => {
    
    res.render('index', {sess: sessionTest});
    
});

// Start the server
const port = process.env.PORT || 8081;
app.listen(port, () => console.log(`Server running on ${port}`));