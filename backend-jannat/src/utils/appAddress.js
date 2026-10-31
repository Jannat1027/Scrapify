import { env } from "../config/env.js";

export function appAddress(origin) {
  const address = (origin || "").replace(/\/$/, "");
  const localDev = !env.isProduction && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(address);
  return localDev || env.clientUrls.includes(address) ? address : env.frontendUrl;
}
