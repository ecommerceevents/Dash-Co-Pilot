import clsx from "clsx";
import { Fragment, useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../carousel";
import { Card } from "../card";

interface Props {
  items: { type: string; title: string; src: string }[];
  size?: "sm" | "md" | "lg" | "full";
}
export default function CustomCarousel({ items, size = "full" }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState<{ type: string; title: string; src: string } | undefined>(undefined);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (items.length > currentIndex) {
      setCurrentItem(items[currentIndex]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, currentIndex]);

  useEffect(() => {
    setCurrentSrc(currentItem?.src);
  }, [currentItem]);

  function nextImage() {
    if (items.length > currentIndex + 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  }

  function previousImage() {
    if (currentIndex === 0) {
      setCurrentIndex(items.length - 1);
    } else {
      setCurrentIndex(currentIndex - 1);
    }
  }

  return (
    <Fragment>
      <div className="relative mx-auto w-full">
        <CarouselItems items={items} size={size} />
        {false && (
          <Fragment>
            <div className="mb-2 flex flex-col space-y-3 text-left">
              {/* <h3 className="text-lg font-bold">{currentItem?.group}</h3> */}
              <div className="flex space-x-1 text-sm font-medium italic dark:bg-gray-900">
                <span className={clsx(items.length === 1 && "hidden")}>
                  {currentIndex + 1}/{items.length}
                </span>
                <span className={clsx(items.length === 1 && "hidden")}>&rarr;</span>
                <span className="border-b border-transparent">{currentItem?.title}</span>
              </div>
            </div>
            <div className="relative block w-full overflow-hidden rounded-lg border-4 border-dotted border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-0 lg:h-[32rem]">
              <div className="absolute top-0 ml-2 mt-3">
                <button
                  onClick={previousImage}
                  type="button"
                  className={clsx(
                    "border-theme-500 bg-theme-900 text-theme-300 hover:bg-theme-800 focus:ring-theme-600 absolute rounded-full border p-2 opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-0",
                    items.length === 1 && "hidden"
                  )}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              <div className="absolute right-2 top-0 mr-10 mt-3 w-full text-right">
                <button
                  onClick={nextImage}
                  type="button"
                  className={clsx(
                    "border-theme-500 bg-theme-900 text-theme-300 hover:bg-theme-800 focus:ring-theme-600 absolute rounded-full border p-2 opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-0",
                    items.length === 1 && "hidden"
                  )}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {currentItem?.type === "image" && (
                <img
                  key={currentSrc}
                  loading="lazy"
                  className={clsx("min-h-full w-full object-cover md:h-auto", size === "sm" && "h-48", size === "md" && "h-64", size === "lg" && "h-96")}
                  src={currentSrc}
                  alt={currentItem?.title}
                />
              )}
              {currentItem?.type === "video" && (
                <iframe
                  key={currentSrc}
                  src={currentSrc}
                  title={currentItem?.title ?? ""}
                  frameBorder="0"
                  loading="lazy"
                  className="h-96 min-h-full w-full object-cover md:h-auto"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
              )}
            </div>
          </Fragment>
        )}
      </div>
    </Fragment>
  );
}

export function CarouselItems({ items, size }: Props) {
  return (
    <Carousel
      className={clsx("mx-auto w-full", size === "sm" && "max-w-xs", size === "md" && "max-w-md", size === "lg" && "max-w-lg", size === "full" && "max-w-full")}
    >
      <CarouselContent>
        {items.map((item, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className="overflow-hidden rounded-lg">
                {/* <span className="text-4xl font-semibold">{index + 1}</span> */}
                {item.type === "image" && (
                  <img
                    key={item.src}
                    loading="lazy"
                    className={clsx("min-h-full w-full object-cover md:h-auto", size === "sm" && "h-48", size === "md" && "h-64", size === "lg" && "h-96")}
                    src={item.src}
                    alt={item.title}
                  />
                )}
                {item?.type === "video" && (
                  <iframe
                    key={item.src}
                    src={item.src}
                    title={item?.title ?? ""}
                    loading="lazy"
                    className="h-96 min-h-full w-full object-cover md:h-auto"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  ></iframe>
                )}
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
