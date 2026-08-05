import { AuthPage } from "@/components/ui/auth-page";
import { login, register } from "@/api/auth";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const response = await login({
      email,
      password,
    });

    localStorage.setItem("access_token", response.access_token);

    console.log("Access token stored" + response.access_token);

    console.log("Logged in successfully");
    navigate("/health-details"); // Change to page after login/register
  };

  const handleRegister = async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await register({
      name,
      email,
      password,
    });

    console.log("Registration successful:", response);

    // Automatically log the user in after registration
    const loginResponse = await login({
      email,
      password,
    });

    localStorage.setItem("access_token", loginResponse.access_token);
    console.log("Access token stored: " + loginResponse.access_token);
    console.log("Logged in after registration");
    navigate("/health-details"); // Change to page after login/register
  };

  return (
    <AuthPage
      brandName="CITI WORKSHOP"
      brandTagline="Full Stack Platform"
      heroTitle={
        <>
          BUILDING THE NEXT <br />
          GENERATION{" "}
          <span className="italic font-serif text-primary font-normal">
            Experience
          </span>
        </>
      }
      heroDescription="A full-stack application built with React, FastAPI, MongoDB, and AWS."
      heroBadgeText="SECURE PLATFORM"
      stats={[
        { value: "99.99%", label: "Platform Uptime" },
        { value: "256-bit", label: "Encryption" },
        { value: "24/7", label: "Availability" },
      ]}
      onLogin={handleLogin}
      onRegister={handleRegister}
    />
  );
}
