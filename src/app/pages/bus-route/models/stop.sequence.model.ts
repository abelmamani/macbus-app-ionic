import { Stop } from "../../stop/models/stop.model";

export interface StopSequence{
    id: string,
    arrivalTime: string,
    distanceTraveled: number,
    headsign: string,
    stop: Stop
}