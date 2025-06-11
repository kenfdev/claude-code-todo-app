import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/register", "routes/register.tsx"),
  route("/forgot-password", "routes/forgot-password.tsx"),
  route("/api/auth/login", "routes/api.auth.login.ts"),
  route("/api/auth/register", "routes/api.auth.register.ts"),
  route("/api/auth/logout", "routes/api.auth.logout.ts"),
  route("/api/auth/refresh", "routes/api.auth.refresh.ts"),
  route("/api/auth/forgot-password", "routes/api.auth.forgot-password.ts"),
  route("/api/todos", "routes/api.todos.ts"),
  route("/api/todos/:id", "routes/api.todos.$id.ts"),
] satisfies RouteConfig;
