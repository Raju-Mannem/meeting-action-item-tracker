import { LogOut } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useMutation } from "@apollo/client/react";
import { UPDATE_USER } from "@/lib/graphql/mutations";

interface UserProfileProps {
  session: Session;
  showProfile: boolean;
}

export const UserProfile = ({ session, showProfile }: UserProfileProps) => {
  const [updateUser] = useMutation<{
    updateUser: { id: string; userName: string };
  }>(UPDATE_USER);

  if (!showProfile) return null;

  return (
    <div className="absolute top-14 right-4 z-50 w-64 bg-white dark:bg-zinc-900 border border-red-200 dark:border-zinc-800 rounded-xl shadow-xl p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">User Profile</h3>
        <div className="flex gap-2">
          <input
            type="text"
            defaultValue={session.user?.name || ""}
            className="w-full text-sm p-2 bg-zinc-100 rounded border-none"
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                const newName = e.currentTarget.value;
                if (newName && newName !== session.user?.name) {
                  try {
                    await updateUser({
                      variables: {
                        input: {
                          id: (session.user as { id: string }).id,
                          userName: newName,
                        },
                      },
                    });
                    alert(
                      "Username updated! Sign out and back in to see changes.",
                    );
                  } catch (err) {
                    console.error(err);
                    alert("Update failed");
                  }
                }
              }
            }}
          />
        </div>
        <div className="text-xs text-zinc-400">Press Enter to update</div>
      </div>
      <button
        onClick={() => signOut()}
        className="w-full text-left text-sm text-red-600 hover:bg-red-50 p-2 rounded flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
    </div>
  );
};
