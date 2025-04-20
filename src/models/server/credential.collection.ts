import { Permission } from "appwrite";
import { credentialCollection, db, twitterEnum } from "../name";
import { databases } from "./config";

export default async function createCredentialCollection(){
    await databases.createCollection(db, credentialCollection, credentialCollection, [
        Permission.create('users'),
        Permission.read('any'),
        Permission.read('users'),
        Permission.update('users'),
        Permission.delete('users')
    ])

    console.log('Credentials collection created')

    await Promise.all([
        databases.createEnumAttribute(db, credentialCollection, 'platform', [twitterEnum], true),
        databases.createStringAttribute(db, credentialCollection, 'accessToken', 1000, true),
        databases.createStringAttribute(db, credentialCollection, 'refreshToken', 1000, true),
        databases.createStringAttribute(db, credentialCollection, 'userId', 1000, true),

    ])

    console.log('Credentials attribute created successfully')
}
