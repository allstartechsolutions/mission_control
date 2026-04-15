import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = params.error === "InvalidCredentials" ? "Invalid email or password" : "";
  const authBaseUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL;
  const dashboardRedirect = authBaseUrl ? new URL("/dashboard", authBaseUrl).toString() : "/dashboard";

  async function authenticate(formData: FormData) {
    "use server";

    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: dashboardRedirect,
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect("/login?error=InvalidCredentials");
      }

      throw err;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#405189]">AllStar Tech</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to Mission Control</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-center text-lg font-semibold text-gray-700">Welcome Back</h2>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Demo admin login: <span className="font-semibold">admin@allstartech.com</span> / <span className="font-semibold">password123</span>
          </div>

          <form action={authenticate} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-[#405189] focus:outline-none focus:ring-1 focus:ring-[#405189]"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-[#405189] focus:outline-none focus:ring-1 focus:ring-[#405189]"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-[#405189] py-2.5 text-sm font-medium text-white hover:bg-[#364474]"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-[#405189] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
