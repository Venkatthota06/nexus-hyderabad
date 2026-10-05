import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { authenticateIdentity } from "./lib/team-auth";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  session:{strategy:"jwt"},
  callbacks:{
    ...authConfig.callbacks,
    jwt({token,user}){if(user){const u=user as typeof user&{role?:string};token.id=user.id;token.role=u.role||"TEAM"}return token},
    session({session,token}){if(session.user){const u=session.user as typeof session.user&{id?:string;role?:string};u.id=String(token.id||token.sub||"");u.role=String(token.role||"TEAM")}return session}
  },
  providers:[Credentials({credentials:{email:{},password:{}},async authorize(credentials){
    const email=typeof credentials?.email==="string"?credentials.email:"",password=typeof credentials?.password==="string"?credentials.password:"";
    if(!email||!password)return null;
    return authenticateIdentity(email,password);
  }})]
});
