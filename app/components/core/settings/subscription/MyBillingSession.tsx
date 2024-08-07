import { ExternalLinkIcon } from "lucide-react";

interface Props {
  onClick: () => void;
}

export default function MyBillingSession({ onClick }: Props) {
  return (
    <div className="space-y-2">
      <div className="mt-3">
        <button
          type="button"
          onClick={onClick}
          className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <ExternalLinkIcon className="mx-auto h-4 text-gray-600" />
          <span className="mt-2 block text-sm font-medium text-gray-900">Open Billing Portal</span>
        </button>
      </div>
    </div>
  );
}
