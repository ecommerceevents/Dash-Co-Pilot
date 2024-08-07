import { TenantUserType } from "../enums/tenants/TenantUserType";
import { SvgIcon } from "../enums/shared/SvgIcon";
import { ReactNode } from "react";
import { DefaultPermission } from "../dtos/shared/DefaultPermissions";

export interface SideBarItem {
  title: string;
  path: string;
  icon?: SvgIcon | ReactNode;
  description?: string;
  entityIcon?: string;
  open?: boolean;
  adminOnly?: boolean;
  tenantUserTypes?: TenantUserType[];
  permission?: DefaultPermission;
  items?: SideBarItem[];
  side?: ReactNode;
  exact?: boolean;
  featureFlag?: string;
  redirectTo?: string;
  isCollapsible?: boolean;
  target?: "_blank" | undefined;
  disabled?: boolean;
}
