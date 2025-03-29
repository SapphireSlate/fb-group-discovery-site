import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import Image from "next/image"

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
              Discover meaningful connections and communities that align with your interests and passions.
            </p>
          </div>
        </section>

        {/* Our Mission */}
        <section className="py-16">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground mb-6">
                  At GroupFinder, we believe that everyone deserves to find their perfect community. Our mission is to connect people with Facebook groups that align with their interests, values, and goals.
                </p>
                <p className="text-muted-foreground mb-6">
                  We aim to make the process of discovering relevant communities as seamless and intuitive as possible, helping people forge meaningful connections and build relationships with like-minded individuals.
                </p>
                <p className="text-muted-foreground">
                  Our platform is designed to be a comprehensive directory of valuable Facebook groups across various categories, curated by our community members who share groups they find helpful and engaging.
                </p>
              </div>
              <div className="md:w-1/2 relative h-64 md:h-96 w-full">
                <Image src="/placeholder.svg?width=600&height=400&text=Our+Mission" alt="Our Mission" fill className="object-cover rounded-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gray-50">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-bold mb-4">1</div>
                <h3 className="text-xl font-semibold mb-2">Discover</h3>
                <p className="text-muted-foreground">
                  Browse through our extensive directory of Facebook groups categorized by interests, topics, and activities.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-bold mb-4">2</div>
                <h3 className="text-xl font-semibold mb-2">Connect</h3>
                <p className="text-muted-foreground">
                  Join groups that resonate with you and connect with communities that share your interests and passions.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-bold mb-4">3</div>
                <h3 className="text-xl font-semibold mb-2">Contribute</h3>
                <p className="text-muted-foreground">
                  Submit groups that you find valuable to help others discover great communities, and rate groups based on your experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="py-16">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: "Alex Johnson", role: "Founder & CEO", image: "/placeholder.svg?width=150&height=150&text=AJ" },
                { name: "Sarah Williams", role: "Head of Community", image: "/placeholder.svg?width=150&height=150&text=SW" },
                { name: "Michael Chen", role: "Lead Developer", image: "/placeholder.svg?width=150&height=150&text=MC" },
                { name: "Jessica Taylor", role: "Marketing Director", image: "/placeholder.svg?width=150&height=150&text=JT" },
              ].map((member, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="mb-4 relative w-32 h-32 rounded-full overflow-hidden">
                    <Image src={member.image} alt={member.name} fill className="object-cover" />
                  </div>
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact and FAQs */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Is GroupFinder free to use?</h3>
                    <p className="text-blue-100">
                      Yes, GroupFinder is completely free for users to discover and join Facebook groups.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">How can I submit a group?</h3>
                    <p className="text-blue-100">
                      You can submit a group by clicking on the "Submit Group" button in the navigation menu and filling out the submission form.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">How are groups verified?</h3>
                    <p className="text-blue-100">
                      Our team reviews all submitted groups to ensure they meet our community guidelines and provide value to our users.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
                <p className="text-blue-100 mb-8">
                  Have questions, feedback, or suggestions? We'd love to hear from you! Reach out to our team using the contact information below.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
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
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
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
                    <span>contact@groupfinder.com</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
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
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <span>123 Community Ave, San Francisco, CA 94158</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to find your community?</h2>
            <p className="text-muted-foreground mb-8 max-w-[600px] mx-auto">
              Start exploring groups or contribute by sharing valuable communities with others.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/discover">
                <Button size="lg" className="w-full sm:w-auto">Explore Groups</Button>
              </Link>
              <Link href="/submit">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">Submit a Group</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
} 