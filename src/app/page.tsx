import { redirect } from "next/navigation";

// Default page component that redirects to the default locale
export default function RootPage() {
  redirect("/pt"); // Redirect to default language
}
