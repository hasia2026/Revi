import { redirect } from "next/navigation";

// Website Builder moved under Brand Studio as part of the CUE
// reorganization — Brand Studio is responsible for the company's identity,
// and the website is generated from that identity, not a standalone tool.
export default function WebsiteRedirect() {
  redirect("/brand-studio/website");
}
