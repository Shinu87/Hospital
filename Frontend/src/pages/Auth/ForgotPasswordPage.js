import React, { useState } from "react";
import EmailVerification from "./EmailVerification";
import ResetPassword from "./ResetPassword";
import Layout from "../../components/Layout/Layout";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  const handleEmailVerified = (verifiedEmail) => {
    setEmail(verifiedEmail);
    setStep(2); // Move to the password reset step
  };

  return (
    <Layout>
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            {step === 1 && (
              <EmailVerification onEmailVerified={handleEmailVerified} />
            )}
            {step === 2 && <ResetPassword email={email} />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;
