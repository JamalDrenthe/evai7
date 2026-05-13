import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { verifySessionToken } from "../kimi/session";
import type { User } from "@db/schema";

const DEMO_USER: User = {
  id: 0,
  unionId: "demo-user",
  name: "Demo User",
  email: "demo@evai.nl",
  avatar: null,
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignInAt: new Date(),
};

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    console.warn("[auth] No session cookie found in request.");
    throw Errors.forbidden("Invalid authentication token.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }

  if (claim.unionId === "demo-user") {
    return DEMO_USER;
  }

  const { findUserByUnionId } = await import("../queries/users");
  const user = await findUserByUnionId(claim.unionId);
  if (!user) {
    throw Errors.forbidden("User not found. Please re-login.");
  }
  return user;
}
