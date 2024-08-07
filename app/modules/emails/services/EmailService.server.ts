import PostmarkEmailService from "./PostmarkEmailService.server";
import ResendEmailService from "./ResendEmailService.server";

async function send({
  provider,
  data,
  config,
}: {
  provider: "postmark" | "resend";
  data: { from: string; to: string; subject: string; body: string };
  config: { apiKey: string };
}) {
  switch (provider) {
    case "postmark":
      return await PostmarkEmailService.send(data, config);
    case "resend":
      return await ResendEmailService.send(data, config);
    default:
      throw new Error("Invalid provider: " + provider);
  }
}

export default {
  send,
};
