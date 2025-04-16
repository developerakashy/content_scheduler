import { db } from "../name"
import createAnswerCollection from "./answer.collection"
import createCommentCollection from "./comment.collection"
import { databases } from "./config"
import createQuestionCollection from "./question.collection"
import createVoteCollection from "./vote.collection"

export default async function getOrCreateDB(){
    try {
        await databases.get(db)
        console.log('Database connection')

    } catch (error:any) {

        try {
            await databases.create(db, db)

            await Promise.all([
                createQuestionCollection(),
                createAnswerCollection(),
                createCommentCollection(),
                createVoteCollection(),
            ])

            console.log('Collection created')
            console.log('Database created')


        } catch (error:any) {
            console.log("Error creating databases or collections")
        }

    }
}
