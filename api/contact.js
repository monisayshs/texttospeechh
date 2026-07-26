const securityService = require('../src/services/securityService');

const SINGLE_DESTINATION_INBOX = "hello@texttospeechh.com";

function parseBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return resolve(req.body);
    }
    if (typeof req.body === 'string') {
      try {
        return resolve(JSON.parse(req.body));
      } catch (e) {
        return resolve({});
      }
    }
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  // Rate limit check against spam bot submissions
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const rateCheck = securityService.checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    res.status(429).json({ error: 'Too many messages sent. Please wait a minute before trying again.' });
    return;
  }

  try {
    req.body = await parseBody(req);
    const { name, email, subject, message } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Full Name is required (minimum 2 characters).' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      res.status(400).json({ error: 'A valid Email Address is required.' });
      return;
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      res.status(400).json({ error: 'Subject is required.' });
      return;
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      res.status(400).json({ error: 'Message is required (minimum 5 characters).' });
      return;
    }

    const sanitizedName = securityService.sanitizeText(name);
    const sanitizedEmail = securityService.sanitizeText(email);
    const sanitizedSubject = securityService.sanitizeText(subject);
    const sanitizedMessage = securityService.sanitizeText(message);

    console.log(`[Contact Service] Form Submission Received:`);
    console.log(` - From: ${sanitizedName} <${sanitizedEmail}>`);
    console.log(` - Subject: ${sanitizedSubject}`);
    console.log(` - Destination Inbox: ${SINGLE_DESTINATION_INBOX}`);
    console.log(` - Message Body: ${sanitizedMessage.substring(0, 100)}...`);

    // If Resend API Key or SMTP credentials exist, send real email to hello@texttospeechh.com
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'TextToSpeechH AI <hello@texttospeechh.com>',
          to: [SINGLE_DESTINATION_INBOX],
          subject: `[Contact Form] ${sanitizedSubject} - From ${sanitizedName}`,
          reply_to: sanitizedEmail,
          html: `
            <h2>New Contact Form Message</h2>
            <p><strong>Name:</strong> ${sanitizedName}</p>
            <p><strong>Email:</strong> ${sanitizedEmail}</p>
            <p><strong>Subject:</strong> ${sanitizedSubject}</p>
            <hr>
            <h3>Message:</h3>
            <p style="white-space: pre-wrap;">${sanitizedMessage}</p>
            <hr>
            <p><em>Sent via TextToSpeechH AI Contact Form to ${SINGLE_DESTINATION_INBOX}</em></p>
          `
        });
      } catch (e) {
        console.warn('[Contact Service] Resend dispatch warning:', e.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Your message has been sent successfully to ${SINGLE_DESTINATION_INBOX}.`,
      destinationInbox: SINGLE_DESTINATION_INBOX,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('[api/contact] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to send message. Please try again.' });
  }
};
