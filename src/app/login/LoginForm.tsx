"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, Lock, User } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "El usuario es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        username: data.username.toLowerCase(),
        password: data.password,
      });

      if (result?.error) {
        setError("Usuario o contraseña incorrectos");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Usuario
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            {...register("username")}
            type="text"
            className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 text-gray-900 p-2.5 outline-none border"
            placeholder="username"
          />
        </div>
        {errors.username && (
          <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            {...register("password")}
            type="password"
            className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 text-gray-900 p-2.5 outline-none border"
            placeholder="••••••"
          />
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-brand-black bg-brand-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow transition-colors disabled:opacity-50 mt-6"
      >
        {isLoading ? (
          "Ingresando..."
        ) : (
          <>
            <Car className="w-5 h-5 mr-2" />
            Ingresar al Sistema
          </>
        )}
      </button>
    </form>
  );
}
