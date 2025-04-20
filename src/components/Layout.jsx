import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="font-bold text-xl">YouTube Companion</h1>
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user.picture && (
                  <img 
                    src={user.picture} 
                    alt="User" 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 bg-background">
        <Outlet />
      </main>

      <footer className="border-t py-4 bg-card text-muted-foreground">
        <div className="container mx-auto px-4 text-center text-sm">
          YouTube Companion Dashboard &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
