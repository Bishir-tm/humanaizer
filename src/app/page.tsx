import { BrainCircuit } from "lucide-react";
import HumanizerClientPage from "./humanizer-client-page";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-2">
           <BrainCircuit className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Human<span className="text-primary">AI</span>zer
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <HumanizerClientPage />
      </main>
    </div>
  );
}
