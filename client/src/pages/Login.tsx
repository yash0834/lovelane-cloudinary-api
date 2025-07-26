import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "Account created successfully!",
          description: "Please complete your profile setup.",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "An error occurred during authentication.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-pink-700 flex flex-col justify-center items-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4" data-testid="app-title">
          Lovelane
        </h1>
        <p className="text-pink-100 text-lg">Find your perfect match</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white focus:outline-none text-gray-800"
          required
          data-testid="email-input"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white focus:outline-none text-gray-800"
          required
          data-testid="password-input"
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-pink-600 py-3 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          data-testid="submit-button"
        >
          {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
        </Button>

        <div className="text-center">
          <span className="text-pink-100">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
          </span>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-white font-semibold underline"
            data-testid="toggle-auth-mode"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </form>

      <div className="absolute bottom-8 text-center">
        <p className="text-pink-100 text-sm">By continuing, you agree to our Terms of Service</p>
      </div>
    </div>
  );
};
