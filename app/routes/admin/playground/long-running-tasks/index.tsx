import { ActionFunction, json } from "@remix-run/node";
import { useActionData, useSubmit, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import ErrorBanner from "~/components/ui/banners/ErrorBanner";
import InfoBanner from "~/components/ui/banners/InfoBanner";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import TableSimple from "~/components/ui/tables/TableSimple";

const TOTAL_ITEMS = 100;
const MILLISECONDS_PER_ITEM = 300;
const BLOCK_SIZE = 10;

type NextActionDto = {
  action: string;
  from?: number;
  to?: number;
  total?: number;
};
type ActionData = {
  next?: NextActionDto;
  success?: string;
  error?: string;
  items?: ItemToImportDto[];
};
export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const action = form.get("action");
  if (action === "import") {
    const from = Number(form.get("from"));
    const to = Number(form.get("to"));
    const total = Number(form.get("total"));

    // TODO - START: Simulate long-running task
    let items: ItemToImportDto[] = form.getAll("items[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });
    const itemsToImport = items.slice(from, to);
    await Promise.all(
      itemsToImport.map(async (item) => {
        item.id = Math.random().toString(36).substring(7);
        return await new Promise((resolve) => setTimeout(resolve, MILLISECONDS_PER_ITEM));
      })
    );
    items = items.slice(0, from).concat(itemsToImport).concat(items.slice(to));
    // TODO - END: Simulate long-running task

    const next: NextActionDto = {
      action: "import",
      from,
      to,
      total,
    };
    if (from + BLOCK_SIZE < total) {
      next.from = from + BLOCK_SIZE;
      next.to = to + BLOCK_SIZE;
      if (next.to > total) {
        next.to = total;
      }
      // optionally return all the items, including the "imported" ones
    } else {
      next.action = "process";
    }
    return json({ next, items });
  } else if (action === "process") {
    const items: ItemToImportDto[] = form.getAll("items[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });
    await Promise.all(
      items.map(async (item) => {
        item.processed = true;
        return await new Promise((resolve) => setTimeout(resolve, MILLISECONDS_PER_ITEM));
      })
    );
    return json({ success: "Imported and processed successfully", items });
  }
  return json({});
};

type ItemToImportDto = {
  id?: string;
  name: string;
  processed: boolean;
};
export default function () {
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();
  const navigation = useNavigation();

  const [status, setStatus] = useState<{ error?: string; loading?: string; success?: string }>();

  const [items, setItems] = useState<ItemToImportDto[]>([]);

  useEffect(() => {
    const items: ItemToImportDto[] = [];
    for (let idx = 0; idx < TOTAL_ITEMS; idx++) {
      items.push({ name: `Item ${idx + 1}`, processed: false });
    }
    setItems(items);
  }, []);

  useEffect(() => {
    if (actionData?.items && actionData?.items.length > 0) {
      setItems(actionData.items);
    }

    if (actionData?.success) {
      setStatus({ success: actionData.success });
    } else if (actionData?.error) {
      setStatus({ error: actionData.error });
    } else if (actionData?.next?.action === "import") {
      setStatus({ loading: `Importing ${actionData.next.from}-${actionData.next.to}/${actionData.next.total}...` });
      const form = new FormData();
      form.set("action", "import");
      form.set("from", actionData?.next.from?.toString() ?? "");
      form.set("to", actionData?.next.to?.toString() ?? "");
      form.set("total", actionData?.next.total?.toString() ?? "");
      (actionData.items ?? items).forEach((item) => {
        form.append("items[]", JSON.stringify(item));
      });
      submit(form, {
        method: "post",
      });
    } else if (actionData?.next?.action === "process") {
      setStatus({ loading: "Processing..." });
      const formData = new FormData();
      formData.set("action", "process");
      (actionData.items ?? items).forEach((item) => {
        formData.append("items[]", JSON.stringify(item));
      });
      submit(formData, {
        method: "post",
      });
    } else {
      setStatus(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  function onSubmit() {
    setStatus({ loading: `Importing 0-${BLOCK_SIZE}/${items.length}...` });

    const form = new FormData();
    form.append("action", "import");
    form.append("from", "0");
    form.append("to", BLOCK_SIZE.toString());
    form.append("total", items.length.toString());
    items.forEach((item) => {
      form.append("items[]", JSON.stringify(item));
    });
    submit(form, {
      method: "post",
    });
  }
  return (
    <div className="space-y-2 p-4">
      <div className="space-y-1">
        <h1 className="font-bold text-gray-800">Long Running Task</h1>
        <p className="text-gray-700">Simulate a long running task that is executed in the background.</p>
      </div>

      <div className="space-y-2">
        <WarningBanner
          title="Note"
          text={`This process simulates importing ${TOTAL_ITEMS} records (${MILLISECONDS_PER_ITEM} milliseconds each) in batches of ${BLOCK_SIZE}, and then processing them.`}
        />

        <div>
          <ButtonPrimary disabled={navigation.state !== "idle"} onClick={onSubmit}>
            {status?.loading ?? <span>Import {items.length} records</span>}
          </ButtonPrimary>
        </div>

        {actionData?.success ? (
          <InfoBanner title="Success" text={actionData.success} />
        ) : actionData?.error ? (
          <ErrorBanner title="Error" text={actionData.error} />
        ) : null}

        {/* {items.map((item, idx) => {
          return <input key={idx} type="hidden" readOnly hidden name="items[]" value={JSON.stringify(item)} />;
        })} */}

        <TableSimple
          items={items}
          headers={[
            {
              name: "name",
              title: "Name",
              className: "w-full",
              value: (item) => (
                <div className="flex flex-col">
                  <div>{item.name}</div>
                  {item.id ? <div className="text-xs text-gray-500">ID: {item.id}</div> : null}
                </div>
              ),
            },
            {
              name: "imported",
              title: "Imported",
              value: (item) => (item.id ? <SimpleBadge color={Colors.GREEN}>Imported</SimpleBadge> : <SimpleBadge color={Colors.YELLOW}>Pending</SimpleBadge>),
            },
            {
              name: "processed",
              title: "Processed",
              value: (item) =>
                item.processed ? <SimpleBadge color={Colors.GREEN}>Processed</SimpleBadge> : <SimpleBadge color={Colors.YELLOW}>Pending</SimpleBadge>,
            },
          ]}
        />
      </div>
    </div>
  );
}
