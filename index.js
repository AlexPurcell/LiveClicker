var path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

const crypto = require('./crypto');
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();

app.use("/static", express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.engine(".html", require("ejs").__express);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

const { Client } = require("pg");

// Function for getting a new instances of the Client
// used by each new query.
function getDbClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  return client;
}

// username: string - the user name of the user
// onSuccess: function - the function that will be called when the query is successful.
// onError: function - the function that will be called when the query is errored.
function getUser(email, onSuccess, onError) {
  const db = getDbClient();
  db.connect();

  console.log("Looking up user with email", email);

  db.query(
    // TODO: Make this a parameterized query instead.
    `SELECT * FROM members WHERE "email" = '${email}'`,
    (err, res) => {
      if (err) {
        onError(err);
        db.end();
        return;
      }
      
      const user = res.rows[0];
      
      // If user is found, user will be first item of the array.
      onSuccess(user);
      db.end();
    }
  );
}

// GET http://localhost:3000/home/?name=alex
app.get("/", (req, res) => {
  // We could substitute stuff in the html before it even
  // goes to the browser.
  res.render("index");
});

app.get("/milestones", (req, res) => {
  res.render("milestones");
});

// GET /login - returns the login page
app.get("/login", (req, res) => {
  // Render the login view. Provide no error to the view.
  res.render("login", { error: "" });
});

// POST /login - validates the submitted form data
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log("form submitted with values", email, password);
  getUser(
    email,
    (user) => {

      const genericError = "Incorrect email and/or password";
      if (!user) {
        // Could not find a user with email.
        console.log('Could not find user with email', email);
        res.render("login", { error: genericError });
        return;
      }

      console.log("User from the database", user);

      const passwordsMatch = user.password === password;
      if (passwordsMatch) {
        const cookieValue = crypto.encrypt(JSON.stringify(user));

        res
          .cookie('auth', cookieValue, { expire: 360000 + Date.now() }) 
          .redirect('/admin');
        return;
      } 

      // The user supplied bad credentials
      res.render("login", { error: genericError });
    },
    (error) => {
      res.render("login", { error: `An error occured while logging in. ${error}` });
    }
  );
});

app.get("/admin", (req, res) => {
  // User needs to have an auth cookie to access this page.

  const cookie = req.cookies.auth;
  
  if (!cookie) {
    res.redirect("/login");
    return;
  }
  
  const decrypted = crypto.decrypt(cookie);
  if (decrypted) {
    // Show them the page.
    res.render("admin");
    return;
  }
  
});
// How the API is made
let clickCount = 0;

// This gets called by fetch from the client side (browser)
// This increases the click counter and then returns the latest
// count to the client.
app.post("/api/click", (req, res) => {
  clickCount++;

  res.json({ count: clickCount });
});

// This gets called by fetch from the client side (browser)
// This just returns the latest count to the client
app.get("/api/count", (req, res) => {
  res.json({ count: clickCount });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
