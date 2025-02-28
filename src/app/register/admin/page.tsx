"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (formData: any) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const { email, password, displayName } = formData;

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.user) {
        // Redirect to dashboard if registration is successful
        router.push("/login");
      } else {
        setErrorMessage(
          "Registration successful! Please check your email to verify your account."
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-4 text-white">Register</h2>

        {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-white font-medium">Display Name</label>
            <input
              type="text"
              {...register("displayName", { 
                required: "Display name is required",
                minLength: { value: 2, message: "Display name must be at least 2 characters long" } 
              })}
              className="w-full p-2 text-gray-900 border rounded"
              placeholder="Enter your display name"
            />
            {errors.displayName?.message && (
              <p className="text-red-500 text-sm">{String(errors.displayName.message)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-white font-medium">Email</label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full p-2 text-gray-900 border rounded"
              placeholder="Enter your email"
            />
            {errors.email?.message && (
              <p className="text-red-500 text-sm">{String(errors.email.message)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-white font-medium">Password</label>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters long" }
              })}
              className="w-full p-2 text-gray-900 border rounded"
              placeholder="Enter your password"
            />
            {errors.password?.message && (
              <p className="text-red-500 text-sm">{String(errors.password.message)}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-white">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}