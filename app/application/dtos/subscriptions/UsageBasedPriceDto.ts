export interface UsageBasedPriceDto {
  from: number;
  to?: number | undefined;
  perUnitPrice?: number | undefined;
  flatFeePrice?: number | undefined;
  currency: string;
}
