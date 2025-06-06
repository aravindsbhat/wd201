/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
const path = require("path");
const { Todo } = require("./models");
const { request } = require("http");
const { url } = require("inspector");
const { parseArgs } = require("util");
const cookieParser = require("cookie-parser");
const csrf = require("tiny-csrf");
// const bodyParser = require("body-parser");
// app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret"));
app.use(csrf("123456789iamasecret987654321look", ["POST", "PUT", "DELETE"]));

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  const allTodos = await Todo.getAllTodos();
  const overdueCount = await Todo.overdueCount();
  const dueTodayCount = await Todo.dueTodayCount();
  const dueLaterCount = await Todo.dueLaterCount();
  const completedCount = await Todo.completedCount();
  if (req.accepts("html")) {
    res.render("index", {
      allTodos,
      overdueCount,
      dueTodayCount,
      dueLaterCount,
      csrfToken: req.csrfToken(),
      completedCount,
    });
  } else {
    res.json({ allTodos });
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/todos", async (req, res) => {
  console.log("Fetching all todos");

  try {
    const todos = await Todo.getAllTodos();
    return res.json(todos);
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});

app.post("/todos", async (req, res) => {
  console.log("Creating a todo", req.body);

  try {
    const todo = await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
    });
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});

app.put("/todos/:id/", async (req, res) => {
  console.log("We have to update a todo wit ID:", req.params.id);
  const todo = await Todo.findByPk(req.params.id);
  try {
    const isCompleted =
      req.body.completed === "true" || req.body.completed === true;
    const updatedTodo = await todo.setCompletionStatus(isCompleted);
    return res.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});

app.delete("/todos/:id", async (req, res) => {
  console.log("Delete a todo by ID:", req.params.id);
  try {
    await Todo.remove(req.params.id);
    return res.json(true);
  } catch (error) {
    console.log(error);
    return res.json(false);
  }
});

module.exports = app;
