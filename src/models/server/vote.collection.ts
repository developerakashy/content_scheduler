import { Permission } from "appwrite";
import { answerEnum, voteCollection, db, questionEnum, upvotedEnum, downvotedEnum } from "../name";
import { databases } from "./config";

export default async function createVoteCollection(){
    await databases.createCollection(db, voteCollection, voteCollection, [
        Permission.create('users'),
        Permission.read('any'),
        Permission.read('users'),
        Permission.update('users'),
        Permission.delete('users')
    ])

    console.log('Comment collection created')

    await Promise.all([
        databases.createEnumAttribute(db, voteCollection, 'type', [answerEnum, questionEnum], true),
        databases.createStringAttribute(db, voteCollection, 'typeId', 50, true),
        databases.createEnumAttribute(db, voteCollection, 'voteStatus', [upvotedEnum, downvotedEnum], true),
        databases.createStringAttribute(db, voteCollection, 'voteById', 50, true)

    ])

    console.log('Vote attribute created successfully')
}
