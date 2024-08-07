import { SetupItem } from "~/application/dtos/setup/SetupItem";
import { getAllSubscriptionProducts } from "../db/subscriptionProducts.db.server";
// import { getPostmarkTemplates } from "../email.server";

export async function getSetupSteps(): Promise<SetupItem[]> {
  return [await getPricingStep()];
}

async function getPricingStep(): Promise<SetupItem> {
  const items = await getAllSubscriptionProducts();
  return Promise.resolve({
    title: "Pricing",
    description: "Create a good pricing strategy and generate the plans and prices on Stripe.",
    completed: items.length > 0,
    path: "/admin/settings/pricing",
  });
}

// async function getEmailStep(): Promise<SetupItem> {
//   return new Promise((resolve) => {
//     getPostmarkTemplates()
//       .then((items) => {
//         resolve({
//           title: "Emails",
//           description: "Add your email templates at /public/emails and generate them on your Email provider.",
//           completed: items.length > 0,
//           path: "/admin/settings/transactional-emails",
//         });
//       })
//       .catch(() => {
//         resolve({
//           title: "Emails",
//           description: "Add your email templates at /public/emails and generate them on your Email provider.",
//           completed: false,
//           path: "/admin/settings/transactional-emails",
//         });
//       });
//   });
// }
