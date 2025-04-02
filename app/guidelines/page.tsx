import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Community Guidelines</h1>
            <p className="text-muted-foreground mb-8">
              Our community guidelines help ensure Facebook Group Finder remains a helpful and respectful platform for all users. 
              Please review and follow these guidelines when using our service.
            </p>
            
            <div className="space-y-10">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Group Submission Guidelines</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">1. Accuracy</h3>
                    <p className="text-muted-foreground">
                      Provide accurate and up-to-date information when submitting groups. Ensure the group URL is correct and 
                      the description accurately represents the group's purpose and content.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">2. Relevance</h3>
                    <p className="text-muted-foreground">
                      Submit groups that provide value to our community. Groups should have a clear purpose and be relevant 
                      to the category they are submitted under.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">3. No Prohibited Content</h3>
                    <p className="text-muted-foreground">
                      Do not submit groups that contain or promote any of the following:
                    </p>
                    <ul className="list-disc ml-6 mt-2 text-muted-foreground">
                      <li>Illegal activities or content</li>
                      <li>Hate speech, discrimination, or harassment</li>
                      <li>Violent or graphic content</li>
                      <li>Misinformation or harmful conspiracies</li>
                      <li>Adult content not properly labeled or age-restricted</li>
                      <li>Spam, phishing, or scams</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">4. No Duplicate Submissions</h3>
                    <p className="text-muted-foreground">
                      Before submitting a group, check if it already exists in our directory to avoid duplicates.
                    </p>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Review and Rating Guidelines</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">1. Honesty</h3>
                    <p className="text-muted-foreground">
                      Provide honest and fair reviews based on your actual experience with the group.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">2. Constructive Feedback</h3>
                    <p className="text-muted-foreground">
                      Focus on constructive feedback that helps other users make informed decisions about 
                      joining the group. Explain your rating with specific examples.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">3. Respectful Language</h3>
                    <p className="text-muted-foreground">
                      Use respectful language in your reviews, even when providing criticism. 
                      Personal attacks, harassment, or inflammatory language is not allowed.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">4. No Conflict of Interest</h3>
                    <p className="text-muted-foreground">
                      Do not review groups where you have a conflict of interest (e.g., you are the admin 
                      or have a financial interest in the group).
                    </p>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">General User Conduct</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">1. Respect Others</h3>
                    <p className="text-muted-foreground">
                      Treat all members of our community with respect. Disagreements should be expressed 
                      constructively and civilly.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">2. No Misrepresentation</h3>
                    <p className="text-muted-foreground">
                      Do not impersonate others or misrepresent your identity or affiliation with any 
                      person or organization.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">3. Report Violations</h3>
                    <p className="text-muted-foreground">
                      If you encounter content that violates these guidelines, please report it to our 
                      moderation team.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">4. Comply with Laws</h3>
                    <p className="text-muted-foreground">
                      Comply with all applicable laws when using our platform. Do not use our service 
                      for any illegal purposes.
                    </p>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Consequences of Violations</h2>
                <p className="text-muted-foreground">
                  Violations of these guidelines may result in content removal, warnings, or in severe or 
                  repeated cases, account suspension or termination. Our moderation team has the final say 
                  in interpreting and enforcing these guidelines.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Changes to Guidelines</h2>
                <p className="text-muted-foreground">
                  These guidelines may be updated from time to time. Significant changes will be communicated 
                  to users through our website or via email.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have questions about these guidelines or want to report a violation, 
                  please contact our support team at <span className="font-medium">support@fbgroupfinder.com</span>.
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