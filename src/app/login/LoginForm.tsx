
export const dynamic = 'force-dynamic';


"use client";

import LoginForm from "./LoginForm";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Versión base sin animaciones complejas para SSR
  const baseContent = (
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
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md flex flex-col">
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
          <div className="h-1 w-20 bg-white/50 rounded-full mx-auto mt-2" />
        </div>
        <div className="p-8">
          <h3 className="text-xl font-bold text-brand-blue mb-6 text-center">
            Iniciar Sesión
          </h3>
          <LoginForm />
        </div>
      </div>
    </div>
  );

  // Versión con animaciones solo en el cliente
  const animatedContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{
        backgroundImage: "url('/fondo%20tlc.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute inset-0 bg-brand-blue/70"
      />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          delay: 0.3,
        }}
        className="relative z-10 bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md flex flex-col"
      >
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 15,
            delay: 0.4,
          }}
          className="bg-brand-yellow p-6 text-center flex flex-col items-center relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
          
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.5,
            }}
            className="relative w-60 h-30 mb-2"
          >
            <Image
              src="/logo.tlc.png"
              alt="Tecnicentro Los Carros Logo"
              fill
              className="object-contain"
              priority
            />
          </motion.div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "80px" }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="h-1 bg-white/50 rounded-full mx-auto mt-2"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="p-8"
        >
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="text-xl font-bold text-brand-blue mb-6 text-center"
          >
            Iniciar Sesión
          </motion.h3>
          
          <LoginForm />
        </motion.div>
      </motion.div>
    </motion.div>
  );

  // Renderiza versión base en servidor, versión animada en cliente
  return isClient ? animatedContent : baseContent;
}