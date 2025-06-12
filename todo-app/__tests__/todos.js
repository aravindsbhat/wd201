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

const login = async (agent, email, password) => {
  let res = await agent.get("/login");
  const csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email,
    password,
    _csrf: csrfToken,
  });
};

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

  test("Sign up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/users").send({
      firstName: "Test",
      lastName: "User A",
      email: "usera@test.com",
      password: "password",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test("Sign out", async () => {
    let res = await agent.get("/todos");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/todos");
    expect(res.statusCode).toBe(302);
  });

  test("Responds with json at /todos", async () => {
    const agent = request.agent(server);
    await login(agent, "usera@test.com", "password");
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Toggle todo completed and not completed", async () => {
    const agent = request.agent(server);
    await login(agent, "usera@test.com", "password");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    res = await agent.get("/todos").accept("application/json");
    const todos = JSON.parse(res.text).allTodos;
    let lastAdded = todos[todos.length - 1];
    const todoId = lastAdded.id;
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    res = await agent.put(`/todos/${todoId}`).send({
      completed: true,
      _csrf: csrfToken,
    });
    csrfToken = extractCsrfToken(res);
    expect(res.statusCode).toBe(200);
    expect(res.body.completed).toBe(true);
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    res = await agent.put(`/todos/${todoId}`).send({
      completed: false,
      _csrf: csrfToken,
    });
    csrfToken = extractCsrfToken(res);
    expect(res.statusCode).toBe(200);
    expect(res.body.completed).toBe(false);
  });

  //   res = await agent.get("/todos").accept("application/json");
  //   const todos = JSON.parse(res.text).allTodos;
  //   const lastAdded = todos[todos.length - 1];
  //   const todoId = lastAdded.id;
  //   res = await agent.get("/todos");
  //   csrfToken = extractCsrfToken(res);
  //   res = await agent.put(`/todos/${todoId}`).send({
  //     completed: false,
  //     _csrf: csrfToken,
  //   });
  //   csrfToken = extractCsrfToken(res);
  //   expect(res.statusCode).toBe(200);
  //   expect(res.body.completed).toBe(false);
  // });

  test("Delete a todo", async () => {
    const agent = request.agent(server);
    await login(agent, "usera@test.com", "password");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
    res = await agent.get("/todos").accept("application/json");
    const todos = JSON.parse(res.text).allTodos;
    const lastAdded = todos[todos.length - 1];
    const todoId = lastAdded.id;
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    res = await agent.delete(`/todos/${todoId}`).send({
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("true");
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    res = await agent.get(`/todos/${todoId}`);
    expect(res.statusCode).toBe(404);
  });
});
