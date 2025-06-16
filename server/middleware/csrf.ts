import { defineEventHandler, getCookie, setCookie } from "h3";
import Tokens from "csrf";

const tokens = new Tokens();

export default defineEventHandler((event) => {
  let csrfSecret = getCookie(event, "csrfSecret");

  if (!csrfSecret) {
    csrfSecret = tokens.secretSync();
    setCookie(event, "csrfSecret", csrfSecret, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    //console.log("[CSRF] New CSRF secret generated and set in cookie:",csrfSecret);
  } else {
    //console.log("[CSRF] Existing CSRF secret from cookie:", csrfSecret);
  }

  const csrfToken = tokens.create(csrfSecret);
  event.context.csrfToken = csrfToken;

  //console.log("[CSRF] Secret:", csrfSecret, "Token:", csrfToken);
});
