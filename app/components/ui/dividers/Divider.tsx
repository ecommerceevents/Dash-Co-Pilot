import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}
export default function Divider({ children }: Props) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="border-border w-full border-t" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-2 text-sm text-gray-400">{children}</span>
      </div>
    </div>
  );
}
