import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      prompt,
      aspect_ratio = "1:1",
      style = "",
      project_id = null,
      type = "photo",
      image_size = "1K",
      // OpenRouter model — default to a capable image generation model
      model = "openai/gpt-4o", // PASTE HERE! Replace with your preferred OpenRouter image model
    } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── OpenRouter API Key ──────────────────────────────────────────────────
    // Set OPENROUTER_API_KEY in Supabase Secrets Dashboard
    const apiKey = Deno.env.get("OPENROUTER_API_KEY"); // PASTE HERE! Your OpenRouter API key in Secrets
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY is not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

    const fullPrompt = style
      ? `${prompt}. Style: ${style}. Aspect ratio: ${aspect_ratio}. Resolution: ${image_size}.`
      : `${prompt}. Aspect ratio: ${aspect_ratio}. Resolution: ${image_size}.`;

    console.log(`Generating image via OpenRouter: model=${model}, size=${image_size}, aspect=${aspect_ratio}`);

    const aiResponse = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://kovallabs.com",
        "X-Title": "КовальЛабс",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: fullPrompt,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("OpenRouter error:", errText);
      return new Response(JSON.stringify({ error: `OpenRouter: ${errText}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();

    // Extract image URL from response (OpenRouter returns base64 or URL depending on model)
    const messageContent = aiData?.choices?.[0]?.message?.content ?? "";
    const description = typeof messageContent === "string" ? messageContent : "";

    // Try to extract image URL from content (some models embed URLs)
    const urlMatch = description.match(/https?:\/\/\S+\.(png|jpg|jpeg|webp)/i);
    const base64Match = description.match(/data:image\/\w+;base64,([A-Za-z0-9+/=]+)/);

    let publicUrl = "";

    if (base64Match) {
      // Upload base64 image to storage
      const base64Data = base64Match[0].replace(/^data:image\/\w+;base64,/, "");
      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      const blob = new Blob([bytes], { type: "image/png" });

      const fileName = `${user.id}/${crypto.randomUUID()}.png`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from("images")
        .upload(fileName, blob, { contentType: "image/png", cacheControl: "3600", upsert: false });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return new Response(JSON.stringify({ error: `Storage: ${uploadError.message}` }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: { publicUrl: url } } = supabaseAdmin.storage.from("images").getPublicUrl(fileName);
      publicUrl = url;

    } else if (urlMatch) {
      // Download and re-upload to storage for persistent URL
      const imgRes = await fetch(urlMatch[0]);
      if (imgRes.ok) {
        const imgBuffer = await imgRes.arrayBuffer();
        const fileName = `${user.id}/${crypto.randomUUID()}.png`;
        await supabaseAdmin.storage
          .from("images")
          .upload(fileName, new Uint8Array(imgBuffer), { contentType: "image/png", upsert: false });
        const { data: { publicUrl: url } } = supabaseAdmin.storage.from("images").getPublicUrl(fileName);
        publicUrl = url;
      }
    } else {
      // Fallback: return description as text result (model may not support image gen)
      console.warn("No image found in OpenRouter response. Check model supports image generation.");
      return new Response(JSON.stringify({
        error: "Model did not return an image. Please use an image-capable model via OpenRouter (e.g. stability-ai/sdxl, black-forest-labs/flux-1.1-pro).",
        hint: "Configure image generation model in OPENROUTER_IMAGE_MODEL secret.",
      }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cost calculation
    const baseCost = type === "photo" ? 15 : type === "video" ? 50 : 75;
    const sizePremium = image_size === "4K" ? 60 : image_size === "2K" ? 20 : 0;
    const cost = baseCost + sizePremium;

    // Save asset record
    await supabaseAdmin.from("generated_assets").insert({
      user_id: user.id,
      project_id: project_id || null,
      type,
      prompt: fullPrompt,
      result_url: publicUrl,
      cost,
      status: "completed",
    });

    return new Response(JSON.stringify({ url: publicUrl, description, cost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
