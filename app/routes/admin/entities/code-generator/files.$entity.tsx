import { json, LoaderFunction } from "@remix-run/node";
import { useNavigate, useSearchParams } from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTypedLoaderData } from "remix-typedjson";
import { Colors } from "~/application/enums/shared/Colors";
import ColorBadge from "~/components/ui/badges/ColorBadge";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import InputSelect from "~/components/ui/input/InputSelect";
import InputText from "~/components/ui/input/InputText";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import ErrorModal from "~/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "~/components/ui/modals/SuccessModal";
import CodeGeneratorService, { CodeGeneratorFileDto, CodeGeneratorOptions } from "~/modules/codeGenerator/service/CodeGeneratorService";
import { useRootData } from "~/utils/data/useRootData";
import { EntityWithDetails, getEntityByName } from "~/utils/db/entities/entities.db.server";

type LoaderData = {
  entity: EntityWithDetails;
};
export let loader: LoaderFunction = async ({ params }) => {
  const entity = await getEntityByName({ tenantId: null, name: params.entity! });
  return json({ entity });
};

export default function CodeGeneratorFiles() {
  const { t } = useTranslation();
  const { debug } = useRootData();
  const data = useTypedLoaderData<LoaderData>();
  const navigate = useNavigate();

  const successModal = useRef<RefSuccessModal>(null);
  const errorModal = useRef<RefSuccessModal>(null);
  const confirmModal = useRef<RefConfirmModal>(null);

  const [showEditor] = useState<boolean>(true);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();

  const [options, setOptions] = useState<CodeGeneratorOptions>(getDefaultOptions(data.entity, searchParams.get("type")?.toString()));

  const [files, setFiles] = useState<CodeGeneratorFileDto[]>([]);

  useEffect(() => {
    const options: CodeGeneratorOptions = getDefaultOptions(data.entity, searchParams.get("type")?.toString());
    setOptions(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.entity, searchParams]);

  useEffect(() => {
    if (options) {
      const moduleFiles = CodeGeneratorService.getModuleFiles(options);
      const routeFiles = CodeGeneratorService.getRouteFiles(options);
      setFiles([...moduleFiles, ...routeFiles]);
    } else {
      setFiles([]);
    }
  }, [options]);

  useEffect(() => {
    const file = searchParams.get("file");
    if (!file && files.length > 0) {
      searchParams.set("file", files[0].file);
      setSearchParams(searchParams);
    }
  }, [files, searchParams, setSearchParams]);

  function getDefaultOptions(entity: EntityWithDetails, type?: string) {
    const options: CodeGeneratorOptions = {
      entity,
      type: type ?? "dynamic",
      moduleDirectory: CodeGeneratorService.moduleDirectoryOptions(data.entity)[0].value,
      routesDirectory: CodeGeneratorService.routeDirectoryOptions(data.entity)[0].value,
      deleteFilesOnFinish: false,
      generateZip: false,
    };
    return options;
  }

  function getSelectedFileCode() {
    const file = searchParams.get("file");
    const selectedFile = files.find((e) => e.file === file);
    if (selectedFile) {
      return selectedFile.content;
    }
    return "";
  }

  function onGenerate() {
    confirmModal.current?.show(
      "Generate Files",
      t("shared.download"),
      t("shared.cancel"),
      "Make sure to commit your changes before generating files. This way you can revert the changes if something goes wrong."
    );
  }
  async function onGenerateConfirmed() {
    const response = await fetch("/api/code-generator/" + data.entity.name, {
      method: "post",
      body: JSON.stringify(options),
    });
    if (response.ok) {
      successModal.current?.show("Generate Files", "Files generated successfully. You can try the module at: " + getSelectedRoute());
    } else {
      errorModal.current?.show(t("shared.error"), await response.text());
    }
  }
  function getSelectedRoute() {
    if (options?.routesDirectory.includes("/app.$tenant")) {
      return "/app";
    } else {
      return options?.routesDirectory.replace("./app/routes", "") ?? "";
    }
  }
  function onTry() {
    if (options?.routesDirectory.includes("/app/$tenant")) {
      navigate(getSelectedRoute());
    } else {
      navigate(getSelectedRoute());
    }
  }
  function filteredItems() {
    return files.filter(
      (e) =>
        e.file.toLowerCase().includes(searchInput.toLowerCase()) ||
        // e.content.toLowerCase().includes(searchInput.toLowerCase()) ||
        e.type.toLowerCase().includes(searchInput.toLowerCase())
    );
  }
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between space-x-2">
        <div className="text-lg font-bold text-gray-800">Code Generator</div>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <InputSelect
              className="col-span-3"
              title="Type"
              value={options?.type}
              setValue={(e) => {
                setOptions({ ...options, type: e?.toString() ?? "" });
                searchParams.set("type", e?.toString() ?? "");
                searchParams.delete("file");
                setSearchParams(searchParams);
              }}
              options={[
                { name: "Dynamic", value: "dynamic" },
                { name: "Custom Model", value: "custom", disabled: true },
              ]}
            />
          </div>
          <div>
            <InputSelect
              title="Module Directory"
              value={options?.moduleDirectory}
              setValue={(e) => setOptions({ ...options, moduleDirectory: e?.toString() ?? "" })}
              options={CodeGeneratorService.moduleDirectoryOptions(data.entity)}
            />
          </div>
          <div>
            <InputSelect
              title="Routes Directory"
              value={options?.routesDirectory}
              setValue={(e) => setOptions({ ...options, routesDirectory: e?.toString() ?? "" })}
              options={CodeGeneratorService.routeDirectoryOptions(data.entity)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 flex justify-between space-x-2 truncate text-xs font-medium text-gray-600">Files</label>
          <div className="my-1 h-[calc(100vh-250px)] overflow-hidden rounded-md border border-gray-200 bg-white p-2">
            <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
              <div className="md:w-5/12">
                <div className="hidden space-y-2 overflow-y-auto p-1 md:block">
                  <InputText placeholder={`Search in ${files.length} files...`} value={searchInput} setValue={(e) => setSearchInput(e.toString() ?? "")} />
                  <ul className="h-[calc(100vh-325px)] divide-y divide-gray-100 overflow-y-scroll rounded-md border border-gray-100 bg-white">
                    {filteredItems().map((file, idx) => (
                      <li key={idx}>
                        <button
                          type="button"
                          onClick={() => {
                            searchParams.set("file", file.file);
                            setSearchParams(searchParams);
                          }}
                          className={clsx(
                            "w-full  cursor-pointer truncate rounded-sm border-2 border-dashed p-2 text-left text-sm",
                            searchParams.get("file") === file.file
                              ? "border-gray-300 bg-gray-100 text-gray-900 "
                              : "border-transparent text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          <div className="flex items-center justify-between space-x-3">
                            <div className="flex flex-col">
                              <div className="truncate">
                                {file.file} <span className="text-xs text-gray-500">({file.content.split("\n").length} lines)</span>
                              </div>
                              {file.directory && <span className="text-xs font-medium text-gray-400">{file.directory}/</span>}
                            </div>

                            <div>
                              <ColorBadge color={file.type === "module" ? Colors.BLUE : file.type === "route" ? Colors.RED : Colors.VIOLET} />
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <InputSelect
                  className="md:hidden"
                  options={files.map((file, idx) => {
                    return { name: file.file, value: idx };
                  })}
                  title="Test"
                  value="test"
                  setValue={(i) => {
                    searchParams.set("file", files[i as number].file);
                    setSearchParams(searchParams);
                  }}
                />
              </div>
              {showEditor && (
                <div className="overflow-y-auto md:w-7/12">
                  <div>
                    <InputText
                      editor="monaco"
                      editorLanguage="typescript"
                      withLabel={false}
                      value={getSelectedFileCode()}
                      setValue={() => {}}
                      editorSize="screen"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-1">
          <ButtonSecondary disabled={!debug} onClick={onTry}>
            {t("shared.try")}
          </ButtonSecondary>
          <ButtonPrimary disabled={!debug} onClick={onGenerate}>
            {t("shared.download")}
          </ButtonPrimary>
        </div>

        <ConfirmModal ref={confirmModal} onYes={onGenerateConfirmed} />
        <SuccessModal ref={successModal} />
        <ErrorModal ref={errorModal} />
      </div>
    </div>
  );
}
