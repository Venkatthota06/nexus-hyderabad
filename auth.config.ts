import type { NextAuthConfig } from "next-auth";
const managementOnly=["/admin/management","/admin/business","/admin/payments","/admin/settings","/admin/monthly-report","/admin/operations","/admin/lifecycle","/admin/identification-import"];
export const authConfig={pages:{signIn:"/login"},callbacks:{authorized({auth,request:{nextUrl}}){
 const logged=!!auth?.user,path=nextUrl.pathname,role=String((auth?.user as {role?:string}|undefined)?.role||"TEAM"),management=role==="ADMIN"||role==="MANAGER";
 if((path.startsWith("/admin")||path.startsWith("/team"))&&!logged)return false;
 if(logged&&!management&&managementOnly.some(p=>path.startsWith(p)))return Response.redirect(new URL("/team",nextUrl));
 if(logged&&path==="/login")return Response.redirect(new URL(management?"/admin":"/team",nextUrl));
 return true;
}},providers:[]} satisfies NextAuthConfig;
