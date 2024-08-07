import { useEffect, useState } from "react";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import { useTranslation } from "react-i18next";
import InputSelect from "~/components/ui/input/InputSelect";
import { SubscriptionUsageBasedUnitDto } from "~/application/dtos/subscriptions/SubscriptionUsageBasedUnitDto";
import { usageBasedUnits } from "~/application/pricing/usageBasedUnits";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import { InputType } from "~/application/enums/shared/InputType";
import NumberUtils from "~/utils/shared/NumberUtils";
import currencies from "~/application/pricing/currencies";
import TableSimple from "~/components/ui/tables/TableSimple";
import TrashIcon from "~/components/ui/icons/TrashIcon";

const INCREMENT_BY = 100;

interface Props {
  item: SubscriptionUsageBasedUnitDto;
  onUpdate: (item: SubscriptionUsageBasedUnitDto) => void;
  disabled: boolean;
}
export default function UsageBasedPricesUnit({ item, onUpdate, disabled }: Props) {
  const { t } = useTranslation();

  const [unit, setUnit] = useState(item.unit);
  const [unitTitle, setUnitTitle] = useState(item.unitTitle);
  const [unitTitlePlural, setUnitTitlePlural] = useState(item.unitTitlePlural);
  const [usageType, setUsageType] = useState(item.usageType);
  const [aggregateUsage, setAggregateUsage] = useState(item.aggregateUsage);
  const [tiersMode, setTiersMode] = useState(item.tiersMode);
  const [billingScheme, setBillingScheme] = useState(item.billingScheme);
  const [allTiers, setAllTiers] = useState<{ from: number; to?: number }[]>(item.tiers);
  const [prices, setPrices] = useState(item.prices);

  const [perUnitHeaders, setPerUnitHeaders] = useState<RowHeaderDisplayDto<{ from: number; to?: number }>[]>([]);
  const [flatFeeHeaders, setFlatFeeHeaders] = useState<RowHeaderDisplayDto<{ from: number; to?: number }>[]>([]);

  useEffect(() => {
    const usageBasedUnit = usageBasedUnits.find((f) => f.name === unit);
    if (usageBasedUnit) {
      setUnitTitle(usageBasedUnit.title);
      setUnitTitlePlural(usageBasedUnit.titlePlural);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  useEffect(() => {
    onUpdate({
      unit,
      unitTitle,
      unitTitlePlural,
      usageType,
      aggregateUsage,
      tiersMode,
      billingScheme,
      tiers: allTiers,
      prices: prices,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, unitTitle, unitTitlePlural, usageType, aggregateUsage, tiersMode, billingScheme, prices]);

  useEffect(() => {
    const allTiers: { from: number; to?: number }[] = [];
    if (item) {
      item.tiers.forEach((tier) => {
        if (!allTiers.find((f) => f.from === tier.from && f.to === tier.to)) {
          allTiers.push({ from: tier.from, to: tier.to ?? undefined });
        }
      });
    } else {
      const generateTiers = 3;
      for (let idx = 0; idx < generateTiers; idx++) {
        if (idx === 0) {
          allTiers.push({ from: 0, to: INCREMENT_BY });
        } else {
          const to = idx === generateTiers - 1 ? undefined : idx * INCREMENT_BY + INCREMENT_BY;
          allTiers.push({ from: idx * INCREMENT_BY + 1, to });
        }
      }
    }
    updateNewTierLimits(allTiers);
    setAllTiers(allTiers);
  }, [item]);

  useEffect(() => {
    let commonHeaders: RowHeaderDisplayDto<{ from: number; to?: number }>[] = [];
    commonHeaders = [
      {
        name: "fromTitle",
        title: "",
        value: (_) => "",
        formattedValue: (_, idx) => (
          <>{tiersMode === "graduated" ? <div>{idx === 0 ? <div>For the first</div> : <div>For the next</div>}</div> : <div>Total units</div>}</>
        ),
      },
      {
        name: "from",
        title: "From",
        value: (e) => e.from,
        type: InputType.NUMBER,
        setValue: (e, idx) => updateTier(idx, Number(e)),
        editable: (_, idx) => !disabled || (idx !== undefined && idx > 0),
        className: "w-24",
      },
      {
        name: "to",
        title: "To",
        value: (e) => (e.to ? e.to : "∞"),
        formattedValue: (e) => (
          <div className="flex justify-center font-medium text-gray-500">{e.to ? <span>{NumberUtils.numberFormat(e.to)}</span> : <span>∞</span>}</div>
        ),
        className: "w-24",
      },
    ];

    let perUnitHeaders: RowHeaderDisplayDto<{ from: number; to?: number }>[] = [...commonHeaders];
    let flatFeeHeaders: RowHeaderDisplayDto<{ from: number; to?: number }>[] = [...commonHeaders];

    currencies
      .filter((f) => !f.disabled)
      .forEach((currency) => {
        perUnitHeaders.push({
          name: currency.name,
          title: currency.value.toUpperCase(),
          value: (_, idx) => getCurrencyPrice(idx, currency.value)?.perUnitPrice,
          type: InputType.NUMBER,
          inputNumberStep: "0.000001",
          setValue: (e, idx) => setPerUnitPrice(idx, currency.value, Number(e)),
          editable: () => !disabled,
          className: "w-24",
        });
      });

    currencies
      .filter((f) => !f.disabled)
      .forEach((currency) => {
        flatFeeHeaders.push({
          name: currency.name,
          title: currency.value.toUpperCase(),
          value: (_, idx) => getCurrencyPrice(idx, currency.value)?.flatFeePrice,
          type: InputType.NUMBER,
          inputNumberStep: "1",
          setValue: (e, idx) => setFlatFeePrice(idx, currency.value, Number(e)),
          editable: () => !disabled,
          className: "w-24",
        });
      });

    setPerUnitHeaders(perUnitHeaders);
    setFlatFeeHeaders(flatFeeHeaders);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, tiersMode, allTiers, prices]);

  function setPerUnitPrice(idx: number, currency: string, perUnitPrice: number) {
    const newPrices = [...prices];
    const existingPrice = getCurrencyPrice(idx, currency);
    if (existingPrice) {
      existingPrice.perUnitPrice = perUnitPrice;
    } else {
      newPrices.push({
        currency,
        from: allTiers[idx].from,
        to: allTiers[idx].to,
        perUnitPrice,
      });
    }
    setPrices(newPrices);
  }

  function setFlatFeePrice(idx: number, currency: string, flatFeePrice: number) {
    const newPrices = [...prices];
    const existingPrice = getCurrencyPrice(idx, currency);
    if (existingPrice) {
      existingPrice.flatFeePrice = flatFeePrice;
    } else {
      newPrices.push({
        currency,
        from: allTiers[idx].from,
        to: allTiers[idx].to,
        flatFeePrice,
      });
    }
    setPrices(newPrices);
  }

  function getCurrencyPrice(idx: number, currency: string) {
    if (allTiers.length > idx) {
      const { from, to } = allTiers[idx];
      const existingPrice = prices.find((f) => f.currency === currency && f.from === from && f.to === to);
      return existingPrice;
    }
  }

  function updateTier(idx: number, from: number) {
    const newTiers = [...allTiers];
    newTiers[idx].from = from;
    setAllTiers(updateNewTierLimits(newTiers));
    setPrices([]);
  }

  function updateNewTierLimits(tiers: { from: number; to?: number }[]) {
    for (let idx = 0; idx < tiers.length; idx++) {
      const tier = tiers[idx];
      if (idx === 0) {
        tier.from = 0;
      }
      if (idx === tiers.length - 1) {
        tier.to = undefined;
      }
      if (idx > 0) {
        const previousTier = tiers[idx - 1];
        previousTier.to = tier.from - 1;
      }
    }
    return tiers;
  }

  function removeTier(idx: number) {
    if (allTiers.length > 1) {
      setAllTiers(updateNewTierLimits(allTiers.filter((o, i) => i !== idx)));
      setPrices([]);
    }
  }

  function addTier() {
    if (allTiers.length === 0) {
      setAllTiers(updateNewTierLimits([{ from: 0, to: undefined }]));
    } else {
      const lastTier = allTiers[allTiers.length - 1];
      setAllTiers(
        updateNewTierLimits([
          ...allTiers,
          {
            from: lastTier.from + INCREMENT_BY,
            to: undefined,
          },
        ])
      );
    }
    setPrices([]);
  }

  return (
    <div className="mt-2 border-t border-gray-100 p-2">
      <div className="space-y-/2">
        <div className="mt-2 mb-2 flex items-center justify-between space-x-1">
          <div className="text-sm font-bold">{t("pricing.usageBased.usageBasedUnit")}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <InputSelect
            className="col-span-2 sm:col-span-1"
            disabled={disabled}
            name="unit"
            title={t("pricing.usageBased.unit")}
            options={[
              ...usageBasedUnits.map((item) => {
                return {
                  name: `${t(item.title)} (${item.name})`,
                  value: item.name,
                };
              }),
            ]}
            setValue={(e) => {
              setUnit(e?.toString() ?? "");
            }}
            value={unit}
          />
          <InputSelect
            disabled={disabled}
            name="usageType"
            title={t("pricing.usageBased.usageType")}
            options={[
              { name: "License", value: "licensed" },
              { name: "Metered", value: "metered" },
            ]}
            value={usageType}
            setValue={(e) => setUsageType(e?.toString() ?? "")}
          />
          <InputSelect
            disabled={disabled}
            name="tiersMode"
            title={t("pricing.usageBased.tiersMode")}
            options={[
              { name: "Volume", value: "volume" },
              { name: "Graduated", value: "graduated" },
            ]}
            value={tiersMode}
            setValue={(e) => setTiersMode(e?.toString() ?? "")}
          />
          <InputSelect
            disabled={disabled}
            name="aggregateUsage"
            title={t("pricing.usageBased.aggregateUsage")}
            options={[
              { name: "Sum", value: "sum" },
              { name: "Max", value: "max", disabled: true },
              { name: "Last ever", value: "last_ever", disabled: true },
              { name: "Last during period", value: "last_during_period", disabled: true },
            ]}
            value={aggregateUsage}
            setValue={(e) => setAggregateUsage(e?.toString() ?? "")}
          />
          <InputSelect
            disabled={disabled}
            name="billingScheme"
            title={t("pricing.usageBased.billingScheme")}
            options={[
              { name: "Per unit", value: "per_unit", disabled: true },
              { name: "Tiered", value: "tiered" },
            ]}
            value={billingScheme}
            setValue={(e) => setBillingScheme(e?.toString() ?? "")}
          />
        </div>

        <div className="mt-2 mb-1 flex items-center justify-between space-x-1">
          <div className="text-sm font-bold">{t("pricing.usageBased.perUnitPrices")}</div>
          {!disabled && <ButtonTertiary onClick={addTier}>{t("pricing.usageBased.addTier")}</ButtonTertiary>}
        </div>

        <TableSimple
          items={allTiers}
          headers={perUnitHeaders}
          actions={[
            {
              title: (
                <div>
                  <TrashIcon className="h-4 w-4 text-gray-500" />
                </div>
              ),
              onClick: (idx, i) => removeTier(idx),
              disabled: () => disabled || allTiers.length === 1,
            },
          ]}
        />
        <div className="mt-2 mb-1 flex items-center justify-between space-x-1">
          <div className="text-sm font-bold">{t("pricing.usageBased.flatFeePrices")}</div>
          {!disabled && <ButtonTertiary onClick={addTier}>{t("pricing.usageBased.addTier")}</ButtonTertiary>}
        </div>

        <TableSimple
          items={allTiers}
          headers={flatFeeHeaders}
          actions={[
            {
              title: (
                <div>
                  <TrashIcon className="h-4 w-4 text-gray-500" />
                </div>
              ),
              onClick: (idx, i) => removeTier(idx),
              disabled: () => disabled || allTiers.length === 1,
            },
          ]}
        />
      </div>
    </div>
  );
}
