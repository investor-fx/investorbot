import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const systemInstruction = `You are INVESTORBOT, a helpful multifunctional assistant for research, business, coding, productivity, and planning. Be clear about uncertainty. You cannot control phones in this version; never claim you performed device actions. For any future device actions, require explicit device-owner authorization and confirmation for sensitive actions. Never ask the user to paste passwords, API keys, or one-time verification codes into chat.`;

const server = http.createServer(async (req, res) => {
  const setHeaders = (type="application/json; charset=utf-8") => {
    res.setHeader("Content-Type", type);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Cache-Control", "no-store");
  };
  try {
    if (req.method === "GET" && req.url === "/api/health") {
      setHeaders();
      res.writeHead(200);
      res.end(JSON.stringify({ok:true, configured:Boolean(API_KEY)}));
      return;
    }
    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
      setHeaders("text/html; charset=utf-8");
      res.writeHead(200);
      res.end(await readFile(path.join(__dirname, "index.html")));
      return;
    }
    if (req.method === "POST" && req.url === "/api/chat") {
      if (!API_KEY) {
        setHeaders(); res.writeHead(503);
        res.end(JSON.stringify({error:"Server API key is not configured. Set GEMINI_API_KEY in the server environment."}));
        return;
      }
      let raw = "";
      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > 30000) { setHeaders(); res.writeHead(413); res.end(JSON.stringify({error:"Request too large"})); return; }
      }
      const body = JSON.parse(raw || "{}");
      const message = typeof body.message === "string" ? body.message.trim().slice(0,5000) : "";
      if (!message) { setHeaders(); res.writeHead(400); res.end(JSON.stringify({error:"Enter a message"})); return; }
      const prior = Array.isArray(body.history) ? body.history.slice(-12).map(m => ({
        role: m && m.role === "model" ? "model" : "user",
        parts: [{text: String(m && m.text || "").slice(0,5000)}]
      })) : [];
      // Remove the current user turn from supplied history; append it once below.
      if (prior.length && prior[prior.length-1].role === "user" && prior[prior.length-1].parts[0].text === message) prior.pop();
      const payload = {
        system_instruction: {parts:[{text:systemInstruction}]},
        contents: [...prior, {role:"user",parts:[{text:message}]}],
        generationConfig: {temperature:0.6, maxOutputTokens:1200}
      };
      const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
        method:"POST",
        headers:{"Content-Type":"application/json","x-goog-api-key":API_KEY},
        body:JSON.stringify(payload)
      });
      const result = await upstream.json().catch(()=>({}));
      if (!upstream.ok) {
        setHeaders(); res.writeHead(502);
        res.end(JSON.stringify({error: result.error?.message || "AI provider request failed"}));
        return;
      }
      const reply = (result.candidates?.[0]?.content?.parts || []).map(p=>p.text||"").join("\n").trim();
      setHeaders(); res.writeHead(200);
      res.end(JSON.stringify({reply: reply || "The AI returned no text. Please try again."}));
      return;
    }
    setHeaders(); res.writeHead(404); res.end(JSON.stringify({error:"Not found"}));
  } catch (err) {
    setHeaders(); res.writeHead(500); res.end(JSON.stringify({error:"Server error. Check configuration and try again."}));
  }
});
server.listen(PORT, "0.0.0.0", () => console.log(`INVESTORBOT server listening on port ${PORT}`));
