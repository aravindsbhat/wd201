/* eslint-disable no-undef */
const todoList = require("../todo");

const { all, markAsComplete, add, overdue, dueToday, dueLater } = todoList();

describe("Todo List test suite", () => {
  beforeAll(() => {
    add({
      title: "Test todo",
      completed: false,
      dueDate: new Date().toISOString().split("T")[0],
    });
  });
  test("Should add a new todo", () => {
    const todoCount = all.length;
    add({
      title: "Test todo again",
      completed: false,
      dueDate: new Date().toISOString().split("T")[0],
    });
    expect(all.length).toBe(todoCount + 1);
  });

  test("Should mark a todo as complete", () => {
    expect(all[0].completed).toBe(false);
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
  });

  test("Should return overdue todos", () => {
    add({
      title: "Overdue todo",
      completed: false,
      dueDate: new Date(new Date().setDate(new Date().getDate() - 1))
        .toISOString()
        .split("T")[0],
    });
    expect(overdue()).toEqual([all[2]]);
  });

  test("Should return todos due today", () => {
    add({
      title: "Due today todo",
      completed: false,
      dueDate: new Date().toISOString().split("T")[0],
    });
    expect(dueToday()).toEqual([all[0], all[1], all[3]]);
  });

  test("Should return todos due later", () => {
    add({
      title: "Due later todo",
      completed: false,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1))
        .toISOString()
        .split("T")[0],
    });
    expect(dueLater()).toEqual([all[4]]);
  });
});
