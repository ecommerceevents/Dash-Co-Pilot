import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import InputGroup from "~/components/ui/forms/InputGroup";
import XIcon from "~/components/ui/icons/XIcon";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import InputRadioGroup from "~/components/ui/input/InputRadioGroup";
import InputSelector from "~/components/ui/input/InputSelector";
import InputText from "~/components/ui/input/InputText";
import PageBlockUtils from "~/modules/pageBlocks/components/blocks/PageBlockUtils";
import GridBlockForm from "../../shared/grid/GridBlockForm";
import { CommunityBlockDto, CommunityBlockStyle, CommunityBlockStyles } from "./CommunityBlockUtils";

export default function CommunityBlockForm({ item, onUpdate }: { item?: CommunityBlockDto; onUpdate: (item: CommunityBlockDto) => void }) {
  const { t } = useTranslation();
  const [state, setState] = useState<CommunityBlockDto>(item || PageBlockUtils.defaultBlocks.community!);
  useEffect(() => {
    onUpdate(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return (
    <div className="space-y-4">
      <InputGroup title="Design">
        <InputRadioGroup
          title="Style"
          value={state.style}
          setValue={(value) => setState({ ...state, style: value as CommunityBlockStyle })}
          options={CommunityBlockStyles.map((f) => f)}
        />
      </InputGroup>

      <InputGroup title="Video">
        <div className="space-y-2">
          <InputText title="Headline" type="text" value={state.headline} setValue={(e) => setState({ ...state, headline: e.toString() })} />
          <InputText title="Subheadline" type="text" value={state.subheadline} setValue={(e) => setState({ ...state, subheadline: e.toString() })} />
        </div>
      </InputGroup>

      <InputGroup title="Members">
        <div className="space-y-2">
          <InputSelector
            title="Members"
            value={state.type}
            setValue={(e) => setState({ ...state, type: e?.toString() === "github" ? "github" : "manual" })}
            options={[
              {
                name: "Manual",
                value: "manual",
              },
              {
                name: "GitHub",
                value: "github",
              },
            ]}
          />
          <GridBlockForm item={state.grid} onUpdate={(grid) => setState({ ...state, grid })} />
          <InputCheckboxWithDescription
            name="withName"
            title="Show names"
            description="Show the names of the members"
            value={state.withName}
            setValue={(e) => setState({ ...state, withName: Boolean(e) })}
          />
          {state.type === "manual" && (
            <div className="flex flex-col space-y-2">
              {state.data?.members?.map((member, index) => (
                <div key={index} className="group relative grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const members = state.data?.members ?? [];
                      members.splice(index, 1);
                      setState({ ...state, data: { members } });
                    }}
                    type="button"
                    className="absolute top-0 right-0 hidden origin-top-right justify-center rounded-full bg-white text-gray-600 hover:text-red-500 group-hover:flex"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                  <InputText
                    title="Avatar URL"
                    type="text"
                    value={member.avatar_url}
                    setValue={(e) =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          members: state.data?.members?.map((item, i) => (i === index ? { ...item, avatar_url: e.toString() } : item)) ?? [],
                        },
                      })
                    }
                  />
                  <InputText
                    title="Name"
                    type="text"
                    value={member.user}
                    setValue={(e) =>
                      setState({
                        ...state,
                        data: { ...state.data, members: state.data?.members?.map((item, i) => (i === index ? { ...item, user: e.toString() } : item)) ?? [] },
                      })
                    }
                  />
                </div>
              ))}
              <ButtonTertiary
                onClick={() =>
                  setState({
                    ...state,
                    data: {
                      ...state.data,
                      members: [
                        ...(state.data?.members ?? []),
                        { avatar_url: "https://via.placeholder.com/100x100?text=Avatar", user: "User " + (state.data?.members?.length ?? 0 + 1) },
                      ],
                    },
                  })
                }
              >
                {t("shared.add")}
              </ButtonTertiary>
            </div>
          )}
          {state.type === "github" && (
            <InfoBanner
              title="GitHub members"
              text={
                <div>
                  To list the repository collaborators, set the .env variable <i className="prose">`GITHUB_TOKEN`</i>.
                </div>
              }
            />
          )}
        </div>
      </InputGroup>

      <InputGroup title="CTA">
        <div className="flex flex-col space-y-2">
          {state.cta.map((cta, index) => (
            <div key={index} className="group relative grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const cta = state.cta;
                  cta.splice(index, 1);
                  setState({ ...state, cta });
                }}
                type="button"
                className="absolute top-0 right-0 -mt-3 hidden origin-top-right justify-center rounded-full bg-white text-gray-600 hover:text-red-500 group-hover:flex"
              >
                <XIcon className="h-6 w-6" />
              </button>
              <InputText
                title="CTA text"
                type="text"
                value={cta.text}
                setValue={(e) => setState({ ...state, cta: state.cta.map((cta, i) => (i === index ? { ...cta, text: e.toString() } : cta)) })}
              />
              <InputText
                title="CTA link"
                type="text"
                value={cta.href}
                setValue={(e) => setState({ ...state, cta: state.cta.map((cta, i) => (i === index ? { ...cta, href: e.toString() } : cta)) })}
              />
            </div>
          ))}
          <ButtonTertiary onClick={() => setState({ ...state, cta: [...state.cta, { text: "CTA", href: "#" }] })}>{t("shared.add")}</ButtonTertiary>
        </div>
      </InputGroup>
    </div>
  );
}
