import type { NextAuthConfig } from "next-auth";
export const authConfig={pages:{signIn:"/login"},callbacks:{authorized({auth,request:{nextUrl}}){
 const logged=!!auth?.user,path=nextUrl.pathname,role=String((auth?.user as {role?:string}|undefined)?.role||"TEAM").toUpperCase(),management=role==="ADMIN"||role==="MANAGER";
 if((path.startsWith("/admin")||path.startsWith("/team"))&&!logged)return false;
 // TEAM users operate only inside their personal workspace. Never expose admin CRM pages directly.
 if(logged&&!management&&path.startsWith("/admin"))return Response.redirect(new URL("/team",nextUrl));
 // Management accounts should use the management workspace rather than the employee workspace.
 if(logged&&management&&path.startsWith("/team"))return Response.redirect(new URL("/admin",nextUrl));
 if(logged&&path==="/login")return Response.redirect(new URL(management?"/admin":"/team",nextUrl));
 return true;
}},providers:[]} satisfies NextAuthConfig;
