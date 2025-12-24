import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MindMap from './components/mind-map';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <MindMap />
      </main>
      <Footer />
    </div>
  );
}
