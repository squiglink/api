import { Resend } from "resend";
import configuration from "../configuration.js";

export async function sendEmail(keywordArguments: {
  to: string;
  subject: string;
  body: string;
}): Promise<boolean> {
  if (configuration.applicationEnvironment === "production") {
    const resend = new Resend(configuration.apiKeyResend);
    const { error } = await resend.emails.send({
      from: configuration.emailFrom,
      to: keywordArguments.to,
      subject: keywordArguments.subject,
      html: keywordArguments.body,
    });
    if (error) {
      throw new Error(`Could not send an email: ${error.message}.`);
    }
  }

  const options = {
    from: configuration.emailFrom,
    to: keywordArguments.to,
    subject: keywordArguments.subject,
    body: keywordArguments.body,
  };
  console.log(`Sent an email: \`${options}\`.`);

  return true;
}
