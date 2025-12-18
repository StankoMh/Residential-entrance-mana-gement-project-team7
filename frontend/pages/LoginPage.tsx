import { Header } from '../components/Header';
import { Login } from '../components/Login'
import { Footer } from '../components/Footer';

export function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Login />
      </main>
      <Footer />
    </div>
  );
}
