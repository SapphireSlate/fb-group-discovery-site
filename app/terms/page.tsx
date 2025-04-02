import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground">
                  Welcome to Facebook Group Finder. These Terms of Service ("Terms") govern your access to and use of 
                  our website, services, and applications (collectively, the "Services"). By accessing or using our Services, 
                  you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the Services.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
                <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                  <li>
                    <strong>"We," "our," or "us"</strong> refers to Facebook Group Finder, the operator of this website.
                  </li>
                  <li>
                    <strong>"You" or "your"</strong> refers to the individual or entity accessing or using our Services.
                  </li>
                  <li>
                    <strong>"Content"</strong> refers to any information, text, graphics, photos, or other materials 
                    uploaded, downloaded, or appearing on our Services.
                  </li>
                  <li>
                    <strong>"User Content"</strong> refers to any Content that users submit, post, or display on our Services.
                  </li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Account Registration and Security</h2>
                <p className="text-muted-foreground mb-4">
                  To access certain features of our Services, you may need to create an account. When creating an account, you agree to:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Be responsible for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
                <p className="text-muted-foreground mb-4">
                  Our Services allow you to submit, post, and share User Content, such as group submissions, reviews, 
                  and comments. By submitting User Content, you:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                  <li>
                    Grant us a non-exclusive, transferable, sub-licensable, royalty-free, worldwide license to use, 
                    copy, modify, create derivative works based on, distribute, and display your User Content in connection 
                    with the operation of our Services.
                  </li>
                  <li>
                    Represent and warrant that you own or have all necessary rights to submit such User Content and that 
                    it does not violate any third-party rights or applicable laws.
                  </li>
                  <li>
                    Understand that we do not endorse any User Content and are not responsible for its accuracy, 
                    completeness, or legality.
                  </li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Prohibited Conduct</h2>
                <p className="text-muted-foreground mb-4">
                  You agree not to engage in any of the following prohibited activities:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                  <li>Violating any laws, regulations, or third-party rights</li>
                  <li>Submitting false, misleading, or inaccurate information</li>
                  <li>Impersonating any person or entity</li>
                  <li>Harassing, threatening, or intimidating other users</li>
                  <li>Posting or transmitting harmful, offensive, or inappropriate content</li>
                  <li>Attempting to gain unauthorized access to our Services or systems</li>
                  <li>Using our Services for any commercial purposes without our consent</li>
                  <li>Interfering with or disrupting our Services or servers</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
                <p className="text-muted-foreground mb-4">
                  Unless otherwise stated, the Services and all content and materials on the Services are our property 
                  or the property of our licensors and are protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p className="text-muted-foreground">
                  You may not use, reproduce, distribute, modify, create derivative works of, publicly display, or 
                  exploit any content from our Services without our express prior written permission, except as expressly 
                  permitted by these Terms.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Third-Party Links and Content</h2>
                <p className="text-muted-foreground">
                  Our Services may contain links to third-party websites, services, or resources that are not owned or 
                  controlled by us. We are not responsible for the content, policies, or practices of any third-party 
                  websites or services. You acknowledge and agree that we are not liable for any damage or loss caused 
                  by your use of or reliance on any third-party content, goods, or services.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
                <p className="text-muted-foreground">
                  We reserve the right to suspend or terminate your access to our Services at any time, with or without 
                  cause, and with or without notice. Upon termination, your right to use the Services will immediately cease, 
                  but all provisions of these Terms which by their nature should survive termination shall survive.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Disclaimers</h2>
                <p className="text-muted-foreground mb-4">
                  THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
                  INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
                  AND NON-INFRINGEMENT.
                </p>
                <p className="text-muted-foreground">
                  We do not warrant that the Services will be uninterrupted or error-free, that defects will be corrected, 
                  or that the Services or the servers that make them available are free of viruses or other harmful components.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL WE, OUR AFFILIATES, DIRECTORS, 
                  EMPLOYEES, OR LICENSORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR 
                  EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO, DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA OR 
                  OTHER INTANGIBLE LOSSES (EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES), RESULTING FROM: 
                  (i) THE USE OR INABILITY TO USE THE SERVICES; (ii) UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR TRANSMISSIONS 
                  OR DATA; (iii) STATEMENTS OR CONDUCT OF ANY THIRD PARTY ON THE SERVICES; OR (iv) ANY OTHER MATTER RELATING 
                  TO THE SERVICES.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
                <p className="text-muted-foreground">
                  You agree to defend, indemnify, and hold harmless us, our affiliates, and their respective directors, 
                  officers, employees, and agents from and against any and all claims, damages, obligations, losses, 
                  liabilities, costs or debt, and expenses (including but not limited to attorney's fees) arising from: 
                  (i) your use of and access to the Services; (ii) your violation of any term of these Terms; (iii) your 
                  violation of any third-party right, including without limitation any copyright, property, or privacy right; 
                  or (iv) any claim that your User Content caused damage to a third party.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify or replace these Terms at any time. The most current version will always be 
                  posted on our website. By continuing to access or use our Services after any revisions become effective, 
                  you agree to be bound by the revised Terms.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
                <p className="text-muted-foreground">
                  These Terms shall be governed and construed in accordance with the laws of the State of California, 
                  without regard to its conflict of law provisions. Any dispute arising from or relating to these Terms 
                  or your use of the Services shall be subject to the exclusive jurisdiction of the state and federal 
                  courts located in San Francisco County, California.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms, please contact us at: 
                  <Link href="/contact" className="text-primary hover:underline ml-1">Contact Us</Link>
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