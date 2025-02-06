import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Link } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { CreateOrgForm } from "@/components/landing/create-org";

export default function Index() {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 gap-12">
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-16 w-full max-w-7xl">
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
          <img
            src="/logo.png"
            alt="Career success illustration"
            width={200}
            height={200}
          />
        </div>

        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <div>
            <h1 className="text-3xl lg:text-4xl text-center font-bold text-foreground mb-4">
              Empowering Your Path to Professional Success
            </h1>
            <p className="text-muted-foreground mb-8 text-justify">
              At the Routify Coaching Academy, we specialize in unlocking the
              career potential within you. Whether you&lsquo;re a student, a
              veteran, or an adult seeking a career transition, our personalized
              coaching approach is designed to align your passions with a
              fulfilling career.
            </p>
          </div>

          {user ? (
            <div className="flex flex-col gap-2 items-center justify-center">
              <div className="flex w-full lg:max-w-md justify-center gap-2">
                <ModeToggle />
                <div className="flex gap-2 justify-center items-center">
                  <CreateOrgForm />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start lg:items-center gap-2">
              <div className="flex justify-center lg:justify-center items-end gap-2 w-full lg:max-w-md">
                <Button asChild size="sm" variant="outline">
                  <Link to="/sign-in">Sign in</Link>
                </Button>
                <Button asChild size="sm" variant="default">
                  <Link to="/sign-up">Sign up</Link>
                </Button>
                <ModeToggle />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
