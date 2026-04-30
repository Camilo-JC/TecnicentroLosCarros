"use client";

import LoginForm from "./LoginForm";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoginPage() {
  // Estado para evitar errores de hidratación
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setMounted(true);
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  // No renderizar las partículas hasta que esté montado en el cliente
  const particles = mounted ? [...Array(8)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
  })) : [];

  if (!mounted) {
    // Renderizado inicial en servidor (sin animaciones complejas)
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
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
        style={{
          backgroundImage: "url('/fondo%20tlc.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay azul semitransparente con animación */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute inset-0 bg-brand-blue/70"
        />

        {/* Fondo dinámico con partículas - solo en cliente */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
        >
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              initial={{
                x: 0,
                y: 0,
              }}
              animate={{
                y: [0, -100, -200],
                opacity: [0.2, 0.5, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
              }}
              style={{
                left: particle.left,
                top: particle.top,
              }}
            />
          ))}
        </motion.div>

        {/* Card principal */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.3,
            duration: 0.6,
          }}
          className="relative z-10 bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md flex flex-col"
        >
          {/* Header amarillo animado */}
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
            {/* Efecto de brillo en el header */}
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
            
            {/* Logo animado */}
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

            {/* Línea decorativa animada */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "80px" }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="h-1 bg-white/50 rounded-full mx-auto mt-2"
            />
          </motion.div>

          {/* Contenido del formulario */}
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

          {/* Efecto de borde animado al hacer hover (opcional) */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            initial={{ boxShadow: "0 0 0 0px rgba(0,0,0,0)" }}
            whileHover={{
              boxShadow: "0 0 0 2px rgba(255,193,7,0.3), 0 20px 40px rgba(0,0,0,0.2)",
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}