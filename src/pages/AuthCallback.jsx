
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function AuthCallback() {
  const [error, setError] = useState("");
  const hasCalledRefresh = useRef(false);

  useEffect(() => {
    // Prevent duplicate API calls in React StrictMode
    if (hasCalledRefresh.current) return;
    hasCalledRefresh.current = true;

    const completeLogin = async () => {
      try {
        // Exchange the HTTP-only refresh cookie for an access token
        const response = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        const { accessToken } = response.data;

        if (!accessToken) {
          throw new Error("Access token was not received.");
        }

        // Use the same storage method as your existing email login
        localStorage.setItem("accessToken", accessToken);

        // Redirect to your home page
        window.location.replace("/");
      } catch (err) {
        console.error("GitHub login callback error:", err);

        setError(
          err.response?.data?.message ||
          "GitHub login failed. Please try again."
        );
      }
    };

    completeLogin();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        {error ? (
          <>
            <h2 className="text-xl font-semibold text-red-600">
              Authentication Failed
            </h2>

            <p className="mt-2 text-gray-600">{error}</p>

            <button
              onClick={() => (window.location.href = "/")}
              className="mt-5 px-5 py-2 rounded-lg bg-gray-900 text-white"
            >
              Back to Home
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />

            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              Completing GitHub Login...
            </h2>

            <p className="mt-2 text-gray-500">
              Please wait while we securely sign you in.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthCallback;
