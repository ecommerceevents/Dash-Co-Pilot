import clsx from "clsx";

interface Props {
  avatar: string | undefined | null;
  className?: string;
}
export default function UserAvatarBadge({ avatar, className = "h-9 w-9" }: Props) {
  return (
    <div className="flex shrink-0">
      {avatar ? (
        <img className={clsx("flex items-center justify-center rounded-full bg-gray-400 ring-1 ring-gray-50", className)} src={avatar} alt="Avatar" />
      ) : (
        <span className={clsx("inline-block overflow-hidden rounded-full bg-gray-100", className)}>
          <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </span>
      )}
    </div>
  );
}
