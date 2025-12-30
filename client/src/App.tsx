import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LiveChat from './components/LiveChat';
import { PlanProvider } from './contexts/PlanContext';

function App() {
  return (
      <PlanProvider>
        <div className="min-h-screen bg-black">
          <Navbar />
          <Outlet />
          <Footer />
          <LiveChat />
        </div>
      </PlanProvider>
  );
}

export default App;