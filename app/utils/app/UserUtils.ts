import { TenantUser } from "@prisma/client";
import { TFunction } from "i18next";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import MailChecker from "mailchecker";

const avatarText = (user: any): string => {
  if (user) {
    if (user.firstName && user.lastName) {
      if (user.firstName.length > 0 && user.lastName.length > 0) {
        return (user.firstName[0] + user.lastName[0]).toUpperCase();
      } else if (user.firstName.length > 1) {
        return user.firstName.substring(0, 2).toUpperCase();
      } else if (user.email.length > 1) {
        return user.email.substring(0, 2).toUpperCase();
      }
    } else if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
  }
  return "--";
};

function getTenantPrefix(item: { name: string }) {
  const words = item.name.split(" ");
  if (words.length > 1) {
    return (words[0].substring(0, 1) + words[1].substring(0, 1)).toUpperCase();
  }
  if (item.name.length > 1) {
    return item.name.substring(0, 2).toUpperCase();
  }
  return item.name.substring(0, 1).toUpperCase();
}

const profileName = (user: { firstName: string | null; lastName: string | null; email: string } | null | undefined): string => {
  if (user) {
    if (user.firstName && user.lastName) {
      return user.firstName + " " + user.lastName;
    } else {
      return user.email;
    }
  }
  return "--";
};

const validateEmail = (email: unknown) => {
  const regexp = new RegExp(
    // eslint-disable-next-line no-useless-escape
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  if (typeof email !== "string" || email.length < 5 || !regexp.test(email) || email.length > 100) {
    return false;
  }
  if (!MailChecker.isValid(email)) {
    return false;
  }
  return true;
};

const validatePassword = (password: unknown) => {
  if (typeof password !== "string" || password.length < 4) {
    return false;
  }
  return true;
};

const validatePasswords = ({ password, passwordConfirm, t }: { password?: string; passwordConfirm?: string; t: TFunction }) => {
  if (!validatePassword(password)) {
    return "Minimum of 4 characters";
  }
  if (!password || !passwordConfirm) {
    return t("shared.isRequired", { 0: t("account.shared.password") });
  }
  if (password !== passwordConfirm) {
    return t("account.shared.passwordMismatch");
  }
};

const getUserRoleClass = (item: TenantUser) => {
  switch (item.type as TenantUserType) {
    case TenantUserType.OWNER:
      return "bg-slate-50 text-gray-800 border border-slate-300";
    case TenantUserType.ADMIN:
      return "bg-rose-50 border border-rose-200";
    case TenantUserType.MEMBER:
      return "bg-blue-50 border border-blue-200";
  }
};

const isSuspicious = ({
  email,
  firstName,
  lastName,
  honeypot,
}: {
  email: string;
  firstName?: string;
  lastName?: string;
  honeypot?: string;
}): string | undefined => {
  if (honeypot) {
    return "Honeypot";
  } else if (email === firstName) {
    return "Email as first name";
  } else if (email === lastName) {
    return "Email as last name";
  }
  // const hasSuspiciousCaseCombination = (name: string | undefined): boolean => {
  //   if (!name) return false;

  //   // Regular expression to match a suspicious pattern (e.g., alternating or random mix of cases)
  //   const suspiciousPattern = /(?=.*[A-Z])(?=.*[a-z])[A-Za-z]{3,}/;
  //   return suspiciousPattern.test(name);
  // };

  // Check both first and last names
  // if (hasSuspiciousCaseCombination(firstName) || hasSuspiciousCaseCombination(lastName)) {
  //   return "Suspicious name";
  // }
  return undefined;
};

const fullName = (user: { firstName: string | null; lastName: string | null; email: string } | null): string => {
  if (user) {
    if (user.firstName && user.lastName) {
      return user.firstName + " " + user.lastName;
    } else {
      return user.firstName ?? "";
    }
  }
  return "";
};

export default {
  avatarText,
  profileName,
  validateEmail,
  validatePassword,
  validatePasswords,
  getTenantPrefix,
  getUserRoleClass,
  isSuspicious,
  fullName,
};
