import { Decimal } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
    const hash = await bcrypt.hash(password, 8);
    return hash
}

export const checkPassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
}

export const slugify = (input: string): string => {
    // Convert the string to lowercase and remove leading/trailing spaces
    let slug = input.toLowerCase().trim();

    // Replace spaces with hyphens
    slug = slug.replace(/\s+/g, '-');

    // Remove special characters and non-word characters
    slug = slug.replace(/[^\w-]+/g, '');

    return slug;
}

export const randomStr = (length: number): string => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomString = "";
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      randomString += charset.charAt(randomIndex);
    }
  
    return randomString;
}

export const randomItem = (items: any[]): any => {
    // Generate a random index within the range of the array
    const randomIndex = Math.floor(Math.random() * items.length);

    // Use the random index to select a random item from the array
    const randomItem = items[randomIndex];
    return randomItem;
}

export const removeKeys = (data: Record<string, any>, ...keysToRemove: string[]) => {
    const newData = { ...data };

    // Remove specified keys from the copied object
    keysToRemove.forEach((key) => {
        delete newData[key];
    });
    return newData
}

export const removeNullValues = (data: Record<string, any>) => {
    Object.keys(data).forEach(key => {
        if (data[key] === null) {
          delete data[key];
        }
    })
    return data
}

export const convertDateToUTC = (date: Date): Date => { 
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds())
}