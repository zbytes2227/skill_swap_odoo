"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth', {
        credentials: 'include', // if you're using cookies
      });
      const data = await res.json();

      if (!data.success || !data.user || data.user.isBanned) {
      } else {
        router.push('/');
      }
      // else do nothing (user is valid)
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  checkAuth();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const body = {
        email,
        password,
        mode: isRegister ? "register" : "login",
        ...(isRegister && { name }), // only include name if registering
      };

      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log(data);
      setMessage(data.msg);

      if (data.success && isRegister) {
        router.push("/profile");
      } else if (data.success) {
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="flex flex-1 justify-center items-center">
          <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isRegister ? "Register" : "Login"}
            </h2>

            {message && (
              <div className="mt-4 rounded-md bg-red-100 px-4 py-2 my-3 text-center text-sm text-red-700">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
              >
                {loading ? "Processing..." : isRegister ? "Register" : "Login"}
              </button>

              <p className="text-sm text-center mt-2">
                <button
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setName("");
                    setEmail("");
                    setPassword("");
                    setMessage("");
                  }}
                >
                  {isRegister
                    ? "Already have an account? Login"
                    : "New user? Register here"}
                </button>
              </p>

              <p className="text-sm text-center mt-2 text-blue-600 hover:underline cursor-pointer">
                Forgot username/password
              </p>
            </form>
          </div>
        </div>
      </div>
    </>

  );
};

export default Login;
