import clsx from "clsx";
import Logo from "~/assets/logos/colors/gumroad.png";
export default function GumroadIcon({ className }: { className?: string }) {
  return <img className={clsx("object-cover", className)} src={Logo} alt="Gumroad" />;
}
