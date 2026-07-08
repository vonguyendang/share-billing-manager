/**
 * Google Apps Script Webhook for Share Billing Manager
 * 
 * Instructions:
 * 1. Go to script.google.com and create a new project.
 * 2. Paste this code.
 * 3. Change `SECRET_KEY` to a strong random string.
 * 4. Click Deploy > New deployment.
 * 5. Select type "Web app".
 * 6. Execute as "Me", Who has access: "Anyone".
 * 7. Click Deploy, authorize permissions, and copy the Web App URL.
 * 8. Put the URL and SECRET_KEY in Cloudflare Pages environment variables.
 */

const SECRET_KEY = 'YOUR_SECRET_KEY_HERE'; // Change this!

function doPost(e) {
  try {
    // Check authorization header
    let authHeader = '';
    if (e.postData && e.postData.contents) {
        // Sometimes headers aren't parsed easily depending on request, 
        // fallback to putting secret in payload if headers fail, but let's try standard token first.
        // GAS doesn't expose request headers cleanly in `doPost(e)` unless you parse them.
        // Actually, GAS doesn't pass headers in `e` reliably. 
        // Let's pass the secret in the JSON body for simpler implementation in GAS.
    }

    const payload = JSON.parse(e.postData.contents);
    
    // Instead of header, for GAS webhook, checking payload is safer
    // The sender must include `secret` in JSON body.
    
    // BUT our current Pages Function sends Bearer token in headers.
    // GAS actually doesn't expose headers in the `e` object for Web Apps.
    // So we must change the Pages Function, OR we can just check payload. 
    // Wait, let me adjust the GAS script to work with how I wrote `utils/email.ts`.
    // Actually `utils/email.ts` sends Bearer token. I will modify `email.ts` to also send `secret` in body for GAS compatibility.
    // I will write this GAS script assuming `secret` is in the payload.

    if (payload.secret !== SECRET_KEY) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (!payload.to || !payload.subject || !payload.body) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Missing parameters' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Send email using MailApp (quota: ~100/day for consumer, 1500/day for Workspace)
    const emailOptions = {
      to: payload.to,
      subject: payload.subject,
      body: payload.body || "Please view in HTML format."
    };
    
    if (payload.htmlBody) {
      emailOptions.htmlBody = payload.htmlBody;
    }

    MailApp.sendEmail(emailOptions);

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
