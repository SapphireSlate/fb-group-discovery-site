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
                  At Facebook Group Finder ("we," "our," or "us"), we respect your privacy and are committed to protecting 
                  your personal data. This privacy policy explains how we collect, use, and safeguard your information when 
                  you use our website and services.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                <p className="text-muted-foreground mb-4">
                  We collect several types of information from and about users of our website, including:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                  <li>
                    <strong>Personal Information:</strong> This includes your name, email address, and profile information 
                    that you provide when creating an account.
                  </li>
                  <li>
                    <strong>User Content:</strong> Information you provide when submitting groups, writing reviews, 
                    or interacting with our platform.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Information about how you use our website, such as the pages you visit, 
                    the time spent on those pages, and the links you click.
                  </li>
                  <li>
                    <strong>Technical Data:</strong> IP address, browser type and version, device information, and other 
                    technical details about your device and internet connection.
                  </li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">How We Collect Information</h2>
                <p className="text-muted-foreground mb-4">
                  We collect information through:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                  <li>Direct interactions when you register, submit content, or communicate with us</li>
                  <li>Automated technologies such as cookies and similar tracking technologies</li>
                  <li>Third-party services and sources (such as authentication providers)</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                <p className="text-muted-foreground mb-4">
                  We use your information for the following purposes:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                  <li>To create and manage your account</li>
                  <li>To provide and improve our services</li>
                  <li>To respond to your inquiries and support requests</li>
                  <li>To personalize your experience on our platform</li>
                  <li>To send you updates and information about our services</li>
                  <li>To ensure the security and integrity of our platform</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground mb-4">
                  We use cookies and similar tracking technologies to collect information about your browsing activities. 
                  These technologies help us analyze website traffic, personalize content, and improve your experience.
                </p>
                <p className="text-muted-foreground">
                  You can set your browser to refuse all or some browser cookies or to alert you when websites set or access 
                  cookies. If you disable or refuse cookies, please note that some parts of the website may become inaccessible 
                  or not function properly.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
                <p className="text-muted-foreground mb-4">
                  We may share your information with:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                  <li>
                    <strong>Service Providers:</strong> Third-party vendors who perform services on our behalf, such as 
                    hosting, data analysis, and customer service.
                  </li>
                  <li>
                    <strong>Business Partners:</strong> We may share information with trusted partners to help us perform 
                    statistical analysis, send you email or postal mail, or provide customer support.
                  </li>
                  <li>
                    <strong>Legal Compliance:</strong> We may disclose information if required to do so by law or in response 
                    to valid requests by public authorities.
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In the event of a merger, acquisition, or asset sale, your personal 
                    information may be transferred as a business asset.
                  </li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
                <p className="text-muted-foreground">
                  We implement appropriate security measures to protect your personal information from unauthorized access, 
                  alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic 
                  storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
                <p className="text-muted-foreground mb-4">
                  Depending on your location, you may have certain rights regarding your personal data, including:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                  <li>The right to access your personal data</li>
                  <li>The right to correct inaccurate or incomplete data</li>
                  <li>The right to request deletion of your personal data</li>
                  <li>The right to restrict or object to processing of your data</li>
                  <li>The right to data portability</li>
                  <li>The right to withdraw consent</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  To exercise any of these rights, please contact us at the information provided at the end of this policy.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Our services are not intended for individuals under the age of 16. We do not knowingly collect personal 
                  information from children. If we learn that we have collected personal information from a child, we will 
                  take steps to delete that information as soon as possible.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground">
                  We may update our privacy policy from time to time. Any changes will be posted on this page with a revised 
                  "last updated" date. We encourage you to review this privacy policy periodically for any changes.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions or concerns about this privacy policy or our data practices, please contact us at:
                </p>
                <div className="mt-4">
                  <p className="font-medium">Email: privacy@fbgroupfinder.com</p>
                  <p className="font-medium">Address: 123 Community Ave, Suite 200, San Francisco, CA 94158</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 