import { BrowserRouter as Router } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import './App.css';

function App() {
  return (
    <QueryProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-foreground">
                RFP Management System
              </h1>
            </div>
          </header>
          
          <main className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Welcome to RFP Management System
              </h2>
              <p className="text-muted-foreground text-lg">
                Frontend setup completed successfully!
              </p>
              <div className="mt-8 p-6 bg-card rounded-lg border">
                <h3 className="text-xl font-semibold mb-4">Setup Status:</h3>
                <ul className="text-left space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    React + TypeScript + Vite
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Tailwind CSS v4
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    shadcn/ui components
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    React Query + Axios
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    React Router DOM
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Project structure created
                  </li>
                </ul>
              </div>
            </div>
          </main>
        </div>
      </Router>
    </QueryProvider>
  );
}

export default App;
