/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
const path = require("path");
const { Todo } = require("./models");
const { request } = require("http");
// const bodyParser = require("body-parser");
// app.use(bodyParser.json());
app.use(express.json());

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  const allTodos = await Todo.getAllTodos();
  if (req.accepts("html")) {
    res.render("index", { allTodos });
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
    return res.json(todo);
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async (req, res) => {
  console.log("We have to update a todo wit ID:", req.params.id);
  const todo = await Todo.findByPk(req.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return res.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});

app.delete("/todos/:id", async (req, res) => {
  console.log("Delete a todo by ID:", req.params.id);
  try {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) {
      return res.json(false);
    }
    await todo.deleteTodo();
    return res.json(true);
  } catch (error) {
    console.log(error);
    return res.json(false);
  }
});

module.exports = app;
