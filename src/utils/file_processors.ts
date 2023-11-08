import settings from "src/config/config"
import { v2 as cloudinary } from 'cloudinary'
import { Logger } from "@nestjs/common";

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
    generate_file_signature(key: string, folder: string): any {
        var key = `${BASE_FOLDER}${folder}/${key}`
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

    generate_file_url(key: string, folder: string, contentType: string): any {
        const fileExtension = ALLOWED_IMAGE_TYPES[contentType]
        key = `${BASE_FOLDER}${folder}/${key}${fileExtension}`

        try {
            return cloudinary.url(key)[0]
        } catch (e: any) {
            Logger.error(`Error generating url for ${key}: ${e}`)
        }
    }

    upload_file(file: string, key: string, folder: string): any {
        key = `${BASE_FOLDER}${folder}/${key}`
        try {
            cloudinary.uploader.upload(file, { public_id: key, overwrite: true, faces: true })
        } catch (e: any) {
            Logger.log(e)
        }
    }

}