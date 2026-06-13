import 'dotenv/config';
import express from 'express';
import { Resend } from 'resend';

const PORT = process.env.PORT ?? 3001;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Resend's free tier only delivers to the account owner's verified address
// (until a custom domain is verified), so every email is redirected there.
const DEMO_EMAIL_TO = process.env.DEMO_EMAIL_TO;
const FROM_ADDRESS = process.env.FROM_ADDRESS ?? 'Logix Dispatch <onboarding@resend.dev>';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, emailEnabled: Boolean(resend && DEMO_EMAIL_TO) });
});

app.post('/api/notifications/email', async (req, res) => {
  const { to, subject, html, text } = req.body ?? {};
  if (!to || !subject || !(html || text)) {
    return res.status(400).json({ status: 'failed', error: 'to, subject and html/text are required' });
  }

  if (!resend || !DEMO_EMAIL_TO) {
    console.log(`[simulated] "${subject}" -> ${to}`);
    return res.json({ status: 'simulated', deliveredTo: to });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: DEMO_EMAIL_TO,
      subject,
      html,
      text,
    });
    if (error) {
      console.error('[resend]', error);
      return res.status(502).json({ status: 'failed', error: error.message });
    }
    console.log(`[sent] "${subject}" -> ${DEMO_EMAIL_TO} (intended: ${to}) id=${data?.id}`);
    return res.json({ status: 'sent', id: data?.id, deliveredTo: DEMO_EMAIL_TO });
  } catch (err) {
    console.error('[resend]', err);
    return res.status(502).json({ status: 'failed', error: 'Email provider request failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Notification server on http://localhost:${PORT}`);
  if (!resend || !DEMO_EMAIL_TO) {
    console.log('RESEND_API_KEY or DEMO_EMAIL_TO missing: emails will be simulated.');
  }
});
