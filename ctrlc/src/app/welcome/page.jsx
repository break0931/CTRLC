"use client"

import Image from "next/image";
import Container from "../components/Container";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import NextLogo from '../../../public/next.svg'
import { useSession } from "next-auth/react";
import { redirect , useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter()
    const { data: session  , status} = useSession();
    console.log("session " , session)

        // If session is still loading, show a loading state
        if (status === "loading") {
          return <div>Loading...</div>;
      }

         // If there is no session (user is not authenticated), redirect to login
    if (status === "unauthenticated") {
      router.replace("/login"); // Redirect to login page if not authenticated
      return null; // Prevent rendering the rest of the page
  }
    // if (!session)  router.replace('/');
    
  
  return (
    <main>
      <Container>
        {/* <Navbar session={session} /> */}
          <div className="flex-grow text-center p-10">
            <h3 className="text-5xl">Welcome, test volume  test volume2222 {session?.user?.name}</h3>
            <p className="text-2xl mt-3">Your email address: {session?.user?.email}</p>
            <p className="text-2xl mt-3">Your user role: {session?.user?.role}</p>
            <p className="text-2xl mt-3">Your user id: {session?.user?.id}</p>
          </div>
        {/* <Footer /> */}
      </Container>
    </main>
    
  );
}
