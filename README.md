# Auth With JWT – Nuxt3 & Nitro Full Stack Template

A modern authentication template built with **Nuxt3** and **Nitro**, featuring secure JWT-based authentication, social login (Google OAuth2), and best practices for full-stack security.

## 🚀 Live Demo

- [Live App](https://nuxt-auth-jwt.onrender.com)

## ✨ Features

- **Full Stack Nuxt3 + Nitro**: Universal rendering, API routes, and server-side logic.
- **JWT Authentication**: Secure, stateless user sessions.
- **Social Login**: Google OAuth2 integration.
- **Password Security**: Bcrypt password hashing.
- **Bot Protection**: Google reCAPTCHA v3.
- **CSRF Protection**: Secure API endpoints.
- **XSS Prevention**: Input validation and sanitization.
- **Password Requirements**: Enforced strong password policy.
- **Multi-factor Ready**: Easily extendable for email or other factors.

## 🛠️ Tech Stack

- [Nuxt3](https://nuxt.com/) (Vue 3)
- [Nitro](https://nitro.unjs.io/) server engine
- MongoDB (users & sessions)
- JWT (jsonwebtoken)
- Bcrypt
- Google OAuth2
- reCAPTCHA v3

## 📦 Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/01057057kim/Nuxt-Auth-JWT.git
   cd Nuxt-Auth-JWT
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**  
    ```
    db-usernam=
    db-password=
    ip-address=
    MONGODB_URI=
    SALT_ROUNDS=
    NODE_ENV=development
    RECAPTCHA_SECRET_KEY=
    NUXT_PUBLIC_RECAPTCHA_SITE_KEY=
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    GOOGLE_REDIRECT_URI=
    JWT_SECRET=
    ```
   Copy to `.env` and fill in your secrets.


4. **Run the app:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**
