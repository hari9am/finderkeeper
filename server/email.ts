let transporterPromise: Promise<any | null> | null = null;

async function getTransporter(): Promise<any | null> {
  if (transporterPromise) return transporterPromise;
  transporterPromise = (async () => {
    try {
      const smtpUrl = process.env.SMTP_URL;
      if (!smtpUrl) return null;
      const { default: nodemailer } = await import("nodemailer");
      const transporter = nodemailer.createTransport(smtpUrl);
      await transporter.verify().catch(() => {});
      return transporter as any;
    } catch (e) {
      console.warn("Email disabled: nodemailer not installed or SMTP_URL invalid.");
      return null;
    }
  })();
  return transporterPromise;
}

export async function sendEmail(to: string, subject: string, text: string) {
  try {
    const transporter = await getTransporter();
    if (!transporter) {
      console.log(`[email disabled] To: ${to} :: ${subject} :: ${text.slice(0, 120)}`);
      return;
    }
    const from = process.env.MAIL_FROM || "no-reply@finderskeepers.local";
    await transporter.sendMail({ from, to, subject, text });
  } catch (err) {
    console.error("sendEmail error", err);
  }
}
