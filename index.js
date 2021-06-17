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
async function getUser(email) {
  console.log("Getting user", email);

  return new Promise((resolve, reject) => {
    client.connect();

    // This query would actually query your database for a user, instead of doing
    // what it is doing. You would user the username parameter to select the correct
    // user from the database.
    client.query(
      "SELECT table_schema,table_name FROM information_schema.tables;",
      (err, res) => {
        if (err) throw err;
        for (let row of res.rows) {
          // console.log(JSON.stringify(row));
        }
        client.end();
        resolve(res.rows);
      }
    );
  });
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
  res.render("login");
});

// POST /login - validates the submitted form data
app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log("form submitted", email, password);
  const user = await getUser(email);

  // TODO: Compare the passwords.
  console.log("rows from database", user);

  // Render back the login page if they don't match. TODO: Provide an error
  res.render("login");
});

app.get("/admin", (req, res) => {
  res.render("admin");
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
