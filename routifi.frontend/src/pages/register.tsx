import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import HeroBanner from "@/components/hero-banner";
import GoogleMapsPicker from "@/components/google-maps-picker";

export default function Signup() {
  return (
    <>
      <div className="w-screen container relative h-screen flex-col items-center justify-center grid p-8 md:p-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
        <HeroBanner />
        <div className="flex items-center justify-center">
          <form className="flex-1 flex flex-col min-w-96 max-w-md">
            <h1 className="text-2xl font-medium">Sign up</h1>
            <p className="text-sm text text-foreground">
              Already have an account?{" "}
              <Link
                className="text-primary font-medium underline"
                to="/sign-in"
              >
                Sign in
              </Link>
            </p>
            <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
              <Label htmlFor="name">Full Name</Label>
              <Input
                name="name"
                type="text"
                placeholder="Roland Celis"
                required
              />
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
              <Label htmlFor="phone">Contact No</Label>
              <Input
                name="phone"
                type="number"
                placeholder="09342354312"
                required
              />
              <Label htmlFor="location">Location</Label>
              <GoogleMapsPicker />

              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                name="password"
                placeholder="Your password"
                minLength={6}
                required
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
