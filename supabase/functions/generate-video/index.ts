import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// OpenRouter base URL
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// ── Video generation model via OpenRouter ────────────────────────────────────
// PASTE HERE! Set your preferred video model key in Supabase Secrets as OPENROUTER_VIDEO_MODEL
// Examples: "openai/sora", "google/veo-2", "stability-ai/stable-video-diffusion"
const DEFAULT_VIDEO_MODEL = "openai/sora"; // PASTE HERE!

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── OpenRouter API Key ────────────────────────────────────────────────
    // Set OPENROUTER_API_KEY in Supabase Secrets Dashboard
    const apiKey = Deno.env.get("OPENROUTER_API_KEY"); // PASTE HERE! Your OpenRouter API key
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY is not configured. Add it to Supabase Secrets." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // ── ACTION: create ────────────────────────────────────────────────────────
    if (action === "create") {
      const {
        prompt,
        model = Deno.env.get("OPENROUTER_VIDEO_MODEL") ?? DEFAULT_VIDEO_MODEL,
        referenceImageUrl,
        projectId,
        aspectRatio = "landscape",
        seconds = 5,
        withSound = false,
      } = body;

      if (!prompt) {
        return new Response(JSON.stringify({ error: "prompt is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Cost calculation based on duration and options
      const baseCost = 50;
      const durationBonus = Math.max(0, (seconds - 5)) * 10;
      const soundBonus = withSound ? 30 : 0;
      const cost = baseCost + durationBonus + soundBonus;

      console.log(`[generate-video] Creating via OpenRouter: model=${model}, prompt="${prompt.slice(0, 80)}", seconds=${seconds}`);

      // Build OpenRouter video generation request
      const messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> = [];

      if (referenceImageUrl) {
        messages.push({
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: referenceImageUrl },
            },
            {
              type: "text",
              text: `Generate a ${seconds}-second ${aspectRatio === "portrait" ? "9:16" : "16:9"} video based on this reference image. ${prompt}${withSound ? " Include realistic ambient sound." : ""}`,
            },
          ],
        });
      } else {
        messages.push({
          role: "user",
          content: `Generate a ${seconds}-second ${aspectRatio === "portrait" ? "9:16" : "16:9"} video: ${prompt}${withSound ? " Include realistic ambient sound." : ""}`,
        });
      }

      const predRes = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://kovallabs.com",
          "X-Title": "КовальЛабс",
        },
        body: JSON.stringify({
          model,
          messages,
          // OpenRouter generation parameters
          extra_body: {
            duration: seconds,
            aspect_ratio: aspectRatio === "portrait" ? "9:16" : "16:9",
            with_audio: withSound,
          },
        }),
      });

      if (!predRes.ok) {
        const errText = await predRes.text();
        console.error("[generate-video] OpenRouter error:", errText);
        return new Response(JSON.stringify({ error: `OpenRouter: ${errText}` }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const predData = await predRes.json();

      // OpenRouter returns a generation ID for async video models
      const generationId = predData?.id ?? predData?.generation_id ?? crypto.randomUUID();
      const status = predData?.status ?? "processing";

      console.log(`[generate-video] Generation started: id=${generationId}, status=${status}`);

      // Insert asset record with pending status
      const { data: asset, error: assetError } = await supabaseAdmin
        .from("generated_assets")
        .insert({
          user_id: user.id,
          project_id: projectId || null,
          type: "video",
          prompt,
          result_url: "",
          cost,
          status: "pending",
        })
        .select("id")
        .single();

      if (assetError) {
        console.error("[generate-video] Asset insert error:", assetError);
      }

      return new Response(JSON.stringify({
        predictionId: generationId,
        assetId: asset?.id ?? null,
        status,
        cost,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: check ─────────────────────────────────────────────────────────
    if (action === "check") {
      const { predictionId, assetId } = body;
      if (!predictionId) {
        return new Response(JSON.stringify({ error: "predictionId is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check generation status via OpenRouter
      const statusRes = await fetch(`${OPENROUTER_BASE_URL}/generation?id=${predictionId}`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://kovallabs.com",
          "X-Title": "КовальЛабс",
        },
      });

      if (!statusRes.ok) {
        const errText = await statusRes.text();
        return new Response(JSON.stringify({ error: `OpenRouter: ${errText}` }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const statusData = await statusRes.json();
      const currentStatus = statusData?.status ?? "processing";

      console.log(`[generate-video] Status check: id=${predictionId}, status=${currentStatus}`);

      if (currentStatus === "failed" || currentStatus === "canceled" || currentStatus === "error") {
        if (assetId) {
          await supabaseAdmin
            .from("generated_assets")
            .update({ status: "failed" })
            .eq("id", assetId);
        }
        return new Response(JSON.stringify({
          status: "failed",
          error: statusData?.error ?? "Generation failed",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (currentStatus === "processing" || currentStatus === "queued" || currentStatus === "starting") {
        return new Response(JSON.stringify({
          status: "processing",
          progress: statusData?.progress ?? 0,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (currentStatus === "succeeded" || currentStatus === "completed") {
        // Extract video URL from OpenRouter response
        const videoUrl = statusData?.output?.video_url
          ?? statusData?.choices?.[0]?.message?.content
          ?? statusData?.output
          ?? null;

        if (!videoUrl || typeof videoUrl !== "string") {
          return new Response(JSON.stringify({ status: "processing", progress: 50 }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log("[generate-video] Downloading video from:", videoUrl);

        // Download and re-upload video to Supabase Storage
        const videoRes = await fetch(videoUrl);
        if (!videoRes.ok) throw new Error("Failed to download video from OpenRouter");

        const arrayBuffer = await videoRes.arrayBuffer();
        const videoBlob = new Blob([arrayBuffer], { type: "video/mp4" });
        const fileName = `${user.id}/${predictionId}.mp4`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from("videos")
          .upload(fileName, videoBlob, { contentType: "video/mp4", upsert: true });

        if (uploadError) {
          console.error("[generate-video] Upload error:", uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabaseAdmin.storage.from("videos").getPublicUrl(fileName);
        console.log("[generate-video] Uploaded to:", publicUrl);

        if (assetId) {
          await supabaseAdmin
            .from("generated_assets")
            .update({ result_url: publicUrl, status: "completed" })
            .eq("id", assetId);
        }

        return new Response(JSON.stringify({
          status: "succeeded",
          videoUrl: publicUrl,
          assetId,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ status: currentStatus, progress: statusData?.progress ?? 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[generate-video] Unhandled error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
