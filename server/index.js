import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
const port = process.env.PORT || 5050;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      })
    : null;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
      "http://localhost:5175",
      "http://127.0.0.1:5175",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.post("/api/ai/format", async (req, res) => {
  try {
    const { complaint } = req.body || {};
    if (!complaint || !complaint.trim()) {
      return res.status(400).json({ error: "Complaint text is required." });
    }

    // Direct API Key integration as requested
    const apiKey = "AIzaSyD6gaacvT3XbOOIUdFzjFHKvxEjkDpTBVk";

    const prompt =
      "Rewrite the complaint into one formal, concise paragraph in third-person perspective. " +
      "Start naturally with phrasing like \"This complaint is about...\" (do not use \"A formal complaint is registered\"). " +
      "Fix spelling and grammar, keep the meaning unchanged, and do not add suggestions, headings, bullet points, or templates. " +
      "Return only the improved paragraph.\n\n" +
      `Complaint: ${complaint.trim()}`;

    /** * FINAL SOLUTION FOR 404: z
     * As of March 2026, 'gemini-1.5-flash' is often deprecated on v1beta.
     * We use 'gemini-3.1-flash' which is the current stable workhorse.
     */
    const model = "gemini-3-flash-preview"; 
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Google API Error:", data);
      
      // Specific handling for common 2026 quota issues
      if (data.error?.code === 429) {
        return res.status(429).json({ 
          error: "Quota exceeded. This often happens on new accounts. Please wait 60 seconds or verify your billing in Google AI Studio to unlock the free tier." 
        });
      }

      return res.status(response.status).json({
        error: data.error?.message || "Gemini API request failed.",
      });
    }

    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!output) {
      return res.status(500).json({ error: "No AI output received." });
    }

    return res.json({ text: output });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: error.message || "AI request failed." });
  }
});

app.post("/api/admin/complaint-details", async (req, res) => {
  try {
    if (!supabase) {
      return res
        .status(500)
        .json({ error: "Supabase server client is not configured." });
    }
    const { complaint_id } = req.body || {};
    if (!complaint_id) {
      return res.status(400).json({ error: "complaint_id is required." });
    }

    const { data: complaint, error: complaintError } = await supabase
      .from("complaints")
      .select("id,citizen_id,is_anonymous")
      .eq("id", complaint_id)
      .maybeSingle();

    if (complaintError || !complaint) {
      return res
        .status(404)
        .json({ error: complaintError?.message || "Complaint not found." });
    }

    if (complaint.is_anonymous) {
      return res.json({
        is_anonymous: true,
        name: "Anonymous",
        contact: "N/A",
      });
    }

    const { data: citizen, error: citizenError } = await supabase
      .from("profiles")
      .select("full_name,email,mobile_number")
      .eq("id", complaint.citizen_id)
      .maybeSingle();

    if (citizenError) {
      return res.status(500).json({ error: citizenError.message });
    }

    return res.json({
      is_anonymous: false,
      name: citizen?.full_name || "Unknown",
      contact: `${citizen?.email || "N/A"} | ${citizen?.mobile_number || "N/A"}`,
    });
  } catch (error) {
    console.error("Complaint details error:", error);
    return res.status(500).json({ error: "Failed to fetch complaint details." });
  }
});

app.listen(port, () => {
  console.log(`NagarSetu AI server listening on ${port}`);
});
