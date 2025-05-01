"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { Truck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { requestOTP, login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const requestOTPHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await requestOTP(email);

      // In development, show toast with OTP info
      if (process.env.NODE_ENV === "development") {
        toast.success(
          `OTP sent! Code: ${result?.otp || "Check console for OTP"}`
        );

        // If we have the OTP, auto-fill it for testing
        if (result?.otp) {
          setOtp(result.otp);
        }
      } else {
        toast.success("OTP sent to your email");
      }

      // Move to verification step
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request OTP");
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTPHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, otp);
      setLoginSuccess(true);
      toast.success("Login successful");

      // Router.push is handled in the login function
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
      toast.error("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen on successful login
  if (loginSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Login Successful</h2>
          <div className="mb-4">Redirecting to dashboard...</div>
          <div className="w-10 h-10 border-t-4 border-teal-600 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Bubble Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(135deg, #c2dcda 0%, #3a938b 100%)",
        }}
      >
        {/* Large bubble decorations */}
        <div
          className="absolute rounded-full opacity-20"
          style={{
            width: "300px",
            height: "300px",
            background: "#1c4c4c",
            top: "10%",
            left: "5%",
            filter: "blur(2px)",
          }}
        />
        <div
          className="absolute rounded-full opacity-20"
          style={{
            width: "400px",
            height: "400px",
            background: "#1c4c4c",
            bottom: "-10%",
            right: "15%",
            filter: "blur(3px)",
          }}
        />
        <div
          className="absolute rounded-full opacity-20"
          style={{
            width: "200px",
            height: "200px",
            background: "white",
            top: "20%",
            right: "10%",
            filter: "blur(2px)",
          }}
        />
        <div
          className="absolute rounded-full opacity-20"
          style={{
            width: "250px",
            height: "250px",
            background: "white",
            bottom: "15%",
            left: "10%",
            filter: "blur(2px)",
          }}
        />

        {/* Small floating bubbles */}
        <div
          className="absolute rounded-full opacity-30"
          style={{
            width: "50px",
            height: "50px",
            background: "#1c4c4c",
            top: "40%",
            left: "25%",
            filter: "blur(1px)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full opacity-30"
          style={{
            width: "30px",
            height: "30px",
            background: "white",
            top: "30%",
            right: "35%",
            filter: "blur(1px)",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full opacity-30"
          style={{
            width: "70px",
            height: "70px",
            background: "#1c4c4c",
            bottom: "30%",
            right: "25%",
            filter: "blur(1px)",
            animation: "float 10s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full opacity-30"
          style={{
            width: "40px",
            height: "40px",
            background: "white",
            bottom: "40%",
            left: "35%",
            filter: "blur(1px)",
            animation: "float 7s ease-in-out infinite",
          }}
        />

        {/* Animation keyframes are added in the page as inline styles */}
        <style jsx>{`
          @keyframes float {
            0% {
              transform: translateY(0) translateX(0);
            }
            50% {
              transform: translateY(-20px) translateX(10px);
            }
            100% {
              transform: translateY(0) translateX(0);
            }
          }
        `}</style>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 z-10">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
              <Truck className="text-teal-600" size={30} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#1c4c4c] mb-1">
            OM Transport Dashboard
          </h1>
          <h2 className="text-gray-600">Log in to your account</h2>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
            {error}
          </div>
        )}

        {step === "request" ? (
          <form onSubmit={requestOTPHandler}>
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm text-gray-700"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-sm font-medium"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOTPHandler}>
            <p className="mb-3 text-sm text-gray-600">
              An OTP has been sent to your email. Please enter it below.
            </p>
            <div className="mb-5">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                OTP Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm text-gray-700"
                placeholder="Enter 6-digit code"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-sm font-medium mb-2"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={() => setStep("request")}
              className="w-full text-center p-2 text-sm text-teal-600 hover:text-teal-800 font-medium"
              disabled={loading}
            >
              Go back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
