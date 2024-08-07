import { useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import ConfirmModal from "~/components/ui/modals/ConfirmModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import ErrorModal, { RefErrorModal } from "~/components/ui/modals/ErrorModal";
import DateUtils from "~/utils/shared/DateUtils";
import { Tenant, TenantUser } from "@prisma/client";

interface Props {
  tenant: Tenant & {
    users: TenantUser[];
  };
}

export default function TenantProfile({ tenant }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const successModalDeleted = useRef<RefSuccessModal>(null);
  const errorModal = useRef<RefErrorModal>(null);

  function confirmedDelete() {
    // TODO: CANCEL SUBSCRIPTION AND DELETE TENANT
    // setLoading(true);
    // services.tenants
    //   .adminDelete(id)
    //   .then(() => {
    //     successModalDeleted.current?.show(t("shared.deleted"), t("app.tenants.actions.deleted"));
    //   })
    //   .catch((error) => {
    //     errorModal.current?.show(t("shared.error"), t(error));
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
  }
  function successModalDeletedClosed() {
    navigate("/admin/accounts");
  }
  function dateMonthDayYear(value: Date | undefined) {
    return DateUtils.dateMonthDayYear(value);
  }

  return (
    <div>
      <div className="mx-auto space-y-2 px-4 pt-2 sm:px-6 lg:px-8">
        <div>
          <div className="relative min-h-screen">
            <main className="py-4">
              <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl">
                <div className="flex items-center space-x-5 truncate">
                  <div className="flex-shrink-0">
                    <div className="relative text-black">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        width="48"
                        height="48"
                        viewBox="0 0 172 172"
                        className="h-16 w-16"
                        fill="currentColor"
                      >
                        <g
                          fill="none"
                          fillRule="nonzero"
                          stroke="none"
                          strokeWidth="1"
                          strokeLinecap="butt"
                          strokeLinejoin="miter"
                          strokeMiterlimit="10"
                          strokeDashoffset="0"
                          fontFamily="none"
                          fontWeight="none"
                          fontSize="none"
                          textAnchor="none"
                        >
                          <path d="M0,172v-172h172v172z" fill="none" />
                          <g fill="currentColor">
                            <path
                              d="M150.5,150.5h-129v-114.66667c0,-7.88333 6.45,-14.33333 14.33333,-14.33333h100.33333c7.88333,0 14.33333,6.45 14.33333,14.33333z"
                              fill="#a3bffa"
                            />
                            <path d="M21.5,150.5h129v7.16667h-129z" fill="#667eea" />
                            <path
                              d="M111.08333,96.75h21.5v17.91667h-21.5zM75.25,96.75h21.5v17.91667h-21.5zM39.41667,96.75h21.5v17.91667h-21.5zM111.08333,125.41667h21.5v17.91667h-21.5zM39.41667,125.41667h21.5v17.91667h-21.5zM111.08333,68.08333h21.5v17.91667h-21.5zM75.25,68.08333h21.5v17.91667h-21.5zM39.41667,68.08333h21.5v17.91667h-21.5zM111.08333,39.41667h21.5v17.91667h-21.5zM75.25,39.41667h21.5v17.91667h-21.5zM39.41667,39.41667h21.5v17.91667h-21.5zM75.25,125.41667h21.5v32.25h-21.5z"
                              fill="#5a67d8"
                            />
                          </g>
                        </g>
                      </svg>
                    </div>
                  </div>
                  <div className="truncate">
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
                    </div>
                    <p className="truncate text-sm font-medium text-gray-500">
                      {t("shared.createdAt")} {tenant.createdAt && <time>{dateMonthDayYear(tenant.createdAt)}</time>}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3 xl:gap-6">
                <div className="space-y-6 lg:col-span-2 lg:col-start-1">
                  {/*Description list*/}
                  <section aria-labelledby="applicant-information-title">
                    <div className="bg-white shadow sm:rounded-lg">
                      <div className="px-4 py-5 sm:px-6">
                        <h2 id="applicant-information-title" className="text-foreground text-lg font-medium leading-6">
                          {t("app.linkedAccounts.profile.company")}
                        </h2>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">{t("app.linkedAccounts.profile.general")}</p>
                      </div>
                      <div className="border-border border-t px-4 py-5 sm:px-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3">
                          <div className="sm:col-span-3">
                            <dt className="text-sm font-medium text-gray-500">{t("models.tenant.object")}</dt>
                            <dd className="mt-1 text-sm text-gray-900">{tenant.name}</dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">{t("models.user.plural")}</dt>
                            <dd className="mt-1 text-sm text-gray-900">{tenant.users && <span>{tenant.users.length}</span>}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      <SuccessModal ref={successModalDeleted} onClosed={successModalDeletedClosed} />
      <ConfirmModal onYes={confirmedDelete} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}
