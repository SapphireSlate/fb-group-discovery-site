import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-muted-foreground mb-8">
              Find answers to the most commonly asked questions about using Facebook Group Finder.
            </p>
            
            <div className="space-y-10">
              <section>
                <h2 className="text-2xl font-semibold mb-4">About the Platform</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="what-is-fbgf">
                    <AccordionTrigger>What is Facebook Group Finder?</AccordionTrigger>
                    <AccordionContent>
                      Facebook Group Finder is a directory platform that helps users discover, rate, and share Facebook 
                      groups. We curate groups across various categories to help you find communities that align with 
                      your interests, professional needs, or hobbies.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="affiliated-with-facebook">
                    <AccordionTrigger>Is this site affiliated with Facebook?</AccordionTrigger>
                    <AccordionContent>
                      No, Facebook Group Finder is not affiliated with, endorsed by, or connected to Facebook 
                      (Meta) in any way. We are an independent platform that helps users discover Facebook groups.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="cost">
                    <AccordionTrigger>Is it free to use Facebook Group Finder?</AccordionTrigger>
                    <AccordionContent>
                      Yes, Facebook Group Finder is completely free for basic usage, including searching for 
                      groups, viewing group details, and creating an account. We may introduce premium features 
                      in the future, but core functionality will remain free.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Account & Registration</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="need-account">
                    <AccordionTrigger>Do I need an account to use the platform?</AccordionTrigger>
                    <AccordionContent>
                      You can browse and search for groups without an account. However, you'll need to create an 
                      account to submit new groups, leave reviews, rate groups, or upvote/downvote content.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="create-account">
                    <AccordionTrigger>How do I create an account?</AccordionTrigger>
                    <AccordionContent>
                      To create an account, click the "Sign Up" button in the navigation bar. You can register with your 
                      email address and a password. After registration, you'll need to verify your email address by 
                      clicking on the link sent to your inbox.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="forgot-password">
                    <AccordionTrigger>I forgot my password. How do I reset it?</AccordionTrigger>
                    <AccordionContent>
                      On the login page, click the "Forgot password?" link. Enter your email address, and we'll 
                      send you instructions to reset your password. Follow the link in the email to create a new password.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="delete-account">
                    <AccordionTrigger>How do I delete my account?</AccordionTrigger>
                    <AccordionContent>
                      To delete your account, go to your Profile page, navigate to the "Account" tab, and click the 
                      "Delete Account" button. Please note that while your personal information will be deleted, your 
                      contributions (such as group submissions) will remain but be anonymized.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Finding & Joining Groups</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="find-groups">
                    <AccordionTrigger>How do I find groups on the platform?</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">You can find groups in several ways:</p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Use the search bar to search by keywords</li>
                        <li>Browse by categories on the Categories page</li>
                        <li>Check out Trending or New groups</li>
                        <li>Use filters on the Discover page to narrow down results</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="join-groups">
                    <AccordionTrigger>How do I join a Facebook group?</AccordionTrigger>
                    <AccordionContent>
                      When you find a group you're interested in, click on the group card to view details. 
                      On the group detail page, click the "Join Group" button, which will take you to the 
                      Facebook group page. From there, you'll need to follow Facebook's process to request 
                      to join the group.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="private-groups">
                    <AccordionTrigger>Can I see private Facebook groups?</AccordionTrigger>
                    <AccordionContent>
                      We list both public and private Facebook groups in our directory. However, private groups require 
                      approval from the group administrators on Facebook. Our platform simply directs you to the group 
                      on Facebook where you can request to join.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Submitting & Rating Groups</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="submit-group">
                    <AccordionTrigger>How do I submit a new group?</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">To submit a new group:</p>
                      <ol className="list-decimal ml-6 space-y-1">
                        <li>Log in to your account</li>
                        <li>Click "Submit Group" in the navigation menu</li>
                        <li>Fill out the form with the required information</li>
                        <li>Add optional details like group size and a screenshot</li>
                        <li>Submit for review</li>
                      </ol>
                      <p className="mt-2">Your submission will be reviewed before adding it to the directory.</p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="review-criteria">
                    <AccordionTrigger>What criteria do you use to approve groups?</AccordionTrigger>
                    <AccordionContent>
                      We review submissions to ensure they meet our community guidelines. Groups must be legitimate, 
                      active Facebook groups that provide value to users. We don't approve groups that contain prohibited 
                      content (e.g., spam, illegal activities, hate speech) or that duplicate existing entries.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="rate-group">
                    <AccordionTrigger>How do I rate or review a group?</AccordionTrigger>
                    <AccordionContent>
                      Navigate to any group page and scroll down to the Reviews section. If you're logged in, 
                      you'll see a form to submit your rating (1-5 stars) and write a detailed review about your 
                      experience with the group.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="edit-review">
                    <AccordionTrigger>Can I edit or delete my review?</AccordionTrigger>
                    <AccordionContent>
                      Yes, you can edit or delete your reviews. Go to the group page where you left the review, 
                      find your review in the list, and use the edit or delete options available to you as the author.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Troubleshooting</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="broken-link">
                    <AccordionTrigger>What if a group link isn't working?</AccordionTrigger>
                    <AccordionContent>
                      If you encounter a broken link, the Facebook group may have been deleted, renamed, or had its 
                      privacy settings changed. Please report the broken link using the "Report" button on the group 
                      page so our team can investigate.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="report-inappropriate">
                    <AccordionTrigger>How do I report inappropriate content?</AccordionTrigger>
                    <AccordionContent>
                      If you find a group or review that violates our community guidelines, click the "Report" 
                      button available on the respective page and provide details about the issue.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="more-help">
                    <AccordionTrigger>Where can I get more help?</AccordionTrigger>
                    <AccordionContent>
                      If you have questions that aren't answered here, please visit our <Link href="/help" className="text-primary hover:underline">Help Center</Link> for 
                      more detailed information or contact us at <span className="font-medium">hello@groupfinder.com</span>.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 