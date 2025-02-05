import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import HeroBanner from "@/components/hero-banner";
import GoogleMapsPicker from "@/components/google-maps-picker";
import { useState } from "react";
import { registerUser } from "@/api/userAuthAPI";
import { Button } from "@/components/ui/button";

export default function Signup() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    location: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form Data:", formData); // Debugging line

    try {
      await registerUser(formData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="w-screen container relative h-screen flex-col items-center justify-center grid p-8 md:p-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
        <HeroBanner />
        <div className="flex items-center justify-center">
          <form
            className="flex-1 flex flex-col min-w-96 max-w-md"
            onSubmit={handleSubmit}
          >
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
                name="fullname"
                type="text"
                placeholder="Roland Celis"
                required
                onChange={handleChange}
              />
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                onChange={handleChange}
              />
              <Label htmlFor="phone">Contact No</Label>
              <Input
                name="phone"
                type="number"
                placeholder="09342354312"
                required
                onChange={handleChange}
              />
              <Label htmlFor="location">Location</Label>
              <GoogleMapsPicker
                onChange={(location: string) =>
                  setFormData({ ...formData, location })
                }
              />

              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                name="password"
                placeholder="Your password"
                minLength={6}
                required
                onChange={handleChange}
              />

              <Button type="submit">Sign up</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
