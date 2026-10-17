# INVESTORBOT — Step 3 AI backend starter

This version adds a small Node.js server that keeps the Gemini API key on the server and connects the dashboard chat to the Gemini API.

## Important
- This enables AI chat only.
- It does NOT pair or control Android phones yet.
- Never put the API key into `index.html`, screenshots, public GitHub repositories, or chat messages.
- API availability, model names, quotas, and free allowances can change. Google AI Studio may require account eligibility and has usage limits.

## Files
- `index.html`: INVESTORBOT dashboard
- `server.js`: server-side API proxy
- `package.json`: start command
- `.env.example`: configuration template only; it contains no secret

## What you need
1. A hosting or development environment that supports Node.js 18+ and server-side environment variables.
2. A Gemini API key created in Google AI Studio.
3. Set `GEMINI_API_KEY` as a secret/environment variable in that environment. Do not paste the key into source code.
4. Start with `npm start`.
5. Open the server's provided URL. Do not open `index.html` directly from the file manager; `/api/chat` needs the server.

## Test
- Visit `/api/health`. It should return `{"ok":true,"configured":true}` when the secret is set.
- Send a harmless prompt in the chat, e.g. `Say hello and explain what you can help with`.
- If you get a provider error, check the server logs, API key setup, model availability, and quota.

## Local computer setup (if available)
1. Install Node.js 18 or later.
2. Extract the ZIP.
3. In the project folder, run `npm start`.
4. Set `GEMINI_API_KEY` in your terminal environment before starting. Do not commit secrets to source control.

## Next stages
After the AI chat is tested, build the native Android companion and a secure, consent-based pairing/remote session. Remote control needs explicit permissions, visible session status, revocation, encrypted transport, and checks before sensitive actions. Do not attempt to bypass Android security or other apps' protections.
