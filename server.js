var express = require("express");
var bodyParser = require("body-parser");

var app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 8080;

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  port: 8889,
  user: "root",
  password: "root",
  database: "burgers_db"
});

connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);
});


// Use Handlebars to render the main index.html page with the todos in it.
app.get("/", function(req, res) {
    connection.query("SELECT * FROM burgers;", function(err, data) {
      if (err) {
        return res.status(500).end();
      }
  
      res.render("index", { burgers: data });
    });
  });
  
  // Create a new todo
  app.post("/todos", function(req, res) {
    connection.query("INSERT INTO burgers (burger_name) VALUES (?)", [req.body.burgers], function(err, result) {
      if (err) {
        return res.status(500).end();
      }
  
      // Send back the ID of the new todo
      res.json({ id: result.insertId });
      console.log({ id: result.insertId });
    });
  });
  
  // Retrieve all todos
  app.get("/todos", function(req, res) {
    connection.query("SELECT * FROM burgers;", function(err, data) {
      if (err) {
        return res.status(500).end();
      }
  
      res.json(data);
    });
  });
  
  // Update a todo
  app.put("/todos/:id", function(req, res) {
    connection.query("UPDATE burgers SET burger_name = ? WHERE id = ?", [req.body.burger_name, req.params.id], function(err, result) {
      if (err) {
        // If an error occurred, send a generic server failure
        return res.status(500).end();
      }
      else if (result.changedRows === 0) {
        // If no rows were changed, then the ID must not exist, so 404
        return res.status(404).end();
      }
      res.status(200).end();
  
    });
  });
  
  // Delete a todo
  app.delete("/todos/:id", function(req, res) {
    connection.query("DELETE FROM burgers WHERE id = ?", [req.params.id], function(err, result) {
      if (err) {
        // If an error occurred, send a generic server failure
        return res.status(500).end();
      }
      else if (result.affectedRows === 0) {
        // If no rows were changed, then the ID must not exist, so 404
        return res.status(404).end();
      }
      res.status(200).end();
  
    });
  });
  
  // Start our server so that it can begin listening to client requests.
  app.listen(PORT, function() {
    // Log (server-side) when our server has started
    console.log("Server listening on: http://localhost:" + PORT);
  });
  