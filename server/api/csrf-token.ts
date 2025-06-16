export default defineEventHandler((event) => {
  console.log("[API] Sending CSRF token to client:", event.context.csrfToken);
  return {
    csrfToken: event.context.csrfToken,
  };
});
