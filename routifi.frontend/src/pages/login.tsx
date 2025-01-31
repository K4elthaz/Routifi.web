import HeroBanner from "@/components/hero-banner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <>
      <div className="w-screen container relative h-screen flex-col items-center justify-center grid p-8 md:p-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
        <HeroBanner />

        <div className="flex items-center justify-center">
          <form className="flex-1 flex flex-col min-w-96 max-w-md">
            <h1 className="text-2xl font-medium">Sign in</h1>
            <p className="text-sm text-foreground">
              Don&lsquo;t have an account?{" "}
              <Link className="text-foreground font-medium underline" to="/">
                Sign up
              </Link>
            </p>
            <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
              <Label htmlFor="email">Email</Label>
              <Input name="email" placeholder="you@example.com" required />
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link to="/" className="text-xs text-foreground underline">
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                name="password"
                placeholder="Your password"
                required
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
