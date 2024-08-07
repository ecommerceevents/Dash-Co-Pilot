const endpoint = "https://api.fly.io/graphql";

async function addCert({ appId, hostname, apiToken }: { appId: string; hostname: string; apiToken: string }) {
  // eslint-disable-next-line no-console
  console.log("FlyApi.addCert", { appId, hostname });
  const query = `
    mutation($appId: ID!, $hostname: String!) {
        addCertificate(appId: $appId, hostname: $hostname) {
            certificate {
                configured
                acmeDnsConfigured
                acmeAlpnConfigured
                certificateAuthority
                certificateRequestedAt
                dnsProvider
                dnsValidationInstructions
                dnsValidationHostname
                dnsValidationTarget
                hostname
                id
                source
            }
        }
    }`;

  const variables = { appId, hostname };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await response.json();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(data, undefined, 2));
  return data;
}

export type FlyGetCertDto = {
  data: {
    app: {
      certificate: {
        configured: boolean;
        acmeDnsConfigured: boolean;
        acmeAlpnConfigured: boolean;
        certificateAuthority: string;
        createdAt: string;
        dnsProvider: string;
        dnsValidationInstructions: string;
        dnsValidationHostname: string;
        dnsValidationTarget: string;
        hostname: string;
        id: string;
        source: string;
        clientStatus: string;
        issued: {
          nodes: Array<any>;
        };
      };
    };
  };
};
async function getCert({ appId, hostname, apiToken }: { appId: string; hostname: string; apiToken: string }): Promise<FlyGetCertDto> {
  const query = `
    query($appName: String!, $hostname: String!) {
        app(name: $appName) {
            certificate(hostname: $hostname) {
                configured
                acmeDnsConfigured
                acmeAlpnConfigured
                certificateAuthority
                createdAt
                dnsProvider
                dnsValidationInstructions
                dnsValidationHostname
                dnsValidationTarget
                hostname
                id
                source
                clientStatus
                issued {
                    nodes {
                        type
                        expiresAt
                    }
                }
            }
        }
    }`;

  const variables = { appName: appId, hostname };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await response.json();
  if (data.errors && data.errors.length) {
    throw new Error(data.errors[0].message);
  }
  return data;
}

// async function checkCert({ appId, hostname, apiToken }: { appId: string; hostname: string; apiToken: string }) {
//   const query = `
//     query($appName: String!, $hostname: String!) {
//         app(name: $appName) {
//             certificate(hostname: $hostname) {
//                 check
//                 configured
//                 acmeDnsConfigured
//                 acmeAlpnConfigured
//                 certificateAuthority
//                 createdAt
//                 dnsProvider
//                 dnsValidationInstructions
//                 dnsValidationHostname
//                 dnsValidationTarget
//                 hostname
//                 id
//                 source
//                 clientStatus
//                 issued {
//                     nodes {
//                         type
//                         expiresAt
//                     }
//                 }
//             }
//         }
//     }`;

//   const variables = { appName: appId, hostname };

//   const response = await fetch(endpoint, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${apiToken}`,
//     },
//     body: JSON.stringify({ query, variables }),
//   });
//   if (response.status !== 200) {
//     return null;
//   }
//   const data = await response.json();
//   return data;
// }

async function delCert({ appId, hostname, apiToken }: { appId: string; hostname: string; apiToken: string }) {
  const query = `
    mutation($appId: ID!, $hostname: String!) {
        deleteCertificate(appId: $appId, hostname: $hostname) {
            app {
                name
            }
            certificate {
                hostname
                id
            }
        }
    }
`;
  const variables = { appId: appId, hostname: hostname };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await response.json();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(data, undefined, 2));
  return data;
}

export default {
  addCert,
  getCert,
  // checkCert,
  delCert,
};
