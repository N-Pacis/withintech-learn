"use client";

import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
} from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState } from "react";
import { Toaster, toast } from "sonner";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error) => {
            toast.error(
              error instanceof Error ? error.message : "Something went wrong.",
            );
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: false,
          },
        },
      }),
  );

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          closeButton
          toastOptions={{
            style: {
              fontFamily: "var(--font-dm-sans)",
              fontSize: "14px",
              borderRadius: "12px",
            },
            classNames: {
              error: "border-red-200",
              success: "border-green-200",
            },
          }}
        />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
