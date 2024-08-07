import { Form, useNavigation, useSubmit } from "@remix-run/react";
import clsx from "clsx";
import { useState, useEffect, Fragment, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ExclamationTriangleIcon from "~/components/ui/icons/ExclamationTriangleIcon";
import InputCheckboxInline from "~/components/ui/input/InputCheckboxInline";
import InputSelect from "~/components/ui/input/InputSelect";
import InputSelector from "~/components/ui/input/InputSelector";
import Loading from "~/components/ui/loaders/Loading";
import Modal from "~/components/ui/modals/Modal";
import ProgressBar from "~/components/ui/steps/ProgressBar";
import { StepDto } from "~/components/ui/steps/StepDto";
import TableSimple from "~/components/ui/tables/TableSimple";
import UploadDocuments from "~/components/ui/uploaders/UploadDocument";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { Rows_Import } from "../routes/Rows_Import.server";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";

type RawDataDto = {
  rows: RawRow[];
  columns: RawColumn[];
};
type RawRow = { column: string; value: string }[];
type RawColumn = { column: string; name?: string };

const initialSteps: StepDto[] = [
  {
    name: "upload",
    title: "Upload a .csv file",
    status: "current",
  },
  {
    name: "map",
    title: "Map columns",
    status: "pending",
  },
  {
    name: "confirm",
    title: "Confirm",
    status: "pending",
  },
];

export default function RowsImportRoute() {
  const data = useTypedLoaderData<Rows_Import.LoaderData>();
  const [entity] = useState(data.entity);
  const [steps, setSteps] = useState<StepDto[]>(initialSteps);
  const [currentStep, setCurrentStep] = useState<string>();
  const [rawData, setRawData] = useState<RawDataDto>();
  const [selectedTenant, setSelectedTenant] = useState<{ id: string; name: string; slug: string } | null>(null);

  useEffect(() => {
    setCurrentStep(steps.find((s) => s.status === "current")?.name);
  }, [steps]);

  function onImport(data: RawDataDto) {
    const updatedSteps = steps.map((step) => {
      switch (step.name) {
        case "upload":
          return { ...step, status: "completed" };
        case "map":
          return { ...step, status: "current" };
        default:
          return { ...step, status: "pending" };
      }
    });
    setRawData(data);
    setSteps(updatedSteps as StepDto[]);
  }

  function onMapped(data: RawDataDto) {
    const updatedSteps = steps.map((step) => ({
      ...step,
      status: step.name === "confirm" ? "current" : "completed",
    }));
    setRawData(data);
    setSteps(updatedSteps as StepDto[]);
  }

  return (
    <div className="p-4">
      <ProgressBar steps={steps} />
      <div className="overflow-x-auto rounded-b-md border border-t-0 border-gray-300 bg-gray-50 p-4">
        {currentStep === "upload" && (
          <ImportCsv
            entity={entity}
            onImport={onImport}
            allTenants={data.allTenants}
            selectedTenant={selectedTenant}
            onChangeSelectedTenant={setSelectedTenant}
          />
        )}
        {currentStep === "map" && rawData && <MapFields entity={entity} data={rawData} onConfirm={onMapped} />}
        {currentStep === "confirm" && rawData && <Confirm entity={entity} data={rawData} onBack={() => onImport(rawData)} selectedTenant={selectedTenant} />}
      </div>
    </div>
  );
}

function ImportCsv({
  entity,
  onImport,
  allTenants,
  selectedTenant,
  onChangeSelectedTenant,
}: {
  entity: EntityWithDetails;
  onImport: (rawData: RawDataDto) => void;
  allTenants: { id: string; name: string; slug: string }[];
  selectedTenant: { id: string; name: string; slug: string } | null;
  onChangeSelectedTenant: (e: { id: string; name: string; slug: string } | null) => void;
}) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const [delimiter, setDelimiter] = useState("|");
  const [firstRowHasHeaders, setFirstRowHasHeaders] = useState("firstRowHasHeaders");

  function onDropped(base64: string, file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const rawData: RawDataDto = {
        columns: [],
        rows: [],
      };
      const results = csvToArray(e.target.result);
      for (let idx = 0; idx < results.length; idx++) {
        const result = results[idx];
        // if (idx === 0 && firstRowHasHeaders === "firstRowHasHeaders") {
        //   continue;
        // }
        const rowToImport: RawRow = [];
        const item: string[] = Object.values(result);
        item.forEach((value, index) => {
          let column = `Column ${index + 1}`;
          if (!rawData.columns.find((c) => c.column === column)) {
            rawData.columns.push({ column });
          }
          if (true) {
            // replace all double quotes with single quotes
            value = value.replace(/"/g, "");
          }
          rowToImport.push({ column, value });
        });
        rawData.rows.push(rowToImport);
      }
      onImport(rawData);
    };
    reader.readAsText(file);
  }

  function csvToArray(str: string) {
    let headers: string[] = str.slice(0, str.indexOf("\n")).split(delimiter);
    let rows = str.slice(str.indexOf("\n") + 1).split("\n");
    if (firstRowHasHeaders === "noHeaders") {
      rows = str.split("\n");
      headers = headers.map((h, index) => `Column ${index + 1}`);
    }
    const arr = rows.map((row) => {
      const values = row.split(delimiter);
      const el = headers.reduce((object: any, header, index) => {
        object[index] = values[index];
        return object;
      }, {});
      return el;
    });
    // console.log({ headers, arr });
    return arr;
  }

  function downloadSample() {
    const rows = [];

    // Add header row if first row has headers
    if (firstRowHasHeaders === "firstRowHasHeaders") {
      const headerRow = entity.properties.filter((property) => !property.isDefault).map((property) => `"${property.name}"`);
      rows.push(headerRow);
    }

    // Add sample data rows
    for (let i = 1; i <= 5; i++) {
      const dataRow = entity.properties
        .filter((property) => !property.isDefault)
        .map((property) => {
          switch (property.type) {
            case PropertyType.TEXT:
              return `"Abc, efg ${i}"`;
            case PropertyType.NUMBER:
              return `"123"`;
            case PropertyType.DATE:
              return `"2022-12-31"`;
            case PropertyType.BOOLEAN:
              return "true";
            case PropertyType.SELECT:
              return `"Option 1"`;
            case PropertyType.MEDIA:
              return `"https://via.placeholder.com/600x400"`;
            default:
              return "";
          }
        });
      rows.push(dataRow);
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((row) => row.join(delimiter?.toString())).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${entity.name}-import-sample.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-2">
      <div className="space-y-2 md:flex md:space-x-2 md:space-y-0">
        <div className="md:w-64">
          <InputSelect
            name="delimiter"
            title="Delimiter"
            value={delimiter}
            setValue={(i) => setDelimiter(i?.toString() ?? "|")}
            options={[
              { name: "Comma ,", value: "," },
              { name: "Pipe |", value: "|" },
              { name: "Semicolon ;", value: ";" },
              { name: "Tab", value: "\t" },
            ]}
          />
        </div>
        <div className="md:w-64">
          <InputSelect
            name="headers"
            title="Headers"
            value={firstRowHasHeaders}
            setValue={(i) => setFirstRowHasHeaders(i?.toString() ?? "|")}
            options={[
              { name: "First row has headers", value: "firstRowHasHeaders" },
              { name: "No headers", value: "noHeaders" },
            ]}
          />
        </div>
        <div className="md:w-64">
          {!appOrAdminData.currentTenant && (
            <InputSelect
              name="tenantId"
              title={t("models.tenant.object")}
              value={selectedTenant?.id ?? "{null}"}
              setValue={(i) => {
                const tenant = allTenants.find((f) => f.id === i?.toString()) ?? null;
                onChangeSelectedTenant(tenant);
              }}
              options={[
                {
                  name: "- Admin -",
                  value: "{null}",
                },
                ...allTenants.map((tenant) => {
                  return {
                    name: tenant.name,
                    value: tenant.id,
                  };
                }),
              ]}
            />
          )}
        </div>
      </div>
      <Form method="post">
        <input type="hidden" name="action" value="upload" hidden readOnly />
        <div className="space-y-2">
          <div className="flex items-center justify-between space-x-2">
            <h4 className="text-sm font-medium text-gray-800">Importing {t(entity.titlePlural)}</h4>
            <button
              type="button"
              onClick={downloadSample}
              className="bg-theme-100 text-theme-700 hover:bg-theme-200 focus:ring-theme-500 inline-flex items-center rounded border border-transparent px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              Download sample
            </button>
          </div>
          <UploadDocuments className="bg-white" name="file" accept=".csv" multiple={false} onDropped={onDropped} />
          {/* <div className="flex justify-end">
          <ButtonPrimary disabled={disabled} type="submit">
            Submit
          </ButtonPrimary>
        </div> */}
        </div>
      </Form>
    </div>
  );
}

function MapFields({ entity, data, onConfirm }: { entity: EntityWithDetails; data: RawDataDto; onConfirm: (data: RawDataDto) => void }) {
  const { t } = useTranslation();
  const [rawData, setRawData] = useState<RawDataDto>(data);
  const [uniqueRows, setUniqueRows] = useState<RawRow[]>([]);
  const [primaryProperty, setPrimaryProperty] = useState<string>();
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    const uniqueRows: RawRow[] = [];
    for (const row of rawData.rows) {
      let mapRow = true;
      for (const column of rawData.columns) {
        if (!column.name) {
          continue;
        }
        if (column.column === primaryProperty) {
          const existingRow = uniqueRows.find((r) => r.find((f) => f.column === column.column)?.value === row.find((f) => f.column === column.column)?.value);
          if (existingRow) {
            mapRow = false;
            continue;
          }
        }
      }
      if (mapRow) {
        uniqueRows.push(row);
      }
    }
    setUniqueRows(uniqueRows);
  }, [rawData.columns, primaryProperty, rawData.rows]);

  function removeDuplicatesAndConfirm() {
    onConfirm({ ...rawData, rows: uniqueRows });
  }
  function hasBeenMapped(name: string) {
    return rawData.columns.filter((f) => f.name === name).length > 0;
  }
  return (
    <div className="space-y-2">
      <div className="flex justify-between space-x-2 pb-2">
        <div className="flex items-baseline space-x-1 text-lg font-bold text-gray-800">
          <div>Map fields for </div>
          {uniqueRows.length === 1 ? <div>1 row</div> : <div>{uniqueRows.length} rows</div>}
          <button type="button" onClick={() => setPreview(true)} className="text-sm text-gray-600 underline">
            (click here to preview)
          </button>
        </div>
      </div>
      <div className="grid gap-3 xl:grid-cols-3">
        {rawData.columns.map((column, idx) => {
          return (
            <div
              key={idx}
              className={clsx(
                "group relative space-y-2 rounded-md border-2 border-dashed border-gray-200 bg-white p-2",
                column.name && "border-emerald-500 bg-emerald-50"
              )}
            >
              <button
                onClick={() => {
                  // remove column
                  const newRawData = { ...rawData };
                  newRawData.columns.splice(idx, 1);
                  setRawData(newRawData);
                }}
                type="button"
                className={clsx("absolute right-0 top-0 -mt-3 hidden origin-top-right justify-center rounded-full bg-white text-gray-600 group-hover:flex")}
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {/* <div className="flex items-center justify-between space-x-2 pr-2">
                <div className="text-sm font-bold">{column.column}</div>
                <InputCheckboxInline
                  name={"primary-" + idx}
                  title="Primary"
                  // description="To identify existing records"
                  value={primaryProperties.filter((f) => f === column.column).length > 0}
                  setValue={(i) => {
                    if (i) {
                      setPrimaryProperties([...primaryProperties, column.column]);
                    } else {
                      setPrimaryProperties(primaryProperties.filter((f) => f !== column.column));
                    }
                  }}
                />
              </div> */}

              <div className="">
                <div className="flex justify-between space-x-1 pb-1.5">
                  <div className="flex-grow text-sm font-medium">{column.column}</div>
                  <InputCheckboxInline
                    className=""
                    name={"primary-" + idx}
                    title="Primary"
                    value={column.column === primaryProperty}
                    disabled={!!primaryProperty && column.column !== primaryProperty}
                    setValue={(i) => {
                      if (i) {
                        setPrimaryProperty(column.column);
                      } else {
                        setPrimaryProperty(undefined);
                      }
                    }}
                  />
                </div>
                <InputSelector
                  className="flex-grow"
                  name={"map-to-" + idx}
                  value={column.name}
                  withSearch={false}
                  setValue={(i) => {
                    setRawData({
                      ...rawData,
                      columns: rawData.columns.map((c, cIdx) => {
                        if (cIdx === idx) {
                          return { ...c, name: i?.toString() };
                        }
                        return c;
                      }),
                    });
                  }}
                  options={[
                    {
                      name: "-- Not mapped --",
                      value: undefined,
                    },
                    ...entity.properties
                      .filter((f) => !f.isDefault)
                      .map((prop) => {
                        return {
                          name: `${t(prop.title)} (${prop.name})`,
                          value: prop.type === PropertyType.MEDIA ? prop.name + "[]" : prop.name,
                          disabled: hasBeenMapped(prop.name),
                        };
                      }),
                  ]}
                />
              </div>
              <div className="space-y-1">
                <label className="cursor-pointer select-none">
                  <div className="text-sm font-medium text-gray-700">Values</div>
                </label>
                <div className="truncate bg-gray-50">
                  {rawData.rows.map((row, idxRow) => {
                    return (
                      <Fragment key={idxRow}>
                        {idxRow < 5 && (
                          <div className="truncate border border-gray-200" key={idxRow}>
                            <span className="truncate px-1 text-sm text-gray-600">{row.find((r) => r.column === column.column)?.value ?? "?"}</span>
                          </div>
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end">
        <ButtonPrimary
          className="flex space-x-1"
          disabled={rawData.columns.filter((f) => f.name).length === 0 || uniqueRows.length === 0}
          onClick={removeDuplicatesAndConfirm}
        >
          {uniqueRows.length === 0 ? (
            <div>
              <div className="">No rows</div>
            </div>
          ) : (
            <>{t("shared.continue")}</>
          )}
        </ButtonPrimary>
      </div>

      <Modal open={preview} setOpen={setPreview}>
        <div className="flex justify-between space-x-2 pb-2">
          <div className="text-xl font-bold text-gray-800">{uniqueRows.length} rows</div>
          <div className="flex space-x-2">
            <ButtonSecondary onClick={() => setPreview(false)}>{t("shared.back")}</ButtonSecondary>
            <ButtonPrimary
              className="flex space-x-1"
              disabled={rawData.columns.filter((f) => f.name).length === 0 || uniqueRows.length === 0}
              onClick={removeDuplicatesAndConfirm}
            >
              {uniqueRows.length === 0 ? (
                <div>
                  <div className="">No rows</div>
                </div>
              ) : (
                <>{t("shared.continue")}</>
              )}
            </ButtonPrimary>
          </div>
        </div>
        <div className="h-64 overflow-y-auto rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
          {rawData.columns.filter((f) => f.name).length === 0 ? (
            <div className="mx-auto flex flex-col space-y-2 p-12 text-center text-gray-600">
              <ExclamationTriangleIcon className="mx-auto h-6 w-6 text-red-600" />
              <div className="text-medium">Map at least one column to a property</div>
            </div>
          ) : uniqueRows.length === 0 ? (
            <div className="mx-auto flex flex-col space-y-2 p-12 text-center text-gray-600">
              <ExclamationTriangleIcon className="mx-auto h-6 w-6 text-red-600" />
              <div className="text-medium">Now rows</div>
            </div>
          ) : (
            <TableSimple
              items={uniqueRows}
              headers={rawData.columns
                .filter((f) => f.name)
                .map((c) => {
                  return {
                    name: c.column,
                    title: c.column,
                    value: (item: RawRow) => item?.find((f) => f.column === c.column)?.value ?? "?",
                  };
                })}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}

type MediaType = "image" | "video" | "application/pdf" | "application/msword" | "application/zip";

interface MediaDto {
  title: string;
  name: string;
  type: MediaType;
  file: string;
  publicUrl: string;
}

function getMediaType(extension: string): MediaType {
  switch (extension) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return "image";
    case "mp4":
    case "mov":
    case "avi":
      return "video";
    case "pdf":
      return "application/pdf";
    case "doc":
    case "docx":
      return "application/msword";
    case "zip":
      return "application/zip";
    default:
      return "image";
  }
}

function getMediaFromProperty(property: { name: string; value: string }): MediaDto | null {
  if (property.name.includes("[]")) {
    const extension = property.value.split(".").pop();
    if (extension) {
      const name = property.value.split("/").pop() ?? property.value;
      const type = getMediaType(extension);
      const media: MediaDto = {
        title: name,
        name,
        type,
        file: "",
        publicUrl: property.value,
      };
      return media;
    }
  }
  return null;
}

function getImportRowStringValue(item: Rows_Import.ImportRow) {
  item.properties.forEach((property) => {
    const media = getMediaFromProperty(property);
    if (media) {
      property.value = JSON.stringify(media);
    }
  });
  return JSON.stringify(item);
}

function Confirm({
  entity,
  data,
  onBack,
  selectedTenant,
}: {
  entity: EntityWithDetails;
  data: RawDataDto;
  onBack: () => void;
  selectedTenant: { id: string; name: string; slug: string } | null;
}) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const [items, setItems] = useState<Rows_Import.ImportRow[]>([]);
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<Rows_Import.ImportRow>[]>([]);
  const navigation = useNavigation();
  const submit = useSubmit();

  const actionData = useTypedActionData<Rows_Import.ActionData>();

  useEffect(() => {
    const newItems: Rows_Import.ImportRow[] = [];
    data.rows.forEach((row) => {
      const newRow: Rows_Import.ImportRow = {
        properties: [],
      };
      row.forEach((r) => {
        const column = data.columns.find((f) => f.column === r.column);
        if (column?.name) {
          newRow.properties.push({
            name: column.name,
            value: r.value,
          });
        }
      });
      newItems.push(newRow);
    });
    setItems(newItems);
  }, [data.columns, data.rows]);

  useEffect(() => {
    if (actionData?.rows) {
      setItems(actionData.rows);
    }
  }, [actionData]);

  useEffect(() => {
    const newHeaders: RowHeaderDisplayDto<Rows_Import.ImportRow>[] = [
      {
        name: "tenant",
        title: t("models.tenant.object"),
        hidden: !!appOrAdminData.currentTenant,
        value: (i) => {
          if (selectedTenant) {
            return (
              <div>
                {selectedTenant.name} ({selectedTenant.slug})
              </div>
            );
          }
          return <div className="text-muted-foreground italic">- Admin -</div>;
        },
      },
    ];
    data.columns.forEach((column) => {
      if (column.name) {
        const property = entity.properties.find((f) => f.name === column.name);
        newHeaders.push({
          name: property?.name ?? "",
          title: t(property?.title ?? ""),
          value: (i) => i.properties?.find((f) => f.name === column.name)?.value ?? "?",
        });
      }
    });
    newHeaders.push({
      name: "status",
      title: t("shared.status"),
      value: (i) => (
        <div>
          {!i.row && navigation.state === "submitting" ? (
            <div className="text-sm italic text-gray-500">Importing...</div>
          ) : i.error ? (
            <div className="text-sm text-red-500">Error: {i.error}</div>
          ) : i.row ? (
            <div className="text-sm text-emerald-500">Imported: {i.row?.id}</div>
          ) : null}
        </div>
      ),
    });
    setHeaders(newHeaders);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.columns, entity.properties, t, navigation.state]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.stopPropagation();
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tag = window.prompt("tag", "import");
    formData.set("tag", tag ?? "");
    submit(formData, {
      method: "post",
    });
  }

  return (
    <div>
      <Form method="post" onSubmit={handleSubmit}>
        <input type="hidden" name="action" value="import" hidden readOnly />
        <input type="hidden" name="selectedTenantId" value={appOrAdminData.currentTenant?.id ?? selectedTenant?.id ?? "{null}"} hidden readOnly />
        {items
          .filter((f) => !f.row)
          .map((item, idx) => {
            return <input key={idx} type="hidden" readOnly hidden name="rows[]" value={getImportRowStringValue(item)} />;
          })}
        <div className="space-y-2">
          <div className="text-xl font-bold text-gray-800">
            <div>{items.length === 1 ? <div>{t("shared.importRecord")}</div> : <div>{t("shared.importRecords", { 0: items.length })}</div>}</div>
          </div>
          {navigation.state === "submitting" ? (
            <Loading />
          ) : (
            <TableSimple
              items={items}
              headers={headers}
              actions={[
                {
                  title: "Remove",
                  onClick: (_, item) => {
                    setItems(items.filter((f) => f !== item));
                  },
                  hidden: (item) => !!item.row,
                },
              ]}
            />
          )}

          <div className="flex justify-end space-x-2">
            <ButtonSecondary onClick={onBack}>
              <div>{t("shared.back")}</div>
            </ButtonSecondary>
            <ButtonPrimary type="submit" className="flex space-x-1" disabled={items.filter((f) => !f.row).length === 0 || navigation.state === "submitting"}>
              {items.filter((f) => !f.row).length === 0 ? (
                <div>No rows</div>
              ) : (
                <>
                  {items.filter((f) => !f.row).length === 1 ? (
                    <div>{t("shared.importRecord")}</div>
                  ) : (
                    <div>{t("shared.importRecords", { 0: items.filter((f) => !f.row).length })}</div>
                  )}
                </>
              )}
            </ButtonPrimary>
          </div>
        </div>
      </Form>
    </div>
  );
}
