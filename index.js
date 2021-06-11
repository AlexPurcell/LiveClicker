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
  res.render("index");
});

app.get("/milestones", (req, res) => {
  res.render("milestones");
});

// How the API is made
let clickCount = 0;
app.get("/api/click", (req, res) => {
  clickCount++;

  res.json({ count: clickCount });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
