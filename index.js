var path = require("path");
const express = require("express");
const app = express();
const port = 3000;

app.use("/static", express.static(path.join(__dirname, "public")));
app.engine(".html", require("ejs").__express);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

// GET http://localhost:3000/home/?name=alex
app.get("/", (req, res) => {
  // go look something up in the database
  res.render("index");
  //res.send("<html><body>alex</body></html>");
});

app.get("/milestones", (req, res) => {
  // go look something up in the database
  res.render("milestones");
  //res.send("<html><body>alex</body></html>");
});

app.get("/hello", (req, res) => {
  console.log(req);

  // req { ip, query: {} }
  // req.ip
  // req.query.name

  res.send("Hello " + req.query.name);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
