import { redirect } from 'next/navigation';

// Root page — redirect to sign-in
// If already authenticated, the (app) layout handles redirect to /dashboard
export default function RootPage() {
  redirect('/sign-in');
}
