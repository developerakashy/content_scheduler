import env from "@/app/env";
import { Account, Avatars, Client, Databases, Storage } from "appwrite";

const client = new Client()
        .setEndpoint(env.appwrite.endpoint)
        .setProject(env.appwrite.projectId)


export const databases = new Databases(client)
export const account = new Account(client)
export const avatars = new Avatars(client)
export const storage = new Storage(client)
