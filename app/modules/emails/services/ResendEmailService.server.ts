import { Resend } from "resend";

async function send(
  data: { from: string; to: string; subject: string; body: string },
  config: {
    apiKey: string;
  }
) {
  const resend = new Resend(config.apiKey);
  const sent = await resend.emails.send({
    from: data.from,
    to: [data.to],
    subject: data.subject,
    html: data.body,
  });

  return sent;
}

export default {
  send,
};
