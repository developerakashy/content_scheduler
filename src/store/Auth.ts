import { account } from "@/models/client/config";
import { AppwriteException, ID, Models } from "appwrite";
import { OAuthProvider } from "appwrite";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface userPrefs{
    reputation: number
}

interface IAuthStore{
    session: Models.Session | null,
    jwt: string | null,
    user: Models.User<userPrefs> | null,
    hydrated: boolean,

    setHydrated(): void,
    verifySession(): void,
    login(
        email: string,
        password: string
    ): Promise<{
        success: boolean,
        error: AppwriteException | null
    }>,
    googleLogin(): void,
    createAccount(
        name: string,
        email: string,
        password: string
    ): Promise<{
        success: boolean,
        error: AppwriteException | null
    }>,
    logout(): Promise<void>

}

export const useAuthStore = create<IAuthStore, [["zustand/persist", unknown], ["zustand/immer", never]]>(
    persist(
        immer((set) => ({
            session: null,
            jwt: null,
            user: null,
            hydrated: false,

            setHydrated(){
                set({hydrated:true})
            },

            async verifySession(){
                try {
                    const session = await account.getSession('current')
                    const [user, {jwt}] = await Promise.all([
                        account.get<userPrefs>(),
                        account.createJWT()
                    ])

                    if (!user.prefs?.reputation) await account.updatePrefs<userPrefs>({
                        reputation: 0
                    })
                    set({session, user, jwt})

                } catch (error) {
                    console.log(error)
                }
            },

            async login(email, password){
                try {
                    const session = await account.createEmailPasswordSession(email, password)
                    const [user, {jwt}] = await Promise.all([
                        account.get<userPrefs>(),
                        account.createJWT()
                    ])

                    if (!user.prefs?.reputation) await account.updatePrefs<userPrefs>({
                        reputation: 0
                    })

                    set({session, user, jwt})

                    return {
                        success: true,
                        error: null
                    }
                } catch (error) {
                    console.log(error)
                    return {
                        success: false,
                        error: error instanceof AppwriteException ? error : null
                    }
                }
            },

            googleLogin(){

                account.createOAuth2Session(OAuthProvider.Google, 'http://localhost:3000', 'http://localhost:3000/login')

            },

            async createAccount(name, email, password){
                try {
                    await account.create(ID.unique(), email, password, name)

                    return {
                        success: true,
                        error: null
                    }

                } catch (error) {
                    console.log(error)
                    return {
                        success: false,
                        error: error instanceof AppwriteException ? error : null
                    }
                }
            },

            async logout(){
                await account.deleteSessions()
                set({session:null, user: null, jwt: null})
            }
        })),
        {
            name: 'auth',
            onRehydrateStorage(){
                return (state, error) => {
                    if(!error) state?.setHydrated()
                }
            }
        }
    )
)
