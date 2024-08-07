import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SK?.toString() ?? "", {
  apiVersion: "2022-08-01",
});

async function getStripeAccount(id: string) {
  return await stripe.accounts.retrieve(id);
}

async function createStripeAccount({ email, country, metadata }: { email: string; country: string; metadata?: { [key: string]: string | number } }) {
  return await stripe.accounts.create({
    type: "standard",
    email,
    country,
    // capabilities: {
    //   card_payments: {
    //     requested: true,
    //   },
    //   transfers: {
    //     requested: true,
    //   },
    // },
    metadata,
  });
}

async function createStripeAccountLink({ account, refresh_url, return_url }: { account: string; refresh_url: string; return_url: string }) {
  return await stripe.accountLinks.create({
    account,
    refresh_url,
    return_url,
    type: "account_onboarding",
  });
}

async function deleteStripeAccount(id: string) {
  return await stripe.accounts.del(id);
}

async function getStripeAccountProducts(id: string) {
  return (
    await stripe.products.list({
      stripeAccount: id,
    })
  ).data;
}

export default {
  getStripeAccount,
  createStripeAccount,
  createStripeAccountLink,
  deleteStripeAccount,
  getStripeAccountProducts,
};
