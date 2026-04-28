import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// ── Generate 4-digit OTP ──────────────────────────────────────────────────────
function generateOtp(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// ── OTP email HTML ────────────────────────────────────────────────────────────
function buildEmailHtml(code: string): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Код подтверждения — КовальЛабс</title>
</head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:20px;overflow:hidden;border:1px solid #1e3a5f;">
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a8a,#1d4ed8);padding:28px 40px;text-align:center;">
            <span style="font-size:20px;font-weight:800;color:#f0f6ff;">⚡ КовальЛабс</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 28px;">
            <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#f0f6ff;">Код подтверждения</h1>
            <p style="margin:0 0 28px;font-size:15px;color:#94a3b8;line-height:1.6;">
              Используйте этот код для создания аккаунта на платформе КовальЛабс.
            </p>
            <div style="background:#1e293b;border:2px solid #2563eb;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:#60a5fa;">Ваш код</p>
              <div style="font-size:54px;font-weight:800;letter-spacing:18px;color:#f0f6ff;font-family:'Courier New',monospace;line-height:1.2;padding:0 8px;">
                ${code}
              </div>
              <p style="margin:12px 0 0;font-size:12px;color:#64748b;">Действителен 15 минут</p>
            </div>
            <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
              Если вы не регистрировались на КовальЛабс — просто проигнорируйте это письмо.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 40px 28px;border-top:1px solid #1e293b;text-align:center;">
            <p style="margin:0;font-size:12px;color:#475569;">
              © 2025 КовальЛабс · <a href="https://kovallabs.com" style="color:#60a5fa;text-decoration:none;">kovallabs.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── SMTP send via nodemailer ──────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const { createTransport } = await import("npm:nodemailer@6");

  const host   = Deno.env.get("SMTP_HOST") ?? "";
  const port   = Number(Deno.env.get("SMTP_PORT") ?? "465");
  const secure = Deno.env.get("SMTP_SECURE") !== "false"; // default true
  const user   = Deno.env.get("SMTP_USER") ?? "";
  const pass   = Deno.env.get("SMTP_PASS") ?? "";
  const from   = Deno.env.get("SMTP_FROM") ?? user;

  const transporter = createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  await transporter.sendMail({
    from: `"КовальЛабс" <${from}>`,
    to,
    subject,
    html,
  });
}

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, email, code } = body as {
      action?: string;
      email?: string;
      code?: string;
    };

    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // ── ACTION: verify ──────────────────────────────────────────────────────
    if (action === "verify") {
      if (!code) {
        return new Response(JSON.stringify({ error: "code is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: otpRows, error: fetchErr } = await supabaseAdmin
        .from("otp_codes")
        .select("id, code, expires_at, used")
        .eq("email", normalizedEmail)
        .eq("used", false)
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchErr || !otpRows || otpRows.length === 0) {
        return new Response(JSON.stringify({ error: "Код не найден. Запросите новый." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const row = otpRows[0];

      // Check expiry
      if (new Date(row.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: "Код истёк. Запросите новый." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check code match
      if (row.code !== code.trim()) {
        return new Response(JSON.stringify({ error: "Неверный код подтверждения." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Mark as used
      await supabaseAdmin
        .from("otp_codes")
        .update({ used: true })
        .eq("id", row.id);

      console.log(`OTP verified for ${normalizedEmail}`);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: send (default) ────────────────────────────────────────────────
    // Invalidate existing unused codes
    await supabaseAdmin
      .from("otp_codes")
      .update({ used: true })
      .eq("email", normalizedEmail)
      .eq("used", false);

    const newCode = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error: insertErr } = await supabaseAdmin
      .from("otp_codes")
      .insert({ email: normalizedEmail, code: newCode, expires_at: expiresAt });

    if (insertErr) {
      console.error("OTP insert error:", insertErr);
      return new Response(JSON.stringify({ error: "Не удалось создать код" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await sendEmail(
      email,
      "Ваш код подтверждения — КовальЛабс",
      buildEmailHtml(newCode),
    );

    console.log(`OTP sent to ${normalizedEmail}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-otp error:", err);
    const msg = err instanceof Error ? err.message : "Internal error";
    return new Response(JSON.stringify({ error: `SMTP: ${msg}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
