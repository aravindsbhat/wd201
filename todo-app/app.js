/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
const path = require("path");
const { Todo, User } = require("./models");
const { request } = require("http");
const { url } = require("inspector");
const { parseArgs } = require("util");
const cookieParser = require("cookie-parser");
const csrf = require("tiny-csrf");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const { nextTick } = require("process");
const flash = require("connect-flash");
const saltRounds = 10;
app.use(express.json());
// const bodyParser = require("body-parser");
// app.use(bodyParser.json());
app.use(
  session({
    secret: "my-super-secret-key-49202865739201",
    cookie: {
      maxAge: 24 * 60 * 60 * 60 * 1000,
    },
  }),
);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret"));
app.use(csrf("123456789iamasecret987654321look", ["POST", "PUT", "DELETE"]));

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          const result = await bcrypt.compare(password, user.password);
          if (result) return done(null, user);
          else return done(null, false, "Invalid Password");
        })
        .catch((error) => {
          return done(error);
        });
    },
  ),
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.get("/todos", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const userId = req.user.id;
  const allTodos = await Todo.getAllTodos(userId);
  const overdue = await Todo.overdue(userId);
  const dueToday = await Todo.dueToday(userId);
  const dueLater = await Todo.dueLater(userId);
  const completed = await Todo.completed(userId);
  try {
    if (req.accepts("html")) {
      res.render("todo", {
        // Make it todos when complete
        allTodos,
        overdue,
        dueToday,
        dueLater,
        csrfToken: req.csrfToken(),
        completed,
      });
    } else {
      res.json({ allTodos });
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/", async (req, res) => {
  res.render("index", {
    title: "Todo Application",
    csrfToken: req.csrfToken(),
  });
});

app.use(express.static(path.join(__dirname, "public")));

// app.get("/todos", async (req, res) => {
//   console.log("Fetching all todos");

//   try {
//     const todos = await Todo.getAllTodos();
//     return res.json(todos);
//   } catch (error) {
//     console.log(error);
//     return res.status(422).json(error);
//   }
// });

app.get("/signup", (req, res) => {
  res.render("signup", {
    title: "Sign Up",
    csrfToken: req.csrfToken(),
  });
});

app.get("/signout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

app.post("/users", async (req, res) => {
  try {
    const hashedPwd = await bcrypt.hash(req.body.password, saltRounds);
    console.log(hashedPwd);
    const { firstName, email, lastName } = req.body;
    if (!firstName || !email) {
      req.flash("error", "First Name and Email are required");
      return res.redirect("/signup");
    }
    const user = await User.createUser({
      firstName,
      lastName,
      email,
      password: hashedPwd,
    });

    req.login(user, (err) => {
      if (err) {
        console.log(err);
      }
      res.redirect("/todos");
    });
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});

app.post("/todos", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  console.log("Creating a todo", req.body);
  console.log(req.user);

  try {
    const todo = await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
      userId: req.user.id,
    });
    return res.redirect("/todos");
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});

app.get("/login", async (req, res) => {
  await res.render("login", {
    title: "Login",
    csrfToken: req.csrfToken(),
  });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    console.log(req.user);
    await res.redirect("/todos");
  },
);

app.put(
  "/todos/:id/",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
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
  },
);

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    console.log("Delete a todo by ID:", req.params.id);
    try {
      await Todo.remove(req.params.id, req.user.id);
      return res.json(true);
    } catch (error) {
      console.log(error);
      return res.json(false);
    }
  },
);

module.exports = app;
