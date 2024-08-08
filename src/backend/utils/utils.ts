import os from 'os';
import { socketIo } from '../app';

export function listToHashmap<T>(list: T[], keyExtractor: (item: T) => string): { [key: string]: T } {
    const hashmap: { [key: string]: T } = {};
    list.forEach(item => {
        const key = keyExtractor(item);
        hashmap[key] = item;
    });
    return hashmap;
}

export function hashmapToList<T>(hashmap: { [key: string]: T }): T[] {
    return Object.keys(hashmap).map(key => hashmap[key]);
}

export function generateUniqueIdentifier() {
    const userInfo = os.userInfo();
    const identifier = `${userInfo.username}-${os.hostname()}-${Date.now()}`;
    // You might want to further process or hash this identifier for privacy or security reasons
    return identifier;
}

export const logger = (message: string, ...params: any[])=>{
  socketIo.emit('log',{message, params});

}


export function replaceUndefined(obj: any) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'undefined') {
          obj[key] = null;
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          replaceUndefined(obj[key]);
        }
      }
    }
    return obj;
  }