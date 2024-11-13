import { EPrivilege } from "./privilege.enum";

export interface MenuItem {
    icon: string;
    label: string;
    route: string;
    privilege?: EPrivilege
  }