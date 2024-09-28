import { Identity } from "./identity.model";

export interface ResponseAuth{
    token: string;
    identity: Identity;
}