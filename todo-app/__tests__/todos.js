/* eslint-disable no-undef */
const request = require("supertest");
const db = require("../models/index");
const app = require("../app");
//const { default: test } = require("node:test");

let server, agent;

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
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(response.statusCode).toBe(302);
  });

  // test("Mark todo as completed", async () => {
  //   const response = await agent.post("/todos").send({
  //     title: "Buy milk",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //   });
  //   const parsedResponse = JSON.parse(response.text);
  //   const todoId = parsedResponse.id;
  //   expect(parsedResponse.completed).toBe(false);
  //   const markComplete = await agent
  //     .put(`/todos/${todoId}/markAsCompleted`)
  //     .send();
  //   const parsedUpdateResponse = JSON.parse(markComplete.text);
  //   expect(parsedUpdateResponse.completed).toBe(true);
  // });

  // test("Delete a todo", async () => {
  //   const response = await agent.post("/todos").send({
  //     title: "Buy milk",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //   });

  //   const parsedResponse = JSON.parse(response.text);
  //   const todoId = parsedResponse.id;

  //   const deleteResponse = await agent.delete(`/todos/${todoId}`);
  //   expect(deleteResponse.text).toBe("true");
  //   const checkResponse = await agent.get(`/todos/${todoId}`);
  //   expect(checkResponse.statusCode).toBe(404);
  // });
});
