// import { TimeFunction } from "../performance/timing.server";

export type PromiseHash = Record<string, Promise<unknown>>;
export type AwaitedPromiseHash<Hash extends PromiseHash> = {
  [Key in keyof Hash]: Awaited<Hash[Key]>;
};
export async function promiseHash<Hash extends PromiseHash>(hash: Hash): Promise<AwaitedPromiseHash<Hash>> {
  return Object.fromEntries(await Promise.all(Object.entries(hash).map(async ([key, promise]) => [key, await promise])));
}
// export async function promiseHashTimed<Hash extends PromiseHash>(hash: Hash, logger: { name: string; time: TimeFunction }): Promise<AwaitedPromiseHash<Hash>> {
//   return Object.fromEntries(await Promise.all(Object.entries(hash).map(async ([key, promise]) => [key, await logger.time(`[${logger.name}]`, promise)])));
// }
