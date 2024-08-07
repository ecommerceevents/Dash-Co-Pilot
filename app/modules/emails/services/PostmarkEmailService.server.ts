import postmark from "postmark";

async function send(
  data: { from: string; to: string; subject: string; body: string },
  config: {
    apiKey: string;
  }
) {
  const client = new postmark.ServerClient(config.apiKey);
  const sent = await client.sendEmail({
    From: data.from,
    To: data.to,
    Subject: data.subject,
    HtmlBody: data.body,
  });
  return sent;
}

export default {
  send,
};
