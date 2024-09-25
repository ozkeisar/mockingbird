import { isElectronEnabled } from "../utils";

export const BASE_URL = isElectronEnabled ? 'http://localhost:1511' : window.location.href  
