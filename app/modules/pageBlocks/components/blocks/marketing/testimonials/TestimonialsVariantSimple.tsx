import clsx from "clsx";
import { useTranslation } from "react-i18next";
import ButtonEvent from "~/components/ui/buttons/ButtonEvent";
import { TestimonialsBlockDto } from "~/modules/pageBlocks/components/blocks/marketing/testimonials/TestimonialsBlockUtils";
import TrustpilotBox from "./TrustpilotBox";
import DateUtils from "~/utils/shared/DateUtils";
import LinkOrAhref from "~/components/ui/buttons/LinkOrAhref";

export default function TestimonialsVariantSimple({ item }: { item: TestimonialsBlockDto }) {
  const { t } = useTranslation();
  return (
    <section className="">
      <div className="container mx-auto space-y-12 px-5 py-24">
        {(item.headline || item.subheadline) && (
          <div className="space-y-5 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl">
            <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">{t(item.headline)}</h2>
            <p className="text-center text-xl">{t(item.subheadline)}</p>
            {item.reviews?.trustpilot && <TrustpilotBox trustpilot={item.reviews?.trustpilot} />}
          </div>
        )}
        <div className="m-4 flex flex-wrap">
          {item.items.map((testimonial, idx) => {
            return (
              <div
                key={idx}
                className={clsx(
                  "w-full p-4",
                  item.items.length === 1 && "mx-auto max-w-xl md:w-full",
                  item.items.length === 2 && "md:w-1/2",
                  item.items.length === 3 && "md:w-1/3",
                  item.items.length > 3 && "md:w-1/2"
                )}
              >
                <div className="group: bg-secondary h-full rounded-lg p-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="text-muted-foreground mb-4 block h-5 w-5"
                    viewBox="0 0 975.036 975.036"
                  >
                    <path d="M925.036 57.197h-304c-27.6 0-50 22.4-50 50v304c0 27.601 22.4 50 50 50h145.5c-1.9 79.601-20.4 143.3-55.4 191.2-27.6 37.8-69.399 69.1-125.3 93.8-25.7 11.3-36.8 41.7-24.8 67.101l36 76c11.6 24.399 40.3 35.1 65.1 24.399 66.2-28.6 122.101-64.8 167.7-108.8 55.601-53.7 93.7-114.3 114.3-181.9 20.601-67.6 30.9-159.8 30.9-276.8v-239c0-27.599-22.401-50-50-50zM106.036 913.497c65.4-28.5 121-64.699 166.9-108.6 56.1-53.7 94.4-114.1 115-181.2 20.6-67.1 30.899-159.6 30.899-277.5v-239c0-27.6-22.399-50-50-50h-304c-27.6 0-50 22.4-50 50v304c0 27.601 22.4 50 50 50h145.5c-1.9 79.601-20.4 143.3-55.4 191.2-27.6 37.8-69.4 69.1-125.3 93.8-25.7 11.3-36.8 41.7-24.8 67.101l35.9 75.8c11.601 24.399 40.501 35.2 65.301 24.399z"></path>
                  </svg>
                  {testimonial.title && (
                    <div className="mb-2 flex justify-between space-x-2 text-lg font-medium">
                      <div>{testimonial.title}</div>

                      <div className="flex items-center">
                        <svg
                          className="ms-1 h-4 w-4 text-yellow-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 22 20"
                        >
                          <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                        </svg>
                        <svg
                          className="ms-1 h-4 w-4 text-yellow-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 22 20"
                        >
                          <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                        </svg>
                        <svg
                          className="ms-1 h-4 w-4 text-yellow-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 22 20"
                        >
                          <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                        </svg>
                        <svg
                          className="ms-1 h-4 w-4 text-yellow-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 22 20"
                        >
                          <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                        </svg>
                        <svg
                          className="ms-1 h-4 w-4 text-yellow-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 22 20"
                        >
                          <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <p className="mb-6 leading-relaxed">
                    {testimonial.quoteUrl ? (
                      <ButtonEvent
                        to={testimonial.quoteUrl}
                        target="_blank"
                        className="hover:underline"
                        event={{
                          action: "click",
                          category: "testimonials",
                          label: "quote",
                          value: testimonial.name,
                        }}
                      >
                        {testimonial.quote}
                      </ButtonEvent>
                    ) : (
                      testimonial.quote
                    )}
                  </p>
                  <div className="inline-flex items-center">
                    <img alt="testimonial" src={testimonial.avatar} className="h-12 w-12 flex-shrink-0 rounded-full object-cover object-center" />
                    <span className="flex flex-grow flex-col pl-4">
                      <LinkOrAhref
                        to={testimonial.personalWebsite}
                        target="_blank"
                        rel="noreferrer"
                        className={clsx("title-font text-left font-medium", testimonial.personalWebsite && "hover:underline")}
                        // event={{ action: "click", category: "testimonial-user", label: testimonial.name, value: testimonial.personalWebsite ?? "" }}
                      >
                        {testimonial.name}
                      </LinkOrAhref>
                      <span className="text-muted-foreground flex items-center space-x-1 text-sm">
                        {testimonial.role && <div>{t(testimonial.role)}</div>}
                        {testimonial.company && (
                          <>
                            <div>@</div>
                            <div className="text-muted-foreground text-sm">
                              {testimonial.companyUrl ? (
                                <ButtonEvent
                                  to={testimonial.companyUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:underline"
                                  event={{ action: "click", category: "testimonial-company", label: testimonial.company, value: testimonial.companyUrl ?? "" }}
                                >
                                  {testimonial.company}
                                </ButtonEvent>
                              ) : (
                                testimonial.company
                              )}
                            </div>
                          </>
                        )}
                        {testimonial.createdAt && (
                          <time dateTime={DateUtils.dateYMDHMSMS(testimonial.createdAt)} title={DateUtils.dateYMDHMSMS(testimonial.createdAt)}>
                            {DateUtils.dateAgo(testimonial.createdAt)}
                          </time>
                        )}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
