import { BrainCircuit } from "lucide-react";
import HumanizerClientPage from "./humanizer-client-page";

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background dark:bg-slate-950">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <div className="flex items-center gap-2">
           <BrainCircuit className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Human<span className="text-primary">AI</span>zer
          </h1>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <HumanizerClientPage />
      </main>
    </div>
  );
}
