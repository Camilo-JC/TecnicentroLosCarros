"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, Lock, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(1, "El usuario es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

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
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError("Ocurrió un error inesperado");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  // Variants con tipos corregidos
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const errorVariants = {
    hidden: { opacity: 0, y: -10, height: 0 },
    visible: {
      opacity: 1,
      y: 0,
      height: "auto",
      transition: {
        type: "spring" as const,
        stiffness: 500,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      height: 0,
      transition: { duration: 0.2 },
    },
  };

  const inputVariants = {
    focus: { 
      scale: 1.01, 
      transition: { 
        type: "spring" as const, 
        stiffness: 300 
      } 
    },
    blur: { scale: 1 },
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: {
      scale: 1.02,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 10,
      },
    },
    tap: { scale: 0.98 },
    loading: {
      scale: 0.98,
      opacity: 0.8,
    },
  };

  return (
    <motion.div
      animate={shake ? { x: [-5, 5, -3, 3, 0] } : {}}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-200"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* Campo Usuario */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <motion.div
              className="relative"
              variants={inputVariants}
              initial="blur"
              whileFocus="focus"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <motion.div
                  animate={errors.username ? { x: [-2, 2, -2, 2, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <User className="h-5 w-5 text-gray-400" />
                </motion.div>
              </div>
              <input
                {...register("username")}
                type="text"
                className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 text-gray-900 p-2.5 outline-none border transition-all duration-200"
                placeholder="username"
              />
            </motion.div>
            <AnimatePresence>
              {errors.username && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.username.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Campo Contraseña */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <motion.div
              className="relative"
              variants={inputVariants}
              initial="blur"
              whileFocus="focus"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <motion.div
                  animate={errors.password ? { rotate: [0, -5, 5, -5, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Lock className="h-5 w-5 text-gray-400" />
                </motion.div>
              </div>
              <input
                {...register("password")}
                type="password"
                className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue bg-gray-50 text-gray-900 p-2.5 outline-none border transition-all duration-200"
                placeholder="••••••"
              />
            </motion.div>
            <AnimatePresence>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Botón de Ingreso */}
          <motion.div variants={itemVariants} className="mt-6">
            <motion.button
              type="submit"
              disabled={isLoading}
              variants={buttonVariants}
              initial="idle"
              whileHover={!isLoading ? "hover" : "idle"}
              whileTap={!isLoading ? "tap" : "idle"}
              animate={isLoading ? "loading" : "idle"}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-brand-black bg-brand-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow transition-colors disabled:opacity-50 relative overflow-hidden group"
            >
              {/* Efecto de brillo en hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                initial={false}
              />
              
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center"
                >
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-brand-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Ingresando...
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center"
                >
                  <Car className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12 duration-300" />
                  Ingresar al Sistema
                </motion.div>
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  );
}