import { Fragment, useEffect, useState } from "react";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import DateCell from "~/components/ui/dates/DateCell";
import GitHubIcon from "~/components/ui/icons/GitHubIcon";
import ShowHtmlModalButton from "~/components/ui/json/ShowHtmlModalButton";
import IndexPageLayout from "~/components/ui/layouts/IndexPageLayout";
import TableSimple from "~/components/ui/tables/TableSimple";
import { useRootData } from "~/utils/data/useRootData";
import Confetti from "react-confetti";
import SuccessBanner from "~/components/ui/banners/SuccessBanner";

export default function Version() {
  const rootData = useRootData();
  const [size, setSize] = useState({ width: 0, height: 0 });

  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    setTimeout(() => {
      setIsComplete(true);
    }, 2000);
  }, []);

  return (
    <IndexPageLayout title="SaasRock Version">
      {rootData.version.hasUpdate ? (
        <InfoBanner title="How to upgrade?">
          <a href="https://saasrock.com/docs/articles/releases" target="_blank" rel="noreferrer" className="underline">
            Read this article
          </a>{" "}
          to upgrade to the latest version.
        </InfoBanner>
      ) : rootData.version.current === rootData.version.latest ? (
        <div>
          <SuccessBanner title="Up to date!">You are running the latest version of SaasRock!</SuccessBanner>
          <Confetti width={size.width} height={size.height} recycle={!isComplete} />
        </div>
      ) : null}
      <TableSimple
        items={rootData.version.versions}
        headers={[
          {
            name: "version",
            title: "Version",
            value: (i) => (
              <div className="flex flex-col">
                <div>
                  {/* <ShowModalButton title={<div className="underline">{i.version}</div>} className="sm:max-w-xl">
                    <div className="prose">
                      <div dangerouslySetInnerHTML={{ __html: marked(i.description) }} />
                    </div>
                  </ShowModalButton> */}
                  <ShowHtmlModalButton
                    className="sm:max-w-lg"
                    title={i.version}
                    html={i.description}
                    link={{
                      href: "https://github.com/AlexandroMtzG/saasrock/releases/tag/" + i.version,
                      text: <GitHubIcon className="h-5 w-5 text-gray-800 group-hover:text-gray-900" />,
                      target: "_blank",
                    }}
                  />
                </div>
              </div>
            ),
          },
          {
            name: "date",
            title: "Date",
            value: (i) => (
              <div className="flex space-x-1">
                <DateCell date={i.date} displays={["ymd"]} />
                <div>
                  {i.latest ? (
                    <Fragment>
                      {i.current ? (
                        <SimpleBadge color={Colors.GREEN}>Current</SimpleBadge>
                      ) : rootData.version.current < i.version ? (
                        <SimpleBadge color={Colors.BLUE}>Update available</SimpleBadge>
                      ) : null}
                    </Fragment>
                  ) : i.current ? (
                    <SimpleBadge color={Colors.GREEN}>Current</SimpleBadge>
                  ) : null}
                </div>
              </div>
            ),
          },
        ]}
      />
    </IndexPageLayout>
  );
}
