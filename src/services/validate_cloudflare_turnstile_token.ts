import configuration from "../configuration.js";

interface SuccessfulResponse {
  "error-codes": string[];
  action: string;
  cdata: string;
  challenge_ts: string;
  hostname: string;
  metadata: { ephemeral_id?: string };
  success: true;
}

interface FailedResponse {
  "error-codes": string[];
  success: false;
}

type Response = SuccessfulResponse | FailedResponse;

export async function validateCloudflareTurnstileToken(
  token: string,
  remoteIp: string,
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

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      remoteip: remoteIp,
      response: token,
      secret: configuration.cloudflareTurnstileSecret,
    }),
  });

  console.log(`Sent a Cloudflare Turnstile validation request: \`${JSON.stringify(response)}\`.`);

  if (!response.ok) {
    return { success: false, "error-codes": ["http-error"] };
  }

  const result = (await response.json()) as Response;

  return result;
}
