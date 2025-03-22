import { Resend } from "resend";
import configuration from "../configuration.js";

export async function sendMail(options: {
  to: string;
  subject: string;
  body: string;
}): Promise<boolean> {
  const resend = new Resend(configuration.apiKeyResend);

  const { error } = await resend.emails.send({
    from: configuration.emailFrom,
    to: options.to,
    subject: options.subject,
    html: options.body,
  });

  if (error) {
    throw new Error(`Could not send email: ${error.message}`);
  }

  return true;
}
