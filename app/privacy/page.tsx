import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                <p className="text-muted-foreground">
                  This Privacy Policy explains how GroupFinder collects, uses, and protects your information when you use this service. 
                  This is a personal project designed to help people discover Facebook groups.
                </p>
                <p className="text-muted-foreground mt-4">
                  Your privacy is important. This policy explains what information we collect and how we use it.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                <p className="text-muted-foreground mb-4">
                  We may collect the following types of information:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                  <li>
                    <strong>Account Information:</strong> If you create an account, we collect your email address and any profile information you provide
                  </li>
                  <li>
                    <strong>Usage Information:</strong> We may collect information about how you use the service, such as which groups you view or search for
                  </li>
                  <li>
                    <strong>Technical Information:</strong> Basic technical information like your IP address, browser type, and device information
                  </li>
                  <li>
                    <strong>Group Submissions:</strong> If you submit group information, we store that content
                  </li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                <p className="text-muted-foreground mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                  <li>Provide and improve the service</li>
                  <li>Show you relevant group recommendations</li>
                  <li>Communicate with you about your account</li>
                  <li>Prevent spam and abuse</li>
                  <li>Analyze how the service is used to make improvements</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
                <p className="text-muted-foreground mb-4">
                  We don't sell your personal information. We may share information in these limited situations:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                  <li>
                    <strong>Service Providers:</strong> We may use third-party services for hosting, analytics, or other technical services
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> We may share information if required by law or to protect the service
                  </li>
                  <li>
                    <strong>Public Content:</strong> Group information you submit may be displayed publicly on the service
                  </li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
                <p className="text-muted-foreground">
                  We take reasonable measures to protect your information from unauthorized access, use, or disclosure. 
                  However, no internet transmission is completely secure, so we cannot guarantee absolute security.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
                <p className="text-muted-foreground mb-4">
                  You have certain rights regarding your personal information:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                  <li>Access and review your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of certain communications</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
                <p className="text-muted-foreground">
                  We may use cookies and similar technologies to improve your experience on the service. 
                  You can control cookie settings through your browser preferences.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
                <p className="text-muted-foreground">
                  This service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact</h2>
                <p className="text-muted-foreground">
                  If you have questions about this Privacy Policy, please contact us at: support@groupfinder.app
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