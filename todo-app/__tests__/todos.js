/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const request = require("supertest");
const db = require("../models/index");
var cheerio = require("cheerio");
const app = require("../app");
//const { default: test } = require("node:test");

let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Todo test suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000);
    agent = request.agent(server);
  });
  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("Responds with json at /todos", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Mark todo as completed", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    res = await agent.get("/todos").accept("application/json");
    const todos = JSON.parse(res.text);
    let lastAdded = todos[todos.length - 1];
    const todoId = lastAdded.id;
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    res = await agent.put(`/todos/${todoId}`).send({
      completed: true,
      _csrf: csrfToken,
    });
    csrfToken = extractCsrfToken(res);
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("true");
  });

  test("Mark todo as not completed", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    let response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: true,
      _csrf: csrfToken,
    });
    res = await agent.get("/todos").accept("application/json");
    const todos = JSON.parse(res.text);
    const lastAdded = todos[todos.length - 1];
    const todoId = lastAdded.id;
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    res = await agent.put(`/todos/${todoId}`).send({
      completed: false,
      _csrf: csrfToken,
    });
    csrfToken = extractCsrfToken(res);
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("false");
  });

  test("Delete a todo", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
    res = await agent.get("/todos").accept("application/json");
    const todos = JSON.parse(res.text);
    const lastAdded = todos[todos.length - 1];
    const todoId = lastAdded.id;
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    res = await agent.delete(`/todos/${todoId}`).send({
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("true");
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    res = await agent.get(`/todos/${todoId}`);
    expect(res.statusCode).toBe(404);
  });
});
