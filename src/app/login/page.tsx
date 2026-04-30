"use client";

import LoginForm from "./LoginForm";
import Image from "next/image";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/fondo%20tlc.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-brand-blue/70" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md flex flex-col"
      >
        <div className="bg-brand-yellow p-6 text-center flex flex-col items-center">
          <div className="relative w-60 h-30 mb-2">
            <Image
              src="/logo.tlc.png"
              alt="Tecnicentro Los Carros Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <div className="p-8">
          <h3 className="text-xl font-bold text-brand-blue mb-6 text-center">
            Iniciar Sesión
          </h3>
          <LoginForm />
        </div>
      </motion.div>
    </div>
  );
}