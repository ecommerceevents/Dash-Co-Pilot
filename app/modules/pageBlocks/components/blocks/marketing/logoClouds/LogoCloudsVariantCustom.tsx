import LogoReact from "~/assets/logos/colors/react.png";
import LogoTailwind from "~/assets/logos/colors/tailwindcss.png";
import LogoPrisma from "~/assets/logos/colors/prisma.png";
import LogoPrismaDark from "~/assets/logos/colors/prisma-dark.png";
import LogoStripe from "~/assets/logos/colors/stripe.png";
import LogoPostmark from "~/assets/logos/colors/postmark.png";
import LogoRemix from "~/assets/logos/colors/remix.png";
import LogoRemixDark from "~/assets/logos/colors/remix-dark.png";
import LogoTypescript from "~/assets/logos/colors/typescript.png";
import LogoVite from "~/assets/logos/colors/vite.png";
import ButtonEvent from "~/components/ui/buttons/ButtonEvent";

export default function LogoCloudsVariantCustom() {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-4 gap-8 md:grid-cols-4 lg:grid-cols-8">
          <div className="order-none col-span-1 flex justify-center">
            <ButtonEvent
              event={{
                action: "click",
                category: "logo-clouds",
                label: "react",
                value: "https://react.dev",
              }}
              to="https://react.dev"
              target="_blank"
              rel="noreferrer"
            >
              <img className="h-10 object-cover md:h-14" src={LogoReact} alt="React" />
            </ButtonEvent>
          </div>

          <div className="order-none col-span-1 flex justify-center">
            <ButtonEvent
              event={{
                action: "click",
                category: "logo-clouds",
                label: "typescript",
                value: "https://www.typescriptlang.org",
              }}
              to="https://www.typescriptlang.org"
              target="_blank"
              rel="noreferrer"
            >
              <img className="h-10 object-cover md:h-14" src={LogoTypescript} alt="TypeScript" />
            </ButtonEvent>
          </div>

          <div className="order-none col-span-1 flex justify-center">
            <ButtonEvent
              event={{
                action: "click",
                category: "logo-clouds",
                label: "prisma",
                value: "https://www.prisma.io/?via=alexandro",
              }}
              to="https://www.prisma.io/?via=alexandro"
              target="_blank"
              rel="noreferrer"
            >
              <img className="h-10 object-cover dark:hidden md:h-14" src={LogoPrisma} alt="Remix" />
              <img className="hidden h-10 object-cover dark:block md:h-14" src={LogoPrismaDark} alt="Remix" />
            </ButtonEvent>
          </div>
          <div className="order-first col-span-1 flex justify-center lg:order-none">
            <ButtonEvent
              event={{
                action: "click",
                category: "logo-clouds",
                label: "remix",
                value: "https://remix.run",
              }}
              to="https://remix.run"
              target="_blank"
              rel="noreferrer"
            >
              <img className="h-10 object-cover dark:hidden md:h-14" src={LogoRemix} alt="Remix" />
              <img className="hidden h-10 object-cover dark:block md:h-14" src={LogoRemixDark} alt="Remix" />
            </ButtonEvent>
          </div>
          <div className="order-none col-span-1 flex justify-center">
            <ButtonEvent
              event={{
                action: "click",
                category: "logo-clouds",
                label: "tailwindcss",
                value: "https://tailwindcss.com",
              }}
              to="https://tailwindcss.com"
              target="_blank"
              rel="noreferrer"
            >
              <img className="h-10 object-cover md:h-14" src={LogoTailwind} alt="Tailwind CSS" />
            </ButtonEvent>
          </div>

          <div className="order-none col-span-1 flex justify-center">
            <ButtonEvent
              event={{
                action: "click",
                category: "logo-clouds",
                label: "vite",
                value: "https://vitejs.dev",
              }}
              to="https://vitejs.dev"
              target="_blank"
              rel="noreferrer"
            >
              <img className="h-10 object-cover md:h-14" src={LogoVite} alt="Vite" />
            </ButtonEvent>
          </div>

          <div className="order-none col-span-1 flex justify-center">
            <ButtonEvent
              event={{
                action: "click",
                category: "logo-clouds",
                label: "stripe",
                value: "https://stripe.com",
              }}
              to="https://stripe.com"
              target="_blank"
              rel="noreferrer"
            >
              <img className="h-10 object-cover md:h-14" src={LogoStripe} alt="Stripe" />
            </ButtonEvent>
          </div>

          <div className="order-none col-span-1 flex justify-center">
            <ButtonEvent
              event={{
                action: "click",
                category: "logo-clouds",
                label: "postmark",
                value: "https://postmarkapp.com",
              }}
              to="https://postmarkapp.com/"
              target="_blank"
              rel="noreferrer"
            >
              <img className="h-10 object-cover md:h-14" src={LogoPostmark} alt="Postmark" />
            </ButtonEvent>
          </div>
        </div>
      </div>
    </div>
  );
}
