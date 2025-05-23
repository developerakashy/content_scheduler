import { Permission } from "appwrite";
import { answerEnum, commentCollection, db, questionEnum } from "../name";
import { databases } from "./config";

export default async function createCommentCollection(){
    await databases.createCollection(db, commentCollection, commentCollection, [
        Permission.create('users'),
        Permission.read('any'),
        Permission.read('users'),
        Permission.update('users'),
        Permission.delete('users')
    ])

    console.log('Comment collection created')

    await Promise.all([
        databases.createStringAttribute(db, commentCollection, 'content', 10000, true),
        databases.createEnumAttribute(db, commentCollection, 'type', [answerEnum, questionEnum], true),
        databases.createStringAttribute(db, commentCollection, 'typeId', 50, true),
        databases.createStringAttribute(db, commentCollection, 'authorId', 50, true),

    ])

    console.log('Comment attribute created successfully')
}
