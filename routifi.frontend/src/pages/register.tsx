import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import HeroBanner from "@/components/hero-banner";
import GoogleMapsPicker from "@/components/google-maps-picker";
import { useState } from "react";
import { registerUser } from "@/api/userAuthAPI";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const initialFormData = {
    full_name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await registerUser(formData);
      navigate("/sign-in");
      toast({
        title: "Registration Successful",
        description: "You can now login to your account",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Registration Failed",
        description:
          "There was an error during registration. Please try again.",
      });
    }

    setFormData(initialFormData);
  };

  return (
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
            <Link className="text-primary font-medium underline" to="/sign-in">
              Sign in
            </Link>
          </p>
          <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
            <Label htmlFor="fullname">Full Name</Label>
            <Input
              name="full_name"
              type="text"
              placeholder="Roland Celis"
              required
              value={formData.full_name}
              onChange={handleChange}
            />
            <Label htmlFor="email">Email</Label>
            <Input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
            <Label htmlFor="phone">Contact No</Label>
            <Input
              name="phone"
              type="number"
              placeholder="09342354312"
              required
              value={formData.phone}
              onChange={handleChange}
            />
            <Label htmlFor="location">Location</Label>
            <GoogleMapsPicker
              onChange={(location: string) =>
                setFormData((prev) => ({ ...prev, location }))
              }
            />
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              name="password"
              placeholder="Your password"
              minLength={6}
              required
              value={formData.password}
              onChange={handleChange}
            />

            <Button type="submit">Sign up</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
