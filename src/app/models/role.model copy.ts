import { Privilege } from "./privilege.model";

export interface Role {
    id: string;
    name: string;
    privileges: Privilege[];
}