import { Permission } from "appwrite";
import { questionAttachmentBucket } from "../name";
import { storage } from "./config";

export default async function getOrCreateStorage(){
    try {
        await storage.getBucket(questionAttachmentBucket)
        console.log('Storage connected')

    } catch (error:any) {

        try {
            await storage.createBucket(questionAttachmentBucket, questionAttachmentBucket,
                [
                    Permission.create('users'),
                    Permission.read('any'),
                    Permission.read('users'),
                    Permission.update('users'),
                    Permission.delete('users'),

                ],
                false,
                undefined,
                undefined,
                ['jpg', 'webp', 'png', 'jpeg', 'gif', 'heic']

            )

            console.log('storage created')
            console.log('Storage connected')

        } catch (error) {
            console.log('Error creating or connecting storage')
        }

    }
}
