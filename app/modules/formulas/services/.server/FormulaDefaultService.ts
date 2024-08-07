import { CreateFormulaDto, createFormula } from "../../db/formulas.db.server";
import { defaultFormulas } from "../../utils/DefaultFormulas";

async function createDefault(formulaName?: string) {
  let toCreate: CreateFormulaDto[] = defaultFormulas().map((f) => ({
    name: f.name,
    description: f.description,
    resultAs: f.resultAs ?? "string",
    calculationTrigger: f.calculationTrigger ?? "NEVER",
    withLogs: false,
    components: f.components,
  }));
  if (formulaName) {
    toCreate = toCreate.filter((t) => t.name === formulaName);
  }

  const createdFormulas = await Promise.all(
    toCreate.map(async (data) => {
      await createFormula(data);
    })
  );

  return createdFormulas;
}

export default {
  createDefault,
};
