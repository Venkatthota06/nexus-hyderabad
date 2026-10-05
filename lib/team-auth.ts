import bcrypt from "bcryptjs";

export type NexusRole = "ADMIN" | "MANAGER" | "TEAM";
export type TeamIdentity = { id:string; name:string; email:string; role:NexusRole; passwordHash:string };

function decodeHash(value:string){try{return Buffer.from(value,"base64").toString("utf8")}catch{return""}}

export function configuredTeam():TeamIdentity[]{
  const raw=process.env.TEAM_USERS_JSON_BASE64||"";
  if(!raw)return[];
  try{
    const parsed=JSON.parse(Buffer.from(raw,"base64").toString("utf8"));
    if(!Array.isArray(parsed))return[];
    return parsed.map((x:Record<string,unknown>,i)=>({
      id:String(x.id||`team-${i+1}`),name:String(x.name||"").trim(),email:String(x.email||"").trim().toLowerCase(),
      role:(String(x.role||"TEAM").toUpperCase() as NexusRole),passwordHash:decodeHash(String(x.passwordHashBase64||""))
    })).filter(x=>x.name&&x.email&&x.passwordHash&&["ADMIN","MANAGER","TEAM"].includes(x.role));
  }catch{return[]}
}

export async function authenticateIdentity(email:string,password:string){
  const normalized=email.trim().toLowerCase();
  const adminEmail=(process.env.ADMIN_EMAIL||"").trim().toLowerCase();
  const adminHash=decodeHash(process.env.ADMIN_PASSWORD_HASH_BASE64||"");
  if(normalized&&normalized===adminEmail&&adminHash&&await bcrypt.compare(password,adminHash))return{id:"nexus-admin",name:"Nexus Admin",email:adminEmail,role:"ADMIN" as NexusRole};
  const member=configuredTeam().find(x=>x.email===normalized);
  if(member&&await bcrypt.compare(password,member.passwordHash))return{id:member.id,name:member.name,email:member.email,role:member.role};
  return null;
}

export function sessionIdentity(user:unknown){const u=(user||{}) as Record<string,unknown>;return{id:String(u.id||""),name:String(u.name||""),email:String(u.email||""),role:String(u.role||"TEAM") as NexusRole}}
export function isManagement(role:string){return role==="ADMIN"||role==="MANAGER"}
