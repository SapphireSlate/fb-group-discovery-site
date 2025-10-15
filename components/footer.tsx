import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="rounded-full bg-primary w-8 h-8 flex items-center justify-center text-primary-foreground font-bold mr-2">
                G
              </div>
              <span className="text-xl font-bold">GroupFinder</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Discover and join Facebook groups that match your interests and connect with like-minded people.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GroupFinder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

