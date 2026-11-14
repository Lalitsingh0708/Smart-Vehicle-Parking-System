import nodemailer from "nodemailer";

/**
 * Platform Administrator Email (Sole authorized admin)
 */
export const PLATFORM_ADMIN_EMAIL = "lalitbaghel0708@gmail.com";

/**
 * Configure Nodemailer SMTP Transporter
 */
function getTransporter() {
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || "").trim();
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || "").replace(/\s+/g, "").trim();

  if (!user || !pass) {
    return null;
  }

  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  // Use nodemailer built-in service helper if Gmail
  if (host === "smtp.gmail.com" || user.endsWith("@gmail.com")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Send 6-Digit Email Verification / Login OTP
 */
export async function sendVerificationOtpEmail({ email, name, otp, purpose = "login" }) {
  const cleanEmail = email.toLowerCase().trim();
  const userName = name || "User";
  const isLogin = purpose === "login";

  console.log("--------------------------------------------------");
  console.log(`[EMAIL SERVICE] ${isLogin ? "Login" : "Registration"} OTP for ${cleanEmail}: ${otp}`);
  console.log("--------------------------------------------------");

  const transporter = getTransporter();

  if (!transporter) {
    console.log("[EMAIL SERVICE] SMTP / EMAIL credentials not configured.");
    console.log("[EMAIL SERVICE] Running in simulation mode. OTP displayed above.");
    return {
      success: true,
      simulated: true,
      otp,
      message: "SMTP not configured yet. Check server terminal for OTP code.",
    };
  }

  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || "").trim();
  const fromAddress =
    process.env.SMTP_FROM ||
    `"Where Did I Park?" <${user}>`;

  const headingText = isLogin ? "Login Verification Code" : "Verify Your Email Address";
  const subText = isLogin
    ? `Hello <strong>${userName}</strong>,<br>You requested to sign in to <strong>Where Did I Park?</strong>. Use the 6-digit verification code below to authenticate and access your dashboard.`
    : `Hello <strong>${userName}</strong>,<br>Thank you for creating an account on <strong>Where Did I Park?</strong>. Use the 6-digit verification code below to verify your email and activate your account.`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${headingText} - Where Did I Park?</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1815;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #FFFFFF; border-radius: 16px; border: 1.5px solid #E2D9CC; box-shadow: 0 4px 16px rgba(0,0,0,0.05); overflow: hidden;">
                <!-- Header Banner -->
                <tr>
                  <td style="background-color: #176B5B; padding: 28px 24px; text-align: center;">
                    <h1 style="margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 900; letter-spacing: -0.02em;">
                      Where Did I Park?
                    </h1>
                    <p style="margin: 6px 0 0; color: #D4AF37; font-size: 11px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;">
                      Two-Wheeler Parking Management
                    </p>
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td style="padding: 32px 28px;">
                    <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 800; color: #1C1815;">
                      ${headingText}
                    </h2>
                    <p style="margin: 0 0 20px; font-size: 13.5px; line-height: 1.6; color: #706254;">
                      ${subText}
                    </p>

                    <!-- OTP Code Box -->
                    <div style="background-color: #FAF7F2; border: 2px dashed #B08528; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                      <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #706254; display: block; margin-bottom: 8px;">
                        Your One-Time Password (OTP)
                      </span>
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #176B5B; display: inline-block;">
                        ${otp}
                      </span>
                    </div>

                    <p style="margin: 0 0 16px; font-size: 12px; line-height: 1.5; color: #8C7B6B;">
                      Important: This verification code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
                    </p>

                    <p style="margin: 0; font-size: 11.5px; line-height: 1.5; color: #A09383; border-top: 1px solid #EFE9DF; padding-top: 16px;">
                      If you did not request this verification code, please ignore this email or change your password immediately.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #FAF6EE; padding: 18px 24px; text-align: center; border-top: 1px solid #EFE9DF;">
                    <p style="margin: 0; font-size: 11px; color: #706254;">
                      © ${new Date().getFullYear()} Where Did I Park? • Two-Wheeler Parking Management System
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: cleanEmail,
      subject: `[${otp}] Your Where Did I Park? ${isLogin ? "Login Code" : "Verification Code"}`,
      html: htmlContent,
      text: `Hello ${userName},\n\nYour Where Did I Park? ${isLogin ? "login verification" : "verification"} code is: ${otp}\n\nThis code expires in 10 minutes.\n\n© ${new Date().getFullYear()} Where Did I Park?`,
    });

    console.log(`[EMAIL SERVICE] Email successfully delivered to ${cleanEmail}. MessageId: ${info.messageId}`);

    return {
      success: true,
      simulated: false,
      messageId: info.messageId,
      message: `Verification code successfully sent to ${cleanEmail}.`,
    };
  } catch (err) {
    console.error("[EMAIL SERVICE] Failed to send email via SMTP:", err.message);
    return {
      success: true,
      simulated: true,
      otp,
      error: err.message,
      message: `Failed to deliver email (${err.message}). Dev OTP logged to console.`,
    };
  }
}

