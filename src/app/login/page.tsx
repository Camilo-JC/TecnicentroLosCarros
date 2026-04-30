import LoginForm from "./LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-blue flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md flex flex-col">
        <div className="bg-brand-yellow p-6 text-center flex flex-col items-center">
          <div className="relative w-48 h-20 mb-2">
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
