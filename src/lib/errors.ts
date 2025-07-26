import { toast } from "sonner";

export const handleApiError = (error: any, message="une erreur est survenue") => {
  const data = error?.response?.data;

  if (data && typeof data === "object") {
    Object.entries(data).forEach(([_, messages]) => {
      if (Array.isArray(messages)) {
        messages.forEach((msg) => toast.error(msg));
      } else {
        toast.error(message, {
            description: messages as string
          }
        );
      }
    });
  } else {
    toast.error("Une erreur est survenue.");
  }
};
