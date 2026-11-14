import { signOut } from "../actions";
import { btnGhost } from "@/lib/admin/ui";

export default function Unauthorized() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="max-w-sm text-center">
        <h1 className="text-xl font-semibold">No access</h1>
        <p className="mb-6 mt-2 text-sm text-muted">
          This account is signed in but isn&apos;t an administrator. Ask an existing admin to grant access, or sign in with a different account.
        </p>
        <form action={signOut}>
          <button className={btnGhost}>Sign out</button>
        </form>
      </div>
    </main>
  );
}
