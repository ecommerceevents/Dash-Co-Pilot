export type IpAddressDto = {
  id: string;
  ip: string;
  provider: string;
  type: string;
  countryCode: string;
  countryName: string;
  regionCode: string;
  regionName: string;
  city: string;
  zipCode: string;
  latitude: number | null;
  longitude: number | null;
  metadata: { [key: string]: any } | null;
};
