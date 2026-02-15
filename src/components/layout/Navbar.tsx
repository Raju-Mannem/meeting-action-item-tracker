import Link from "next/link";
import { Activity, Presentation, User as UserIcon } from "lucide-react";
import { Session } from "next-auth";

interface NavbarProps {
  session: Session | null;
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
  setShowAuthModal: (show: boolean) => void;
}

export const Navbar = ({ session, showProfile, setShowProfile, setShowAuthModal }: NavbarProps) => {
  return (
    <header className="h-14 flex items-center justify-between px-4 shrink-0 z-20 border-b border-red-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg shadow-red-500/20">
      <div className="font-bold text-xl tracking-tight flex items-center gap-2">
        <Presentation className="text-red-500 w-6 h-6" />
        <span className="hidden sm:inline text-red-500 select-none">ActionTracker</span>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/status"
          className="p-2 hover:bg-red-500 rounded-lg text-red-500 hover:text-white transition-colors animate-pulse"
          title="System Status"
        >
          <Activity className="w-4 h-4" />
        </Link>
        {session ? (
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 hover:bg-red-600 p-1.5 rounded-lg transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              <span className="font-medium">{session.user?.name}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="text-sm bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-400 font-medium"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
