var path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();

app.use("/static", express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

app.engine(".html", require("ejs").__express);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

const { Client } = require("pg");
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// username: string - the user name of the user
// onSuccess: function - the function that will be called when the query is successful.
// onError: function - the function that will be called when the query is errored.
function getUser(email, onSuccess, onError) {
  client.connect();

  console.log("Looking up user with email", email);

  // TODO: This query will need to select from a users table in the database
  // and look up the user with the specified email.
  client.query(
    "SELECT table_schema,table_name FROM information_schema.tables;",
    (err, res) => {
      if (err) {
        onError(err);
      }

      client.end();
      onSuccess(res.rows);
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

  console.log("form submitted", email, password);
  getUser(
    email,
    (user) => {
      // This is the success callback (2nd parameter of getUser)

      // TODO: Compare the passwords.
      console.log("rows from database", user);

      const passwordsMatch = false; // TODO: Compare the passwords.
      if (passwordsMatch) {
        // assign a cookie and redirect to home page
        res.render("index");
      } else {
        // The user supplied bad credentials.
        // Render the login page to them again with an error.
        res.render("login", { error: "Incorrect email and/or password" });
      }
    },
    (error) => {
      // This is the error callback (3rd parameter of getUser)

      // TODO: If the email/password is correct, generate a cookie for the user.
      //       Otherwise, return them back to login with errors.
      res.render("login");
    }
  );
});

app.get("/admin", (req, res) => {
  // TODO: Check to see if the user is logged in
  // Based on a cookie.
  let isAuthenticated = false;

  if (!isAuthenticated) {
    // TODO: Redirect to login with errors.
    res.redirect("/login");
  } else {
    // Otherwise, show them the page.
    res.render("admin");
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
