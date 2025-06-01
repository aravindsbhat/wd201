const express = require("express");
const app = express();
const { Todo } = require("./models");
// const bodyParser = require("body-parser");
// app.use(bodyParser.json());
app.use(express.json());

app.get("/todos", (req, res) => {
  res.json({ message: "Todo list" });
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

app.delete("/todos/:id", (req, res) => {
  console.log("Delete a todo by ID:", req.params.id);
  res.json({ message: "Delete todo" });
});

module.exports = app;
