import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
          <div className="container px-4 md:px-6 flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">About GroupFinder</h1>
            <p className="md:text-xl text-muted-foreground max-w-[700px] mb-8">
              A simple tool to help you discover valuable Facebook groups for your interests and business.
            </p>
          </div>
        </section>

        {/* My Story */}
        <section className="py-16">
          <div className="container px-4 md:px-6 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why I Built This</h2>
              <p className="text-lg text-muted-foreground mb-8">
                As a business owner and solo developer, I struggled to find the right Facebook groups for networking and growth.
                I couldn't find a simple, reliable way to discover communities that actually mattered to me.
              </p>
              <p className="text-lg text-muted-foreground">
                So I built GroupFinder - a straightforward tool that helps people like you find valuable Facebook groups
                without the hassle of endless searching. It's built by one person who understands the frustration
                of trying to grow your network in the right places.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gray-50">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-bold mb-4 mx-auto">1</div>
                <h3 className="text-xl font-semibold mb-2">Search & Discover</h3>
                <p className="text-muted-foreground">
                  Use our simple search to find Facebook groups by keywords, categories, or location.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-bold mb-4 mx-auto">2</div>
                <h3 className="text-xl font-semibold mb-2">Join Communities</h3>
                <p className="text-muted-foreground">
                  Connect with groups that match your interests and start building meaningful relationships.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-bold mb-4 mx-auto">3</div>
                <h3 className="text-xl font-semibold mb-2">Share & Grow</h3>
                <p className="text-muted-foreground">
                  Submit groups you find valuable to help others discover great communities too.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Questions or Feedback?</h2>
            <p className="text-muted-foreground mb-8 max-w-[600px] mx-auto">
              I'm here to help! Whether you have suggestions, found a bug, or just want to say hi.
            </p>
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <span className="text-lg">hello@groupfinder.com</span>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to find your community?</h2>
            <p className="text-blue-100 mb-8 max-w-[600px] mx-auto">
              Start exploring groups or submit one you think others would find valuable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/discover">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100">
                  Explore Groups
                </Button>
              </Link>
              <Link href="/submit">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
                  Submit a Group
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
} 