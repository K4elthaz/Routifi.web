import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { acceptInvite } from "@/api/organizationAPI";
import useAuthStore from "@/store/authStore";

type AcceptInviteResponse = {
  message: string;
  slug?: string; // ✅ Ensure this matches the API response
};

export default function AcceptInvite() {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken, isAuthenticated, checkAuth } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyAuthAndAcceptInvite = async () => {
      if (!accessToken) {
        await checkAuth();
        if (!isAuthenticated) {
          navigate(
            `/sign-in?redirect=${encodeURIComponent(location.pathname)}`
          );
          return;
        }
      }

      if (!inviteId) {
        setStatus("error");
        setMessage("Invalid invitation link.");
        return;
      }

      try {
        const response: AcceptInviteResponse = await acceptInvite(inviteId);
        console.log("API Response:", response); // 🔍 Log the API response

        if (!response.slug) {
          throw new Error("Organization slug is missing in response.");
        }

        setStatus("success");
        setMessage(response.message);
        setTimeout(() => navigate(`/org/${response.slug}`), 3000);
      } catch (error: any) {
        console.error("Error accepting invite:", error); // 🔍 Log the error for debugging
        if (error.error === "Token is missing") {
          navigate(
            `/sign-in?redirect=${encodeURIComponent(location.pathname)}`
          );
        } else {
          setStatus("error");
          setMessage(error?.error || "Failed to accept invitation.");
        }
      }
    };

    verifyAuthAndAcceptInvite();
  }, [
    inviteId,
    navigate,
    accessToken,
    isAuthenticated,
    checkAuth,
    location.pathname,
  ]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {status === "loading" && (
        <p className="text-gray-600">Accepting invite...</p>
      )}
      {status === "success" && <p className="text-green-600">{message}</p>}
      {status === "error" && <p className="text-red-600">{message}</p>}
    </div>
  );
}
