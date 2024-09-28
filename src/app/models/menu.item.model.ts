import { ERole } from "./role.model";

export interface MenuItem {
    icon: string;
    label: string;
    route: string;
    roles?: ERole[]
  }