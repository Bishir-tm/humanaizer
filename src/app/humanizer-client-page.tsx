"use client";

import { useState, useTransition } from "react";
import {
  Brush,
  Copy,
  Loader2,
  LockKeyhole,
  Mic,
  RotateCw,
  ScanLine,
  Wand2,
} from "lucide-react";
import { humanizeTextAction, reRollTextAction, estimateScoreAction } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import type { EstimateAiDetectionScoreOutput } from "@/ai/flows/estimate-ai-detection-score";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


type HumanizationStrength = "Subtle" | "Balanced" | "Aggressive";
type Tone = "Formal" | "Casual" | "Confident" | "Friendly" | "Professional";
type Style = "Academic" | "Blog Post" | "Business Email" | "Marketing Copy" | "Story";


export default function HumanizerClientPage() {
  const { toast } = useToast();
  const [isHumanizing, startHumanizing] = useTransition();
  const [isAnalyzingInput, startAnalyzingInput] = useTransition();
  const [isAnalyzingOutput, startAnalyzingOutput] = useTransition();

  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [lockedKeywords, setLockedKeywords] = useState("");
  const [strength, setStrength] = useState<HumanizationStrength>("Balanced");
  const [tone, setTone] = useState<Tone | undefined>();
  const [style, setStyle] = useState<Style | undefined>();
  
  const [inputScore, setInputScore] = useState<EstimateAiDetectionScoreOutput | null>(null);
  const [outputScore, setOutputScore] = useState<EstimateAiDetectionScoreOutput | null>(null);

  const isLoading = isHumanizing || isAnalyzingInput || isAnalyzingOutput;
  const strengthLevels: HumanizationStrength[] = ["Subtle", "Balanced", "Aggressive"];

  const handleHumanize = (isReroll = false) => {
    if (!inputText) {
      toast({
        title: "Input Required",
        description: "Please enter some text to humanize.",
        variant: "destructive",
      });
      return;
    }

    const action = isReroll ? reRollTextAction : humanizeTextAction;
    const keywords = lockedKeywords.split(",").map((k) => k.trim()).filter(Boolean);

    startHumanizing(async () => {
      setOutputScore(null);
      const result = await action({
        text: inputText,
        strength,
        lockedKeywords: keywords,
        tone,
        style
      });

      if (result.success) {
        setOutputText(result.data.humanizedText);
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  const handleAnalyze = async (
    text: string, 
    setScore: React.Dispatch<React.SetStateAction<EstimateAiDetectionScoreOutput | null>>,
    startTransition: React.TransitionStartFunction
    ) => {
    if (!text) {
        toast({
            title: "Input Required",
            description: "Please enter text to analyze.",
            variant: "destructive",
        });
        return;
    }
    startTransition(async () => {
        const result = await estimateScoreAction({ text });
        if (result.success) {
            setScore(result.data);
        } else {
            toast({
                title: "Analysis Error",
                description: result.error,
                variant: "destructive",
            });
            setScore(null);
        }
    });
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    toast({
      title: "Copied to clipboard!",
      description: "The polished text has been copied.",
    });
  };
  
  const ScoreDisplay = ({ scoreData, title }: { scoreData: EstimateAiDetectionScoreOutput | null, title: string }) => {
    if (!scoreData) return null;
    const scorePercent = Math.round(scoreData.score * 100);
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>{title}</span>
                <span>{scorePercent}%</span>
              </div>
              <Progress value={scorePercent} className="h-2" />
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-center" side="top">
            <p className="text-sm font-semibold">Justification</p>
            <p className="text-xs">{scoreData.explanation}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center space-y-8">
      
      <div className="w-full max-w-4xl text-center">
        <h2 className="text-2xl font-bold tracking-tight">Humanization Controls</h2>
        <p className="text-muted-foreground">Fine-tune the AI to get the perfect result.</p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="w-full border-border/60 bg-card/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-semibold text-lg">
                <LockKeyhole className="w-5 h-5" /> Locked Keywords
              </CardTitle>
              <CardDescription>
                Words or phrases the AI won't change. Separate with commas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                id="locked-keywords"
                placeholder="e.g., quantum entanglement, citations"
                value={lockedKeywords}
                onChange={(e) => setLockedKeywords(e.target.value)}
                disabled={isLoading}
              />
            </CardContent>
          </Card>

          <Card className="w-full border-border/60 bg-card/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-semibold text-lg">
                <Wand2 className="w-5 h-5" /> Humanization Strength
              </CardTitle>
              <CardDescription>
                Controls how much the AI changes your text. Subtle makes small edits, while Aggressive rewrites it more.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 pt-1">
                <Slider
                  value={[strengthLevels.indexOf(strength)]}
                  onValueChange={(value) =>
                    setStrength(strengthLevels[value[0]])
                  }
                  min={0}
                  max={2}
                  step={1}
                  disabled={isLoading}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  {strengthLevels.map((level) => (
                    <span
                      key={level}
                      className="w-1/3 cursor-pointer text-center font-medium"
                      onClick={() => !isLoading && setStrength(level)}
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full border-border/60 bg-card/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-semibold text-lg">
                <Mic className="w-5 h-5" /> Tone of Voice
              </CardTitle>
              <CardDescription>
                Choose the desired feeling for the writing (e.g., friendly, professional).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={(value: Tone) => setTone(value)} disabled={isLoading}>
                <SelectTrigger id="tone-selector">
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Confident">Confident</SelectItem>
                  <SelectItem value="Friendly">Friendly</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="w-full border-border/60 bg-card/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-semibold text-lg">
                <Brush className="w-5 h-5" /> Writing Style
              </CardTitle>
              <CardDescription>
                Choose the writing format, like a blog post or business email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={(value: Style) => setStyle(value)} disabled={isLoading}>
                <SelectTrigger id="style-selector">
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Blog Post">Blog Post</SelectItem>
                  <SelectItem value="Business Email">Business Email</SelectItem>
                  <SelectItem value="Marketing Copy">Marketing Copy</SelectItem>
                  <SelectItem value="Story">Story</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-full flex flex-col border-border/60 bg-card/50 shadow-sm">
          <CardHeader className="flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Original Text</CardTitle>
              <CardDescription>Paste your AI-generated text here.</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => handleAnalyze(inputText, setInputScore, startAnalyzingInput)} disabled={isLoading || !inputText}>
              {isAnalyzingInput ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine className="mr-2 h-4 w-4" />}
              Analyze
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            <Textarea
              placeholder="Start by pasting your text..."
              className="h-full min-h-[300px] resize-none"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <ScoreDisplay scoreData={inputScore} title="AI Detection Score" />
            <Button size="lg" onClick={() => handleHumanize(false)} disabled={isLoading || !inputText}>
              {isHumanizing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Humanize Text
            </Button>
          </CardFooter>
        </Card>

        <Card className="h-full flex flex-col border-border/60 bg-card/50 shadow-sm">
          <CardHeader className="flex-row items-center justify-between">
             <div className="space-y-1">
              <CardTitle>Polished Text</CardTitle>
              <CardDescription>The humanized, refined output.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
               <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size="icon" variant="outline" onClick={() => handleHumanize(true)} disabled={isLoading || !inputText}>
                            <RotateCw className="h-4 w-4" />
                            <span className="sr-only">Re-roll</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Re-roll</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size="icon" variant="outline" onClick={handleCopy} disabled={isLoading || !outputText}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Copy</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button size="sm" variant="outline" onClick={() => handleAnalyze(outputText, setOutputScore, startAnalyzingOutput)} disabled={isLoading || !outputText}>
                {isAnalyzingOutput ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine className="mr-2 h-4 w-4" />}
                Analyze
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <Textarea
              placeholder="Your humanized text will appear here..."
              className="h-full min-h-[300px] resize-none bg-secondary/30"
              value={outputText}
              onChange={(e) => setOutputText(e.target.value)}
              readOnly={isHumanizing}
            />
          </CardContent>
          <CardFooter>
            <ScoreDisplay scoreData={outputScore} title="New AI Detection Score" />
          </CardFooter>
        </Card>
      </div>
      <footer className="w-full text-center text-sm text-muted-foreground p-4">
      Powered by{" "}
      <a href="https://codeket.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
        Codeket
      </a>{" "}
      (because even AI needs a little help from its friends).
      <p>
       &copy; {new Date().getFullYear()} Codeket. All rights reserved.
      </p>
    </footer>
    </div>

  );
}
