export default defineNuxtPlugin(() => {
  if (process.client) {
    const config = useRuntimeConfig();
    const siteKey = config.public.recaptchaSiteKey;

    if (!siteKey) {
      console.error("reCAPTCHA site key is not configured");
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    console.log("reCAPTCHA script loaded");
  }
});
