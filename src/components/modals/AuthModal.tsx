import Link from "next/link";
import { User as UserIcon } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal = ({ onClose }: AuthModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <span className="sr-only">Close</span>
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="text-center mb-6">
          <div className="bg-red-100 text-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <UserIcon className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Welcome Back
          </h2>
        </div>
        <div className="space-y-3">
          <Link
            href="/auth/signin?callbackUrl=/"
            onClick={onClose}
            className="flex items-center justify-center w-full bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 font-medium transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            onClick={onClose}
            className="flex items-center justify-center w-full bg-white border border-red-200 text-zinc-700 py-2.5 rounded-lg hover:bg-zinc-50 font-medium transition-all"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};
