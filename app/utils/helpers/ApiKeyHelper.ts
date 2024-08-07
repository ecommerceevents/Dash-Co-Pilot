export function getApiKeyCrudPermissions(c: boolean, r: boolean, u: boolean, d: boolean) {
  let permissions = "";
  if (c) {
    permissions += "C";
  }
  if (r) {
    permissions += "R";
  }
  if (u) {
    permissions += "U";
  }
  if (d) {
    permissions += "D";
  }
  return permissions;
}

export function checkApiKeyCallIsCreditable(statusCode: number | null) {
  if (!statusCode) {
    return false;
  }
  if (apiKeyCreditableStatusCodes.includes(statusCode)) {
    return true;
  }
  return false;
}

export const apiKeyCreditableStatusCodes = [200, 201, 202, 203, 204, 205, 206, 207, 208, 226];
export const apiKeyIgnoreEndpoints = ["/api/usage"];
