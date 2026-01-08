import { Header } from '../components/Header';
import { Register } from '../components/Register';
import { Footer } from '../components/Footer';

export function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Register />
      </main>
      <Footer />
    </div>
  );
}
