import * as authService from "../services/authService.js";

export async function login(req, res) {
  const { token, user } = await authService.login(req.body.email, req.body.password);
  res.json({ token, user });
}

export function me(req, res) {
  res.json({ user: req.user });
}
