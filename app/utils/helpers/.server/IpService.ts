import { cachified, clearCacheKey } from "~/utils/cache.server";
import { db } from "~/utils/db.server";

export type IpAddressDto = {
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
export async function getOrCreateIpAddressLookup(ip: string): Promise<IpAddressDto | null> {
  let provider: string | null = null;
  if (process.env.IPSTACK_API_KEY) {
    provider = "ipstack";
  }
  if (!provider) {
    return null;
  }
  const item = await cachified({
    key: `ipAddress:${ip}`,
    getFreshValue: () =>
      db.ipAddress.findUnique({
        where: { ip },
      }),
  });
  if (item) {
    // eslint-disable-next-line no-console
    // console.log("[getOrCreateIpAddressLookup] Found in cache", ip);
    try {
      const dto: IpAddressDto = {
        ip,
        provider,
        type: item.type,
        countryCode: item.countryCode,
        countryName: item.countryName,
        regionCode: item.regionCode,
        regionName: item.regionName,
        city: item.city,
        zipCode: item.zipCode,
        latitude: item.latitude ? Number(item.latitude) : null,
        longitude: item.longitude ? Number(item.longitude) : null,
        metadata: JSON.parse(item.metadata),
      };
      return dto;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error("[getOrCreateIpAddressLookup] Error parsing metadata", error);
      return null;
    }
  }

  // eslint-disable-next-line no-console
  // console.log("[getOrCreateIpAddressLookup] Not found in cache, fetching", ip);
  try {
    const response = await fetch(`http://api.ipstack.com/${ip}?access_key=${process.env.IPSTACK_API_KEY}`);
    const data = await response.json();
    const dto: IpAddressDto = {
      ip,
      provider,
      type: data.type,
      countryCode: data.country_code,
      countryName: data.country_name,
      regionCode: data.region_code,
      regionName: data.region_name,
      city: data.city,
      zipCode: data.zip,
      latitude: data.latitude,
      longitude: data.longitude,
      metadata: data,
    };
    await db.ipAddress
      .create({
        data: {
          ip,
          provider,
          type: data.type,
          countryCode: data.country_code,
          countryName: data.country_name,
          regionCode: data.region_code,
          regionName: data.region_name,
          city: data.city,
          zipCode: data.zip,
          latitude: data.latitude,
          longitude: data.longitude,
          metadata: JSON.stringify(data),
        },
      })
      .then((item) => {
        clearCacheKey(`ipAddress:${ip}`);
        return item;
      });
    return dto;
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("[getOrCreateIpAddressLookup] Error fetching IP data", error);
    return null;
  }
}
