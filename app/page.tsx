import { RecipeBrowser } from "@/components/recipe-browser"
import { Header } from "@/components/header"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <RecipeBrowser />
      </main>
    </div>
  )
}
