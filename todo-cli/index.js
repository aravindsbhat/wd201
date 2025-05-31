/* eslint-disable no-unused-vars */
const { connect } = require("./connectDB");
const Todo = require("./TodoModel");

const createTodo = async () => {
  try {
    await connect();
    const todo = await Todo.addTask({
      title: "Second Item",
      dueDate: new Date(),
      completed: false,
    });
    console.log("Created Todo with ID:", todo.id);
  } catch (err) {
    console.error(err);
  }
};

const countItems = async () => {
  try {
    const totalCount = await Todo.count();
    console.log(`Found ${totalCount} items in the table`);
  } catch (err) {
    console.error(err);
  }
};

const getAllTodos = async () => {
  try {
    const todos = await Todo.findAll({
      order: [["id", "DESC"]],
    });
    const todoList = todos.map((todo) => todo.displayableString()).join("\n");
    console.log(todoList);
  } catch (err) {
    console.error(err);
  }
};

const updateTodo = async (id) => {
  try {
    await Todo.update({ completed: true }, { where: { id: id } });
  } catch (err) {
    console.error(err);
  }
};

const deleteTodo = async (id) => {
  try {
    await Todo.destroy({ where: { id: id } });
  } catch (err) {
    console.error(err);
  }
};

(async () => {
  //await createTodo();
  //await countItems();
  await getAllTodos();
  await deleteTodo(1);
  //   await updateTodo(1);
  await getAllTodos();
})();