/**
 * Send Attendant Onboarding Approval Notification Email
 */
export async function sendAttendantApprovedEmail({ email, name, lotName }) {
  const cleanEmail = email.toLowerCase().trim();
  const userName = name || "Booth Attendant";
  const facility = lotName || "Main Parking Facility";

  const transporter = getTransporter();
  if (!transporter) return { success: false, simulated: true };

  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || "").trim();
  const fromAddress = process.env.SMTP_FROM || `"Where Did I Park?" <${user}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Attendant Account Approved - Where Did I Park?</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1815;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #FFFFFF; border-radius: 16px; border: 1.5px solid #E2D9CC; box-shadow: 0 4px 16px rgba(0,0,0,0.05); overflow: hidden;">
                <tr>
                  <td style="background-color: #176B5B; padding: 28px 24px; text-align: center;">
                    <h1 style="margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 900;">
                      Where Did I Park?
                    </h1>
                    <p style="margin: 6px 0 0; color: #D4AF37; font-size: 11px; font-weight: 800; text-transform: uppercase;">
                      Attendant Onboarding Approved
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 32px 28px;">
                    <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 800; color: #176B5B;">
                      Account Verified &amp; Onboarded
                    </h2>
                    <p style="margin: 0 0 16px; font-size: 13.5px; line-height: 1.6; color: #706254;">
                      Hello <strong>${userName}</strong>,<br>
                      Your Booth Attendant account has been reviewed and <strong>approved</strong> by Platform Administrator Lalit Baghel.
                    </p>

                    <div style="background-color: #FAF7F2; border: 1.5px solid #E2D9CC; border-radius: 12px; padding: 18px; margin: 20px 0;">
                      <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #8C7E72; display: block; margin-bottom: 6px;">
                        Assigned Facility Station
                      </span>
                      <span style="font-size: 16px; font-weight: 900; color: #176B5B; display: block;">
                        ${facility}
                      </span>
                    </div>

                    <p style="margin: 0 0 20px; font-size: 13px; line-height: 1.5; color: #706254;">
                      You can now access your Booth Station at <strong>/attendant</strong> to perform live QR check-ins, departures, and bay monitoring.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="background-color: #FAF6EE; padding: 18px 24px; text-align: center; border-top: 1px solid #EFE9DF;">
                    <p style="margin: 0; font-size: 11px; color: #706254;">
                      © ${new Date().getFullYear()} Where Did I Park? • Two-Wheeler Parking Management System
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: cleanEmail,
      subject: "Your Where Did I Park? Attendant Account is Approved",
      html: htmlContent,
      text: `Hello ${userName},\n\nYour Booth Attendant account has been approved by Platform Administrator Lalit Baghel. You have been assigned to ${facility}.\n\nYou can now sign in at /attendant to manage parking operations.`,
    });
    return { success: true };
  } catch (err) {
    console.error("[EMAIL SERVICE] Failed to send approval email:", err.message);
    return { success: false, error: err.message };
  }
}
