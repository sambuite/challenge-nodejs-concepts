const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

function checksIfTodoExists(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((e) => e.id === id);

  if (!todo) return response.status(404).json({ error: "Mensagem do erro" });

  request.todo = todo;

  return next();
}

function getTodos(username) {
  const todos = users.find((user) => user.username === username).todos;

  return todos;
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.user;

  const todos = getTodos(username);

  return response.status(201).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date(deadline),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checksIfTodoExists,
  (request, response) => {
    const { title, deadline } = request.body;
    const { user, todo } = request;

    const newTodo = {
      ...todo,
      title,
      deadline: new Date(deadline),
    };

    user.todos.splice(todo, 1, newTodo);

    return response.status(201).json(newTodo);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checksIfTodoExists,
  (request, response) => {
    const { user, todo } = request;

    const newTodo = {
      ...todo,
      done: true,
    };

    user.todos.splice(todo, 1, newTodo);

    return response.status(201).json(newTodo);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checksIfTodoExists,
  (request, response) => {
    const { user, todo } = request;

    user.todos.splice(todo, 1);

    return response.status(204).send();
  }
);

module.exports = app;
