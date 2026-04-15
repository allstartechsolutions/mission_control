"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirmPassword") as string;

    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password,
        phone: formData.get("phone"),
        mobile: formData.get("mobile"),
        whatsapp: formData.get("whatsapp"),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed");
    } else {
      router.push("/login");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#405189]">AllStar Tech</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create your Mission Control account
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-center text-lg font-semibold text-gray-700">
            Create Account
          </h2>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-[#405189] focus:outline-none focus:ring-1 focus:ring-[#405189]"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-[#405189] focus:outline-none focus:ring-1 focus:ring-[#405189]"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                name="phone"
                type="tel"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-[#405189] focus:outline-none focus:ring-1 focus:ring-[#405189]"
                placeholder="(555) 555-0143"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mobile
              </label>
              <input
                name="mobile"
                type="tel"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-[#405189] focus:outline-none focus:ring-1 focus:ring-[#405189]"
                placeholder="(555) 555-0198"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                WhatsApp
              </label>
              <input
                name="whatsapp"
                type="tel"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-[#405189] focus:outline-none focus:ring-1 focus:ring-[#405189]"
                placeholder="+1 555 555 0198"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-[#405189] focus:outline-none focus:ring-1 focus:ring-[#405189]"
                placeholder="Minimum 8 characters"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-[#405189] focus:outline-none focus:ring-1 focus:ring-[#405189]"
                placeholder="Re-enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#405189] py-2.5 text-sm font-medium text-white hover:bg-[#364474] disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[#405189] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
