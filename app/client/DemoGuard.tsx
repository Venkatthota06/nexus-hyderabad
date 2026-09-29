"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function DemoGuard() {
  const router=useRouter();
  useEffect(()=>{ if(sessionStorage.getItem("nexus-client-demo")!=="active") router.replace("/client/login"); },[router]);
  return null;
}
