import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CoursesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-12 px-4">
        <section className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Our Courses</h1>
          <p className="text-xl text-muted-foreground">
            Explore our AI-assisted learning courses designed to enhance your knowledge and skills.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Featured Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCourses.map((course, index) => (
              <Card key={index} className="overflow-hidden border-border hover:shadow-md transition-shadow">
                <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <div className="text-white text-4xl font-bold">{course.icon}</div>
                </div>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{course.level}</span>
                    <span className="text-muted-foreground">{course.duration}</span>
                  </div>
                  <Button className="w-full">Start Learning</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">How Our Courses Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-muted rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to expand your knowledge?</h2>
          <p className="mb-6 text-muted-foreground max-w-xl mx-auto">
            Our AI assistant is ready to guide you through any course. Start learning at your own pace today.
          </p>
          <Link href="/">
            <Button size="lg">Try Our AI Chat</Button>
          </Link>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

const featuredCourses = [
  {
    icon: "π",
    title: "Mathematics Fundamentals",
    description: "Master key mathematical concepts with personalized AI guidance",
    level: "Beginner to Intermediate",
    duration: "Self-paced"
  },
  {
    icon: "🧠",
    title: "Introduction to AI",
    description: "Learn the basics of artificial intelligence and machine learning",
    level: "Beginner",
    duration: "Self-paced"
  },
  {
    icon: "💻",
    title: "Coding Essentials",
    description: "Build programming skills with interactive coding challenges",
    level: "Beginner",
    duration: "Self-paced"
  }
];

const steps = [
  {
    title: "Select a Course",
    description: "Browse our catalog and choose a course that matches your interests and goals."
  },
  {
    title: "Learn with AI",
    description: "Our AI assistant guides you through concepts and answers your questions in real-time."
  },
  {
    title: "Practice & Master",
    description: "Reinforce your learning with interactive exercises and get immediate feedback."
  }
]; 