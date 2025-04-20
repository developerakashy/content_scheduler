import { db } from "../name"
import { databases } from "./config"
import createCredentialCollection from "./credential.collection"

export default async function getOrCreateDB(){
    try {
        await databases.get(db)
        console.log('Database connection')

    } catch (error:any) {

        try {
            await databases.create(db, db)

            await Promise.all([
                createCredentialCollection()
            ])

            console.log('Collection created')
            console.log('Database created')


        } catch (error:any) {
            console.log("Error creating databases or collections")
        }

    }
}
