import { useEffect, useState, useRef, useCallback } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

interface Props {
  file: any;
  className?: string;
  fileName?: any;
  editing?: boolean;
  canDownload?: boolean;
  onRemoveFile?: () => void;
  size?: {
    height?: number;
    width?: number;
  };
  scale?: number;
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function PdfViewer({ className, file, onRemoveFile, fileName = "", editing = false, canDownload = true, size, scale = 0.49 }: Props) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  const [pdfRef, setPdfRef] = useState<any>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState("");

  const loadPDFJS = () => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.min.js";
    script.onload = () => {
      if (window.pdfjsLib.GlobalWorkerOptions) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js";
      }
    };
    document.body.appendChild(script);
  };

  const downloadPdf = () => {
    const downloadLink = document.createElement("a");
    const name = (fileName ?? "document") + ".pdf";
    downloadLink.href = file;
    downloadLink.download = name;
    downloadLink.click();
  };

  const renderPage = useCallback(
    async (pageNum: number, pdf = pdfRef) => {
      if (pdf) {
        setPageCount(pdf.numPages);
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.height = size?.height ?? viewport.height;
          canvas.width = size?.width ?? viewport.width;

          if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
          }

          const renderContext = {
            canvasContext: canvas.getContext("2d"),
            viewport: viewport,
          };
          renderTaskRef.current = page.render(renderContext);
          renderTaskRef.current.promise.catch((error: any) => {
            if (error.name !== "RenderingCancelledException") {
              // eslint-disable-next-line no-console
              console.error(error);
            }
          });
        }
      }
    },
    [pdfRef, scale, size]
  );

  useEffect(() => {
    loadPDFJS();

    const initPdf = async () => {
      try {
        const PDFJS = window.pdfjsLib;
        const loadingTask = PDFJS.getDocument(file);
        const loadedPdf = await loadingTask.promise;
        setPdfRef(loadedPdf);
      } catch (error: any) {
        setError(error.message);
      }
    };

    if (window.pdfjsLib) {
      initPdf();
    } else {
      const intervalId = setInterval(() => {
        if (window.pdfjsLib) {
          clearInterval(intervalId);
          initPdf();
        }
      }, 100);
    }
  }, [file]);

  useEffect(() => {
    renderPage(currentPage, pdfRef);
  }, [pdfRef, currentPage, renderPage]);

  const nextPage = () => {
    pdfRef && currentPage < pdfRef.numPages && setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    currentPage > 1 && setCurrentPage(currentPage - 1);
  };

  return (
    <div
      id="pdf-viewer"
      className={clsx(className, "items-center overflow-hidden rounded-md border border-dashed border-gray-300 bg-white text-gray-600")}
      style={{
        height: size?.height ?? "auto",
        width: size?.width ?? "auto",
      }}
    >
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : !pdfRef ? (
        <div className={clsx("flex items-center justify-center", size ? "h-full p-12" : "h-64 p-12")}>
          <div className="base-spinner flex justify-center p-12 text-sm italic text-gray-500"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center space-x-2">
              <div
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="left-0 top-0 ml-1 mt-1 flex origin-top-left cursor-default items-center space-x-2"
              >
                <span className="relative z-0 inline-flex rounded-md shadow-sm">
                  <button
                    type="button"
                    className={clsx(
                      "focus:border-theme-500 focus:ring-theme-500 relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-1 py-1 text-xs font-medium text-gray-500 focus:z-10 focus:outline-none focus:ring-1",
                      currentPage === 1 && "cursor-not-allowed  bg-gray-50",
                      currentPage !== 1 && "hover:bg-gray-50"
                    )}
                    disabled={currentPage === 1}
                    onClick={(e) => {
                      e.preventDefault();
                      prevPage();
                    }}
                  >
                    <span className="sr-only">{t("shared.previous")}</span>
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <span className="relative -ml-px inline-flex select-none items-center border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700">
                    {currentPage} / {pageCount}
                  </span>
                  <button
                    type="button"
                    className={clsx(
                      "focus:border-theme-500 focus:ring-theme-500 relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-white px-1 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1",
                      currentPage === pageCount && "cursor-not-allowed bg-gray-50",
                      currentPage !== pageCount && "hover:bg-gray-50"
                    )}
                    disabled={currentPage === pageCount}
                    onClick={(e) => {
                      e.preventDefault();
                      nextPage();
                    }}
                  >
                    <span className="sr-only">{t("shared.next")}</span>
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </span>
              </div>
              {canDownload && (
                <button
                  type="button"
                  className="focus:ring-theme-500 right-0 top-0 mr-0 mt-1 inline-flex origin-top-right items-center rounded border-gray-300 px-1.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1"
                  onClick={(e) => {
                    e.preventDefault();
                    downloadPdf();
                  }}
                >
                  <svg className="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M 11 2 C 10.448 2 10 2.448 10 3 L 10 11 L 6.5 11 A 0.5 0.5 0 0 0 6 11.5 A 0.5 0.5 0 0 0 6.1464844 11.853516 A 0.5 0.5 0 0 0 6.1777344 11.882812 L 11.283203 16.697266 L 11.316406 16.728516 A 1 1 0 0 0 12 17 A 1 1 0 0 0 12.683594 16.728516 L 12.697266 16.716797 A 1 1 0 0 0 12.707031 16.705078 L 17.810547 11.892578 A 0.5 0 0 0 17.839844 11.865234 L 17.847656 11.859375 A 0.5 0 0 0 17.853516 11.853516 A 0.5 0 0 0 18 11.5 A 0.5 0 0 0 17.5 11 L 14 11 L 14 3 C 14 2.448 13.552 2 13 2 L 12 2 L 11 2 z M 3 20 A 1.0001 1.0001 0 1 0 3 22 L 21 22 A 1.0001 1.0001 0 1 0 21 20 L 3 20 z"></path>
                  </svg>
                </button>
              )}
            </div>
            <div className="flex cursor-default items-center space-x-2">
              {editing && (
                <button
                  type="button"
                  className="focus:ring-theme-500 right-0 top-0 mr-0 mt-1 inline-flex origin-top-right items-center rounded border-gray-300 px-1.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1"
                  onClick={onRemoveFile}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="mx-auto flex items-center justify-center py-4 text-center">
            <canvas ref={canvasRef}></canvas>
          </div>
        </>
      )}
    </div>
  );
}
