import { redirect } from "next/navigation";

// On arrive ici depuis « Espace pro » sur revade.fr : direction la connexion.
export default function Home() {
  redirect("/connexion");
}
