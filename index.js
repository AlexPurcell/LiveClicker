var path = require("path");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use("/static", express.static(path.join(__dirname, "public")));
app.engine(".html", require("ejs").__express);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

// GET http://localhost:3000/home/?name=alex
app.get("/", (req, res) => {
  // We could substitute stuff in the html before it even
  // goes to the browser.
  res.render("index");
});

app.get("/milestones", (req, res) => {
  res.render("milestones");
});

// How the API is made
let clickCount = 0;

// This gets called by fetch from the client side (browser)
// This increases the click counter and then returns the latest
// count to the client.
app.get("/api/click", (req, res) => {
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
