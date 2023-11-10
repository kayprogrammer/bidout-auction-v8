import settings from "../config/config"
import { v2 as cloudinary } from 'cloudinary'
import { Logger } from "@nestjs/common";
import { FileModel } from "@prisma/client";

export const ALLOWED_IMAGE_TYPES: { [key: string]: string } = {
    "image/bmp": ".bmp",
    "image/gif": ".gif",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/tiff": ".tiff",
    "image/webp": ".webp",
}

const BASE_FOLDER: string = "bidout-auction-v8/"

cloudinary.config({
    cloud_name: settings.cloudinaryCloudName,
    api_key: settings.cloudinaryApiKey,
    api_secret: settings.cloudinaryApiSecret,
    secure: true
});
export class FileProcessor {
    generateFileSignature(folder: string, key?: string): any {
        if (key) { 
            key = `${BASE_FOLDER}${folder}/${key}`
            const timestamp = Math.round((new Date).getTime() / 1000);
            const params = {
                "public_id": key,
                "timestamp": timestamp,
            }
            try {
                const signature = cloudinary.utils.api_sign_request(params, settings.cloudinaryApiSecret)
                return { "public_id": key, "signature": signature, "timestamp": timestamp }
            } catch (e: any) {
                Logger.log(e)
            }
        }   
        return null
    }

    generateFileUrl(fileObj: FileModel, folder: string): any {
        if (fileObj){
            const fileExtension = ALLOWED_IMAGE_TYPES[fileObj.resourceType]
            const key = `${BASE_FOLDER}${folder}/${fileObj.id}${fileExtension}`

            try {
                Logger.log(key)
                return cloudinary.url(key)[0]
            } catch (e: any) {
                Logger.error(`Error generating url for ${key}: ${e}`)
            }
        }
        return null
    }

    uploadFile(file: string, key: string, folder: string): any {
        key = `${BASE_FOLDER}${folder}/${key}`
        try {
            cloudinary.uploader.upload(file, { public_id: key, overwrite: true, faces: true })
        } catch (e: any) {
            Logger.log(e)
        }
    }
}