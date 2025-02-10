import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import HeroBanner from "@/components/hero-banner";
import { useState } from "react";
import { loginUser } from "@/api/userAuthAPI";
import useAuthStore from "@/store/authStore";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { setUser, setTokens } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await loginUser({ email, password });
      console.log("Login successful:", response);

      setUser(response.user);
      setTokens(response.access_token, response.refresh_token);

      navigate("/");

      toast({
        title: "Login Successful",
        description: "Welcome to Routifi app!",
      });
    } catch (err) {
      setError(err as string);
      toast({
        title: "Login Failed",
        description:
          "There was an error during login. Please check your credentials and try again.",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div>
          <HeroBanner />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-background">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Sign in</h2>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/sign-up" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
          <div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && <p className="text-red-500">{error}</p>}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email
                </label>
                <Input
                  id="email"
                  placeholder="you@example.com"
                  type="email"
                  required
                  className="bg-background"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Password
                  </label>
                  <a href="#" className="text-sm text-primary hover:underline">
                    Forgot Password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="bg-background"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
