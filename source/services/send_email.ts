import configuration from "../configuration.js";

interface FailedResponse {
  message: string;
  name: string;
  statusCode: number;
  success: false;
}

interface SuccessfulResponse {
  id: string;
  success: true;
}

type Response = FailedResponse | SuccessfulResponse;

export async function sendEmail(keywordArguments: {
  to: string;
  subject: string;
  body: string;
}): Promise<Response> {
  if (configuration.apiEnvironment !== "production") {
    return {
      id: "placeholder",
      success: true,
    };
  }

  const options = {
    from: configuration.emailFrom,
    html: keywordArguments.body,
    subject: keywordArguments.subject,
    to: [keywordArguments.to],
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${configuration.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });
  const json = await response.json();

  if (!response.ok) {
    console.log(`Failed to send an email: \`${JSON.stringify(options)}\`.`);
    return {
      message: json.message,
      name: json.name,
      statusCode: response.status,
      success: false,
    };
  }

  console.log(`Sent an email: \`${JSON.stringify(options)}\`.`);
  return {
    id: json.id,
    success: true,
  };
}
