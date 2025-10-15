import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-muted-foreground mb-8">
              Find answers to common questions and learn how to make the most of the Facebook Group Finder platform.
            </p>

            <Tabs defaultValue="getting-started" className="mt-8">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="groups">Groups</TabsTrigger>
                <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
              </TabsList>
              
              <TabsContent value="getting-started" className="pt-6">
                <div className="space-y-6">
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-xl font-medium mb-3">What is Facebook Group Finder?</h3>
                    <p className="text-muted-foreground">
                      Facebook Group Finder is a platform that helps you discover, rate, and share Facebook groups. 
                      Our directory includes groups across various categories, making it easier to find communities 
                      that match your interests.
                    </p>
                  </div>
                  
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-xl font-medium mb-3">How do I search for groups?</h3>
                    <p className="text-muted-foreground mb-4">
                      You can search for groups in several ways:
                    </p>
                    <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                      <li>Use the search bar at the top of the page to search by keywords</li>
                      <li>Browse groups by category using the <Link href="/categories" className="text-primary hover:underline">Categories</Link> page</li>
                      <li>Explore <Link href="/trending" className="text-primary hover:underline">Trending</Link> or <Link href="/new" className="text-primary hover:underline">New</Link> groups</li>
                      <li>Use filters on the <Link href="/discover" className="text-primary hover:underline">Discover</Link> page to narrow down results by activity level, tags, etc.</li>
                    </ul>
                  </div>
                  
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-xl font-medium mb-3">Do I need an account to use Facebook Group Finder?</h3>
                    <p className="text-muted-foreground">
                      You can browse and search for groups without an account. However, you'll need to create an account 
                      to submit new groups, leave reviews, or upvote/downvote groups.
                    </p>
                  </div>
                  
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-xl font-medium mb-3">Is Facebook Group Finder affiliated with Facebook?</h3>
                    <p className="text-muted-foreground">
                      No, Facebook Group Finder is not affiliated with, endorsed by, or connected to Facebook in any way. 
                      We are an independent directory service that helps users discover Facebook groups.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="account" className="pt-6">
                <div className="space-y-6">
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-xl font-medium mb-3">How do I create an account?</h3>
                    <p className="text-muted-foreground mb-4">
                      To create an account:
                    </p>
                    <ol className="list-decimal ml-6 space-y-2 text-muted-foreground">
                      <li>Click "Sign Up" in the top navigation bar</li>
                      <li>Enter your email address</li>
                      <li>Create a password</li>
                      <li>Verify your email address by clicking the link in the verification email</li>
                    </ol>
                  </div>
                  
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-xl font-medium mb-3">How do I update my profile information?</h3>
                    <p className="text-muted-foreground">
                      After logging in, go to your <Link href="/profile" className="text-primary hover:underline">Profile</Link> page. 
                      There you can update your display name, profile picture, and other account settings.
                    </p>
                  </div>
                  
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-xl font-medium mb-3">I forgot my password. How do I reset it?</h3>
                    <p className="text-muted-foreground">
                      On the login page, click "Forgot password?" and follow the instructions to reset your password through your email.
                    </p>
                  </div>
                  
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-xl font-medium mb-3">How do I delete my account?</h3>
                    <p className="text-muted-foreground">
                      To delete your account, go to your Profile, navigate to the "Account" tab, and click "Delete Account". 
                      Please note that this action cannot be undone, and your contributions will be anonymized.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="groups" className="pt-6">
                <div className="space-y-6">
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-xl font-medium mb-3">How do I submit a new group?</h3>
                    <p className="text-muted-foreground mb-4">
                      To submit a new group:
                    </p>
                    <ol className="list-decimal ml-6 space-y-2 text-muted-foreground">
                      <li>Log in to your account</li>
                      <li>Click "Submit Group" in the navigation menu</li>
                      <li>Fill out the submission form with the group details</li>
                      <li>Review and submit</li>
                    </ol>
                    <p className="text-muted-foreground mt-4">
                      Your submission will be reviewed before being added to the directory.
                    </p>
                  </div>
                  
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-xl font-medium mb-3">How do I rate or review a group?</h3>
                    <p className="text-muted-foreground">
                      Navigate to any group page and scroll down to the Reviews section. If you're logged in, 
                      you'll see a form to submit your rating (1-5 stars) and write a review.
                    </p>
                  </div>
                  
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-xl font-medium mb-3">What do the upvote and downvote buttons do?</h3>
                    <p className="text-muted-foreground">
                      Upvoting a group indicates you find it valuable, while downvoting suggests it's not helpful. 
                      These votes help determine group rankings and visibility on the platform.
                    </p>
                  </div>
                  
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-xl font-medium mb-3">How do I report an inappropriate group?</h3>
                    <p className="text-muted-foreground">
                      On any group page, click the "Report" button and select the reason for reporting. 
                      Our moderation team will review the report and take appropriate action.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="troubleshooting" className="pt-6">
                <div className="space-y-6">
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-xl font-medium mb-3">I'm having trouble logging in. What should I do?</h3>
                    <p className="text-muted-foreground mb-4">
                      If you're having login issues:
                    </p>
                    <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                      <li>Make sure you're using the correct email and password</li>
                      <li>Try resetting your password</li>
                      <li>Check if your email has been verified</li>
                      <li>Clear your browser cookies and cache, then try again</li>
                    </ul>
                  </div>
                  
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-xl font-medium mb-3">Why wasn't my group submission approved?</h3>
                    <p className="text-muted-foreground">
                      Group submissions may be rejected if they violate our <Link href="/guidelines" className="text-primary hover:underline">Community Guidelines</Link>, 
                      contain inaccurate information, or duplicate an existing entry. Check your email for specific reasons 
                      if your submission was rejected.
                    </p>
                  </div>
                  
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-xl font-medium mb-3">The group link isn't working. What should I do?</h3>
                    <p className="text-muted-foreground">
                      If a group link doesn't work, the group may have been deleted, renamed, or set to private by the 
                      Facebook group admin. You can report the broken link using the "Report" button on the group page.
                    </p>
                  </div>
                  
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-xl font-medium mb-3">I have a feature request or found a bug. Where can I report it?</h3>
                    <p className="text-muted-foreground">
                      We appreciate your feedback! Please contact us at <span className="font-medium">hello@groupfinder.com</span> with
                      details about your feature request or the bug you encountered.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
              <p className="text-muted-foreground mb-6">
                If you couldn't find an answer to your question, our support team is here to help.
              </p>
              <Link href="/contact">
                <Button size="lg" className="rounded-full px-8">Contact Support</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 