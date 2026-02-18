import { DefaultSession } from "next-auth"

interface Session {
    user: {
        id: string
        name?: string | null
        role: string
    } & DefaultSession["user"]
}

interface User {
    name?: string | null
    role: string
}
}
