import configuration from "../configuration.js";

interface FailedResponse {
  "error-codes": string[];
  success: false;
}

interface SuccessfulResponse {
  "error-codes": string[];
  action: string;
  cdata: string;
  challenge_ts: string;
  hostname: string;
  metadata: { ephemeral_id?: string };
  success: true;
}

type Response = FailedResponse | SuccessfulResponse;

export async function validateCloudflareTurnstileToken(
  remoteIp: string,
  token: string,
): Promise<Response> {
  if (!configuration.cloudflareTurnstileEnabled) {
    return {
      "error-codes": [],
      action: "",
      cdata: "",
      challenge_ts: "",
      hostname: "",
      metadata: {},
      success: true,
    };
  }

  const request = {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      remoteip: remoteIp,
      response: token,
      secret: configuration.cloudflareTurnstileSecret,
    }),
  };

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    request,
  );

  console.log(
    `Validated Cloudflare Turnstile, request: \`${JSON.stringify(request)}\`, response: \`${JSON.stringify(response)}\`.`,
  );

  return (await response.json()) as Response;
}
