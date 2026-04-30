import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-blue flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md flex flex-col">
        <div className="bg-brand-yellow p-6 text-center flex flex-col items-center">
          <h1 className="text-3xl font-black text-brand-black uppercase tracking-wider">
            Tecnicentro
          </h1>
          <h2 className="text-xl font-bold text-brand-black">
            Los Carros
          </h2>
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
