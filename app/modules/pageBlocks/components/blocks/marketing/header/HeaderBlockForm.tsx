import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HeaderBlockDto, HeaderBlockStyle, HeaderBlockStyles, NavbarItemDto } from "~/modules/pageBlocks/components/blocks/marketing/header/HeaderBlockUtils";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import InputGroup from "~/components/ui/forms/InputGroup";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
import InputRadioGroup from "~/components/ui/input/InputRadioGroup";
import InputText from "~/components/ui/input/InputText";
import CollapsibleRow from "~/components/ui/tables/CollapsibleRow";
import PageBlockUtils from "~/modules/pageBlocks/components/blocks/PageBlockUtils";

export default function HeaderBlockForm({ item, onUpdate }: { item?: HeaderBlockDto; onUpdate: (item: HeaderBlockDto) => void }) {
  const { t } = useTranslation();
  const [state, setState] = useState<HeaderBlockDto>(PageBlockUtils.defaultBlocks.header!);
  useEffect(() => {
    const header = item || PageBlockUtils.defaultBlocks.header!;
    header.links.forEach((link) => {
      if (!link.id) {
        link.id = Math.floor(Math.random() * 10000).toString();
      }
      link.items?.forEach((subLink) => {
        subLink.id = Math.floor(Math.random() * 10000).toString();
      });
    });
    setState(header);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
          setValue={(value) => setState({ ...state, style: value as HeaderBlockStyle })}
          options={HeaderBlockStyles.map((f) => f)}
        />
      </InputGroup>
      <InputGroup title="Links">
        <div className="flex flex-col space-y-2">
          {state.links.map((item) => (
            <LinkForm
              key={item.id}
              item={item}
              onUpdate={(item) => setState({ ...state, links: state.links?.map((x, i) => (x.id === item.id ? item : x)) })}
              onRemove={() => setState({ ...state, links: state.links?.filter((x, i) => x.id !== item.id) })}
            />
          ))}
          <ButtonTertiary
            onClick={() =>
              setState({
                ...state,
                links: [
                  ...state.links,
                  {
                    id: Math.floor(Math.random() * 10000).toString(),
                    title: "Link " + (state.links.length + 1),
                    path: "",
                  },
                ],
              })
            }
          >
            {t("shared.add")} link
          </ButtonTertiary>
        </div>
      </InputGroup>
      <InputGroup title="Options">
        <div className="space-y-2">
          <InputCheckboxWithDescription
            name="showLogo"
            title="Logo"
            description="Show the logo in the header."
            value={state.withLogo}
            setValue={(e) => setState({ ...state, withLogo: Boolean(e) })}
          />
          <InputCheckboxWithDescription
            name="showSignInUpButtons"
            title="Sign in/up buttons"
            description="Show the sign in and sign up buttons in the header."
            value={state.withSignInAndSignUp}
            setValue={(e) => setState({ ...state, withSignInAndSignUp: Boolean(e) })}
          />
          <InputCheckboxWithDescription
            name="showDarkModeToggle"
            title="Dark mode toggle"
            description="Show the dark mode toggle in the header."
            value={state.withDarkModeToggle}
            setValue={(e) => setState({ ...state, withDarkModeToggle: Boolean(e) })}
          />
          <InputCheckboxWithDescription
            name="showLanguageSelector"
            title="Language selector"
            description="Show the language selector in the header."
            value={state.withLanguageSelector}
            setValue={(e) => setState({ ...state, withLanguageSelector: Boolean(e) })}
          />
        </div>
      </InputGroup>
    </div>
  );
}

function LinkForm({
  item,
  onRemove,
  onUpdate,
  isSublink,
}: {
  item: NavbarItemDto;
  onRemove: () => void;
  onUpdate: (item: NavbarItemDto) => void;
  isSublink?: boolean;
}) {
  const { t } = useTranslation();
  const [state, setState] = useState<NavbarItemDto>(item);
  useEffect(() => {
    onUpdate(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  function getTitle() {
    if (state.items && state.items.length > 0) {
      return `${t(state.title)} - ${state.items.length} sublinks`;
    } else if (state.path) {
      return `${t(state.title)} - ${state.path}`;
    } else {
      return t(state.title);
    }
  }
  return (
    <CollapsibleRow title={getTitle()} value={getTitle()} initial={!item.path && (!item.items || item.items.length === 0)} onRemove={onRemove}>
      <div className={clsx("space-y-2")}>
        <div className="grid grid-cols-2 gap-3">
          <InputText name="title" title="Title" value={item.title} setValue={(e) => setState({ ...state, title: e.toString() })} placeholder="Link title" />
          <InputText name="path" title="Path" value={item.path} setValue={(e) => setState({ ...state, path: e.toString() })} placeholder="Link path" />
        </div>
        {!isSublink && (
          <div className="flex flex-col space-y-2">
            {item.items?.map((item) => (
              <LinkForm
                key={item.id}
                item={item}
                onUpdate={(item) => setState({ ...state, items: state.items?.map((x, i) => (x.id === item.id ? item : x)) })}
                onRemove={() => setState({ ...state, items: state.items?.filter((x, i) => x.id !== item.id) })}
                isSublink={true}
              />
            ))}
            <ButtonTertiary
              onClick={() =>
                setState({
                  ...state,
                  items: [
                    ...(state.items || []),
                    {
                      id: Math.floor(Math.random() * 10000).toString(),
                      title: "Sublink " + ((item.items?.length ?? 0) + 1),
                      path: "",
                    },
                  ],
                })
              }
            >
              {t("shared.add")} sublink
            </ButtonTertiary>
          </div>
        )}
      </div>
    </CollapsibleRow>
  );
}
