// import { Property } from "@prisma/client";
// import { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
// import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
// import { calculate } from "~/utils/helpers/FormulaUtils";
// import NumberUtils from "~/utils/shared/NumberUtils";

// export interface RefFormulaControl {
//   focus: () => void;
// }

// interface Props {
//   // TODO: Typed
//   request: any | undefined;
//   selected: Property | undefined;
//   onChange: (value: string | number | Date) => void;
// }

// const FormulaControl = ({ request, selected, onChange }: Props, ref: Ref<RefFormulaControl>) => {
//   useImperativeHandle(ref, () => ({ focus }));

//   const textInput = useRef<HTMLInputElement>(null);

//   const [result, setResult] = useState("");
//   const [formula, setFormula] = useState("");

//   const [showFormulaInput, setShowFormulaInput] = useState(false);

//   useEffect(() => {
//     // setFormula(selected?.formula ?? "");
//   }, [selected]);

//   // useWhatChanged(deps);
//   useEffect(() => {
//     // console.log("CALCULATION");
//     setTimeout(() => {
//       const value = calculate(request, formula);
//       const number = Number(value);
//       if (number) {
//         setResult(NumberUtils.decimalFormat(number));
//       } else {
//         setResult(value);
//       }
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, 500);
//   }, [request, formula]);

//   useEffect(() => {
//     onChange(result);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [result]);

//   function focus() {
//     textInput.current?.focus();
//   }

//   return (
//     <div className="">
//       <div className="">
//         <label htmlFor={"result-" + selected?.name.toLowerCase().replace(" ", "")} className="block text-xs font-medium text-gray-700">
//           {selected?.title} {selected?.isRequired && <span className="text-red-500">*</span>}
//         </label>
//         <div className="mt-1">
//           <input
//             ref={textInput}
//             disabled
//             type="text"
//             name="result"
//             id="result"
//             value={result}
//             className=" block w-full cursor-not-allowed rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-theme-500 focus:ring-theme-500 sm:text-sm"
//           />
//           <div className="flex justify-end">
//             <ButtonTertiary className="text-xs" type="button" onClick={() => setShowFormulaInput(!showFormulaInput)}>
//               {showFormulaInput ? "Hide" : "Show"} formula (admin)
//             </ButtonTertiary>
//           </div>
//         </div>
//       </div>
//       {showFormulaInput && (
//         <div className="">
//           <label htmlFor={"formula-" + selected?.name.toLowerCase().replace(" ", "")} className="block text-xs font-medium text-gray-700">
//             Formula tests
//           </label>
//           <div className="mt-1">
//             <input
//               type="text"
//               name="formula"
//               id="formula"
//               value={formula}
//               onChange={(e) => setFormula(e.currentTarget.value)}
//               className="  block w-full rounded-md border-gray-300 shadow-sm focus:border-theme-500 focus:ring-theme-500 sm:text-sm"
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default forwardRef(FormulaControl);
