import { Link } from "@remix-run/react";

export default function EnterpriseFeature() {
  return (
    <div className="border-border bg-background text-foreground rounded-md border-2 border-dashed py-6 text-center font-medium">
      <Link to="https://saasrock.com/pricing" target="_blank" className="underline">
        Enterprise 🚀 Feature
      </Link>
    </div>
  );
}
