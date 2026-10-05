import type { NextAuthConfig } from "next-auth";
export const authConfig={pages:{signIn:"/login"},callbacks:{authorized({auth,request:{nextUrl}}){
 const logged=!!auth?.user,path=nextUrl.pathname,role=String((auth?.user as {role?:string}|undefined)?.role||"TEAM"),management=role==="ADMIN"||role==="MANAGER";
 if(path.startsWith("/admin")||path.startsWith("/team")){if(!logged)return false;if(path.startsWith("/admin")&&!management)return Response.redirect(new URL("/team",nextUrl));}
 if(logged&&path==="/login")return Response.redirect(new URL(management?"/admin":"/team",nextUrl));
 return true;
}},providers:[]} satisfies NextAuthConfig;
