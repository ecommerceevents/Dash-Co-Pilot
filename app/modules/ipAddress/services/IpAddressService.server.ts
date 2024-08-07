import { getClientIPAddress } from "~/utils/server/IpUtils";
import { IpAddressDto } from "../dtos/IpAddressDto";
import { cachified, clearCacheKey } from "~/utils/cache.server";
import { db } from "~/utils/db.server";
import { addBlacklistAttempt, addToBlacklist, findInBlacklist } from "~/utils/db/blacklist.db.server";

async function log(
  request: Request,
  {
    action,
    description,
    metadata,
    block,
  }: {
    action: string;
    description: string;
    metadata?: { [key: string]: any };
    block?: string;
  }
) {
  let ip = getClientIPAddress(request)?.toString() || "";
  if (process.env.NODE_ENV === "development") {
    ip = "dev";
  }
  const ipAddress = await getOrCreateIpAddressLookup(ip);
  if (!ipAddress) {
    return;
  }
  let blacklistedIp = await findInBlacklist("ip", ip);
  if (!blacklistedIp && block) {
    blacklistedIp = await addToBlacklist({ type: "ip", value: ip });
  }
  if (blacklistedIp) {
    await addBlacklistAttempt(blacklistedIp);
    await db.ipAddressLog.create({
      data: {
        ipAddressId: ipAddress.id,
        ip,
        url: new URL(request.url).pathname,
        action: action,
        description,
        metadata: null,
        error: block || "Blacklisted",
        success: false,
      },
    });
    throw Error("Unauthorized.");
  } else {
    await db.ipAddressLog.create({
      data: {
        ipAddressId: ipAddress.id || null,
        ip,
        url: new URL(request.url).pathname,
        action,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
        error: null,
        success: true,
      },
    });
  }
}

async function getOrCreateIpAddressLookup(ip: string): Promise<IpAddressDto | null> {
  let provider: string | null = null;
  if (process.env.IPSTACK_API_KEY) {
    provider = "ipstack";
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
        id: item.id,
        ip,
        provider: "",
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

  const dto: IpAddressDto = {
    id: "",
    ip,
    provider: provider || "",
    type: "",
    countryCode: "",
    countryName: "",
    regionCode: "",
    regionName: "",
    city: "",
    zipCode: "",
    latitude: null,
    longitude: null,
    metadata: null,
  };

  if (provider === "ipstack") {
    try {
      const response = await fetch(`http://api.ipstack.com/${ip}?access_key=${process.env.IPSTACK_API_KEY}`);
      const data = await response.json();
      if (!response.ok || data.error) {
        // eslint-disable-next-line no-console
        console.log("[getOrCreateIpAddressLookup] Error fetching IP data", response.status, response.statusText, data.error);
      } else {
        dto.provider = "ipstack";
        dto.type = data.type;
        dto.countryCode = data.country_code;
        dto.countryName = data.country_name;
        dto.regionCode = data.region_code;
        dto.regionName = data.region_name;
        dto.city = data.city;
        dto.zipCode = data.zip;
        dto.latitude = data.latitude;
        dto.longitude = data.longitude;
        dto.metadata = data;
      }
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error("[getOrCreateIpAddressLookup] Error fetching IP data", error);
      // return null;
    }
  }

  const createdIp = await db.ipAddress
    .create({
      data: {
        ip,
        provider: dto.provider,
        type: dto.type,
        countryCode: dto.countryCode,
        countryName: dto.countryName,
        regionCode: dto.regionCode,
        regionName: dto.regionName,
        city: dto.city,
        zipCode: dto.zipCode,
        latitude: dto.latitude,
        longitude: dto.longitude,
        metadata: JSON.stringify(dto.metadata),
      },
    })
    .then((item) => {
      clearCacheKey(`ipAddress:${ip}`);
      return item;
    });

  dto.id = createdIp.id;
  return dto;
}

export default {
  log,
  getOrCreateIpAddressLookup,
};
