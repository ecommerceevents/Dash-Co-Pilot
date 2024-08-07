import { ReloadIcon } from "@radix-ui/react-icons";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTypedFetcher, useTypedLoaderData } from "remix-typedjson";
import { ContactStatus } from "~/application/dtos/crm/ContactStatus";
import { Colors } from "~/application/enums/shared/Colors";
import SimpleBadge from "~/components/ui/badges/SimpleBadge";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import LoadingButton from "~/components/ui/buttons/LoadingButton";
import DateCell from "~/components/ui/dates/DateCell";
import ServerError from "~/components/ui/errors/ServerError";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import XIcon from "~/components/ui/icons/XIcon";
import InputSearch from "~/components/ui/input/InputSearch";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import TableSimple from "~/components/ui/tables/TableSimple";
import CrmService, { UserInCrmDto } from "~/modules/crm/services/CrmService";

type LoaderData = {
  users: UserInCrmDto[];
};
export let loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;
  const usersInCrm = await CrmService.getUsersInCrm({
    invalidateCache: searchParams.get("cache") === "clear",
  });
  const data: LoaderData = {
    users: usersInCrm,
  };
  return data;
};
export let action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const action = form.get("action");
  if (action === "sync") {
    const emails = form.getAll("emails[]").map((x) => x.toString());
    const usersInCrm = await CrmService.getUsersInCrm({ invalidateCache: false });
    let progress: { updated: number; created: number } = { updated: 0, created: 0 };
    let filteredUsers = usersInCrm.filter((x) => emails.includes(x.email));
    for (const userInCrm of filteredUsers) {
      if (userInCrm.status === "to-update" && userInCrm.contact?.id) {
        const changes = await CrmService.updateContact(userInCrm.contact?.id, {
          firstName: userInCrm.firstName ?? "",
          lastName: userInCrm.lastName ?? "",
          marketingSubscriber: true,
        });
        if (changes && changes.length > 0) {
          progress.updated++;
        }
      } else if (userInCrm.status === "to-create") {
        const created = await CrmService.createContact({
          tenantId: null,
          firstName: userInCrm.firstName ?? "",
          lastName: userInCrm.lastName ?? "",
          email: userInCrm.email,
          jobTitle: "",
          status: ContactStatus.Customer,
          marketingSubscriber: true,
          options: {
            createEvent: false,
            checkUsage: false,
            createLog: false,
            storeMedia: false,
            reportUsage: false,
          },
          request: request,
        });
        if (created) {
          progress.created++;
        }
      }
    }
    if (progress.created === 0 && progress.updated === 0) {
      return json({ error: "No users to sync" }, { status: 400 });
    } else if (progress.created > 0 && progress.updated === 0) {
      return json({ success: `Created ${progress.created} contacts.` });
    } else if (progress.created === 0 && progress.updated > 0) {
      return json({ success: `Updated ${progress.updated} contacts.` });
    }
    return json({
      success: `Created ${progress.created} contacts, updated ${progress.updated}.`,
    });
  }
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const fetcher = useTypedFetcher<{ success?: string; error?: string }>();
  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success(fetcher.data.success);
    } else if (fetcher.data?.error) {
      toast.error(fetcher.data.error);
    }
  }, [fetcher.data]);

  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!data.users) {
      return [];
    }
    return data.users.filter(
      (f) =>
        f.email?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.firstName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.lastName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.source?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.status?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };

  function getSyncTitle() {
    const filtered = filteredItems();
    if (filtered.length === 0) {
      return "Sync";
    } else if (filtered.length === 1) {
      return "Sync 1 contact";
    } else if (filtered.length > 1) {
      return `Sync ${filtered.length} contacts`;
    }
  }
  return (
    <EditPageLayout
      title="Sync"
      withHome={false}
      buttons={
        <>
          <ButtonSecondary to="/admin/crm/sync?cache=clear">
            <ReloadIcon className="h-5 w-5" />
          </ButtonSecondary>
          <LoadingButton
            disabled={filteredItems().length === 0}
            isLoading={fetcher.state === "submitting"}
            onClick={() => {
              const form = new FormData();
              form.append("action", "sync");
              filteredItems().forEach((user) => {
                form.append("emails[]", user.email);
              });
              fetcher.submit(form, {
                method: "post",
              });
            }}
          >
            {getSyncTitle()}
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-2 pb-20">
        <InputSearch value={searchInput} setValue={setSearchInput} />
        <TableSimple
          items={filteredItems()}
          actions={[
            // {
            //   title: "User",
            //   onClickRoute: (_, item) => `/admin/accounts/${item.userId}`,
            // },
            {
              title: "View contact",
              onClickRoute: (_, item) => `/admin/crm/contacts/${item.contact?.id}`,
              disabled: (item) => !item.isContact,
            },
          ]}
          headers={[
            {
              name: "source",
              title: "Source",
              value: (item) => {
                if (item.source === "user") {
                  return <SimpleBadge title="User" color={Colors.BLUE} />;
                } else if (item.source === "convertkit") {
                  return <SimpleBadge title="ConvertKit" color={Colors.PINK} />;
                }
                return "?";
              },
            },
            {
              name: "status",
              title: "Status",
              value: (item) => {
                if (item.status === "synced") {
                  return <SimpleBadge title="Synced" color={Colors.GREEN} />;
                } else if (item.status === "to-create") {
                  return <SimpleBadge title="To create" color={Colors.RED} />;
                } else if (item.status === "to-update") {
                  return <SimpleBadge title="To update" color={Colors.YELLOW} />;
                }
                return <SimpleBadge title="Not synced" color={Colors.RED} />;
              },
            },
            {
              name: "user",
              title: "User",
              className: "w-full",
              value: (item) => (
                <div className="flex flex-col">
                  <div className="font-medium">{item.email}</div>
                  <div className="text-muted-foreground text-sm">
                    {item.firstName} {item.lastName}
                  </div>
                </div>
              ),
            },
            {
              name: "contact",
              title: "Contact",
              className: "w-full",
              value: (item) => {
                if (!item.contact) {
                  return null;
                }
                return (
                  <div className="flex flex-col">
                    <div className="font-medium">{item.contact.email}</div>
                    <div className="text-muted-foreground text-sm">
                      {item.contact.firstName} {item.contact.lastName}
                    </div>
                  </div>
                );
              },
            },
            {
              name: "isContact",
              title: "Is contact",
              value: (item) => (
                <div>{item.isContact ? <CheckIcon className="h-5 w-5 text-green-500" /> : <XIcon className="text-muted-foreground h-5 w-5" />}</div>
              ),
            },
            {
              name: "isMarketingSubscriber",
              title: "Marketing subscriber",
              value: (item) => (
                <div>
                  {item.contact?.marketingSubscriber ? <CheckIcon className="h-5 w-5 text-green-500" /> : <XIcon className="text-muted-foreground h-5 w-5" />}
                </div>
              ),
            },
            // {
            //   name: "createdAt",
            //   title: "Created at",
            //   value: (item) => <DateCell date={item.createdAt} />,
            // },
            {
              name: "updatedAt",
              title: "Updated at",
              value: (item) => <DateCell date={item.updatedAt} />,
            },
          ]}
        />
      </div>
    </EditPageLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
