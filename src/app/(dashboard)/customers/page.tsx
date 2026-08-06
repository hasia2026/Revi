import { redirect } from "next/navigation";

// Customers is a nav grouping (Leads + Conversations), not a page of its
// own — landing here goes to Leads by default.
export default function CustomersIndex() {
  redirect("/leads");
}
