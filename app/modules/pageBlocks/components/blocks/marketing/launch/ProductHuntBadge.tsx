import { Fragment } from "react";
import ButtonEvent from "~/components/ui/buttons/ButtonEvent";
import { useRootData } from "~/utils/data/useRootData";

interface Props {
  theme?: "light" | "neutral" | "dark";
}
export default function ProductHuntBadge({ theme }: Props) {
  const rootData = useRootData();
  const producthunt = rootData?.appConfiguration.launches?.producthunt;
  if (!producthunt) {
    return null;
  }
  return (
    <Fragment>
      {producthunt ? (
        <div className="mx-auto mb-6 flex justify-center text-center">
          <ButtonEvent
            event={{ action: "click", category: "hero", label: "producthunt", value: producthunt.title }}
            to={producthunt.url}
            target="_blank"
            rel="noreferrer"
          >
            {theme === "light" ? (
              <img
                src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=${producthunt.postId}&theme=light`}
                alt={producthunt.title}
                style={{
                  width: "220px",
                }}
                width="250"
                height="54"
              />
            ) : theme === "neutral" ? (
              <img
                src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=${producthunt.postId}&theme=neutral`}
                alt={producthunt.title}
                style={{
                  width: "220px",
                }}
                width="250"
                height="54"
              />
            ) : theme === "dark" ? (
              <img
                src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=${producthunt.postId}&theme=dark`}
                alt={producthunt.title}
                style={{
                  width: "220px",
                }}
                width="250"
                height="54"
              />
            ) : null}
          </ButtonEvent>
        </div>
      ) : null}
    </Fragment>
  );
}
