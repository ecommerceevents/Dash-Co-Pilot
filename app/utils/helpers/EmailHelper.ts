/**
 * Return the company name based on the email domain:
 * person@company.com -> company, person@dev.company.com -> company
 */
export const companyFromEmail = (email: string) => {
  const domain = email.split("@")[1];
  const domainParts = domain.split(".");
  return domainParts[domainParts.length - 2];
};
