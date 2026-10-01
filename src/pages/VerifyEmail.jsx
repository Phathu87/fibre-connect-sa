import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, MailWarning } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { authService } from "@/services/authService";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState(token ? "loading" : "invalid");

  useEffect(() => {
    if (!token) return;
    let active = true;
    authService.verifyEmail(token)
      .then(() => { if (active) setStatus("verified"); })
      .catch(() => { if (active) setStatus("invalid"); });
    return () => { active = false; };
  }, [token]);

  if (status === "loading") {
    return <AuthLayout icon={Loader2} title="Verifying email" subtitle="Please wait while we verify your secure link"><p className="text-center text-sm text-muted-foreground">Checking verification link...</p></AuthLayout>;
  }

  if (status === "verified") {
    return <AuthLayout icon={CheckCircle2} title="Email verified" subtitle="Your FibreConnect SA account is ready"><Link to="/login" className="block text-center font-medium text-primary hover:underline">Continue to log in</Link></AuthLayout>;
  }

  return <AuthLayout icon={MailWarning} title="Verification link invalid" subtitle="This link may be incomplete, expired, or already used"><Link to="/login" className="block text-center font-medium text-primary hover:underline">Return to log in</Link></AuthLayout>;
}
