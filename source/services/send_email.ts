import configuration from "../configuration.js";

interface FailedResponse {
  message: string;
  name: string;
  statusCode: number;
  success: false;
}

interface SuccessfulResponse {
  id: string;
  success: boolean;
}

type Response = FailedResponse | SuccessfulResponse;

export async function sendEmail(keywordArguments: {
  to: string;
  subject: string;
  body: string;
}): Promise<Response> {
  const request = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${configuration.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: configuration.emailFrom,
      html: keywordArguments.body,
      subject: keywordArguments.subject,
      to: [keywordArguments.to],
    }),
  };

  let response: Response;

  if (configuration.apiEnvironment !== "production") {
    response = {
      id: "placeholder",
      success: true,
    };
  } else {
    const fetchResponse = await fetch("https://api.resend.com/emails", request);
    const json = await fetchResponse.json();

    if (!fetchResponse.ok) {
      response = {
        message: json.message,
        name: json.name,
        statusCode: fetchResponse.status,
        success: false,
      };
    } else {
      response = {
        id: json.id,
        success: true,
      };
    }
  }

  console.log(
    `Sent an email, request: \`${JSON.stringify(request)}\`, response: \`${JSON.stringify(response)}\`.`,
  );

  return response;
}
