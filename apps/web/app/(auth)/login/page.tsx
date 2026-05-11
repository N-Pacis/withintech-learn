import { redirect } from "next/navigation";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; returnTo?: string; path?: string };
}) {
  const params = new URLSearchParams();
  if (searchParams.next) params.set("next", searchParams.next);
  if (searchParams.returnTo) params.set("returnTo", searchParams.returnTo);
  if (searchParams.path) params.set("path", searchParams.path);
  const qs = params.size ? `?${params.toString()}` : "";
  redirect(`/sign-in${qs}`);
}
