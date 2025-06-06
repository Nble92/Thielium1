import { supabase } from "../../utils/supabase";

export function LoginCard() {
  const signInWithGoogle = async () => {
    const { user, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://aleflabs.net/auth/callback"  // Ensures a popup login instead of a full-page redirect
      }
    });
    console.log('User: ', user);

    if (error) console.error("Google login error:", error);
  };

  const signInWithLinkedIn = async () => {
    const { user, error } = await supabase.auth.signInWithOAuth({
      provider: "linkedin",
    });

    if (error) console.error("LinkedIn login error:", error);
  };

  const signInWithOrchId = () => {
    console.log('orchid-auth');
  }
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Welcome Back</h2>
      <div className="space-y-4">
        <button onClick={signInWithGoogle} className="w-full py-3 px-4 flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          <span className="text-gray-700 dark:text-gray-200">Continue with Google</span>
        </button>
        <button onClick={signInWithLinkedIn} className="w-full py-3 px-4 flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
          <img src="https://www.linkedin.com/favicon.ico" alt="LinkedIn" className="w-5 h-5" />
          <span className="text-gray-700 dark:text-gray-200">Continue with LinkedIn</span>
        </button>
        <button onClick={signInWithOrchId} className="w-full py-3 px-4 flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
          <img src="https://orcid.org/favicon.ico" alt="ORCID" className="w-5 h-5" />
          <span className="text-gray-700 dark:text-gray-200">Continue with ORCID</span>
        </button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}