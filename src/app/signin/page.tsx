
import { Suspense } from "react";
import SignInForm from "../signin/SigninForm";

export default function SigninPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p>Loading sign-in...</p>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}