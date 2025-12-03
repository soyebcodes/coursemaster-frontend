import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Welcome to CourseMaster
          </h1>
          <p className="text-lg sm:text-xl mb-8 text-blue-100">
            Learn from the best instructors and advance your skills with our
            comprehensive online courses
          </p>
          <Link href="/courses">
            <Button size="lg" variant="secondary" className="rounded-lg">
              Explore Courses
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">Why Choose CourseMaster?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border border-neutral-200 rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Quality Courses</h3>
            <p className="text-neutral-600">
              Curated courses from expert instructors covering various topics
            </p>
          </div>
          <div className="p-6 border border-neutral-200 rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Learn at Your Pace</h3>
            <p className="text-neutral-600">
              Study anytime, anywhere at your own pace with lifetime access
            </p>
          </div>
          <div className="p-6 border border-neutral-200 rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Get Certified</h3>
            <p className="text-neutral-600">
              Earn certificates upon completion to boost your career
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-neutral-100 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-neutral-600 mb-8">
            Join thousands of students already learning on CourseMaster
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg" variant="default" className="rounded-lg">
                Browse Courses
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="rounded-lg">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
