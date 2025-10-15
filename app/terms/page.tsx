import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-muted-foreground">
              Last updated: April 12, 2025
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground">
                  Welcome to GroupFinder. These Terms of Service govern your use of this website and service. 
                  This is a personal project created to help people discover Facebook groups that match their interests.
                </p>
                <p className="text-muted-foreground">
                  By using this service, you agree to these terms. If you don't agree with any part of these terms, 
                  please don't use the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. What This Service Does</h2>
                <p className="text-muted-foreground">
                  GroupFinder helps you discover Facebook groups based on your interests. You can browse groups by category, 
                  search for specific topics, and get recommendations. This service is provided as-is for informational purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Your Account</h2>
                <p className="text-muted-foreground mb-4">
                  If you create an account, you agree to:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                  <li>Provide accurate information</li>
                  <li>Keep your password secure</li>
                  <li>Be responsible for all activity on your account</li>
                  <li>Let us know if someone else is using your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Your Content</h2>
                <p className="text-muted-foreground mb-4">
                  If you submit group information or other content, you're responsible for making sure it's accurate and legal. 
                  By submitting content, you give us permission to display it on the service.
                </p>
                <p className="text-muted-foreground">
                  You keep ownership of any content you submit.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. What You Can't Do</h2>
                <p className="text-muted-foreground mb-4">
                  Please don't:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                  <li>Break any laws</li>
                  <li>Submit false or misleading information</li>
                  <li>Spam or send unwanted messages</li>
                  <li>Try to hack or break the service</li>
                  <li>Harass other users</li>
                  <li>Pretend to be someone else</li>
                  <li>Collect other users' personal information</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  The service and its content are provided for informational purposes. Facebook group information comes from 
                  public sources. Facebook is a trademark of Meta Platforms, Inc.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Third-Party Links</h2>
                <p className="text-muted-foreground">
                  This service may contain links to Facebook groups and other websites. We're not responsible for the content 
                  or practices of these external sites.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Disclaimers</h2>
                <p className="text-muted-foreground mb-4">
                  This service is provided "as is" without any warranties. We don't guarantee that:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                  <li>The service will always be available or error-free</li>
                  <li>All group information is current or accurate</li>
                  <li>You'll be accepted into any groups you find</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  This is a free service provided as-is. We're not liable for any damages that might result from using 
                  the service. Use it at your own risk.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Changes to These Terms</h2>
                <p className="text-muted-foreground">
                  We may update these terms from time to time. If we make significant changes, we'll post the updated 
                  terms here with a new "last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
                <p className="text-muted-foreground">
                  If you have questions about these terms, you can contact us at: support@groupfinder.com
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}