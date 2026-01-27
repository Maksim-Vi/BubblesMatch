import { Application } from "pixi.js";
import {DIContainer} from "./DIContainer";


export abstract class Installer {
    constructor(protected container: DIContainer, protected app: Application) {}
    abstract install(): void;
}