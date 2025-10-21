import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("game", "routes/games.tsx"),
  route("leaderboard", "routes/leaderboard.tsx"),
  route("admin", "routes/admin.tsx"),
] satisfies RouteConfig;