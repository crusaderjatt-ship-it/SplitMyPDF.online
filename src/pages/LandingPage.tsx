import { Link } from "react-router-dom";
import { ArrowRight, BadgeIndianRupee, CheckCircle2, FileArchive, FileInput, Files, Lock, Scissors, Sparkles } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AdSenseSlot from "@/components/AdSenseSlot";
import RazorpayCheckoutButton from "@/components/RazorpayCheckoutButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tools = [
  {
    title: "Split PDF",
    description: "Break forms, certificates, and scanned documents into upload-ready files.",
    href: "/tools/split-pdf",
    icon: Scissors,
  },
  {
    title: "Merge PDF",
    description: "Combine mark sheets, ID proof, and certificates into one PDF.",
    href: "/tools/merge-pdf",
    icon: Files,
  },
  {
    title: "Extract pages",
    description: "Keep only the pages a portal or application form asks for.",
    href: "/tools/extract-pages",
    icon: FileInput,
  },
  {
    title: "Compress PDF",
    description: "Create smaller PDFs for size-limited online uploads.",
    href: "/tools/compress-pdf",
    icon: FileArchive,
  },
];

const guides = [
  ["Compress PDF under 200KB", "/guides/compress-pdf-under-200kb"],
  ["Merge certificates into one PDF", "/guides/merge-certificates-pdf"],
  ["Split PDF for online form uploads", "/guides/split-pdf-for-online-form"],
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <AppHeader />
      <main>
        <section id="home" className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 pt-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-slate-900 dark:text-blue-300">
              <Sparkles className="h-4 w-4" />
              Free browser-first PDF tools for Indian document tasks
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-bold tracking-normal md:text-6xl">
                Prepare PDFs for forms, certificates, and online uploads.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-300">
                Split, merge, extract, and compress small PDFs without login. Basic jobs run in your browser, so your document does not leave your device.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/tools/split-pdf">
                  Start with free tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#pricing">View Pro plans</a>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {["No signup for basics", "Private browser processing", "Upgrade for batch jobs"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.href} to={tool.href} className="rounded-lg border bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-blue-600 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold">{tool.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{tool.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="border-y bg-white py-12 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 md:grid-cols-3">
            <div className="flex gap-3">
              <Lock className="mt-1 h-5 w-5 text-blue-600" />
              <div>
                <h2 className="font-semibold">Trust before monetization</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">Free tools avoid uploads for small jobs. Cloud workflows use private signed downloads.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <BadgeIndianRupee className="mt-1 h-5 w-5 text-blue-600" />
              <div>
                <h2 className="font-semibold">Built for paid upgrades</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">Razorpay Pro unlocks larger files, saved history, batch processing, and ad-free use.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Sparkles className="mt-1 h-5 w-5 text-blue-600" />
              <div>
                <h2 className="font-semibold">Guides for real document problems</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">Practical help for form uploads, certificates, scanned files, and strict PDF size limits.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <h2 className="text-3xl font-bold tracking-normal">Popular document guides</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {guides.map(([title, href]) => (
                <Link key={href} to={href} className="rounded-md border bg-white p-5 transition hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Open a practical guide and use the matching free PDF tool.</p>
                </Link>
              ))}
            </div>
          </div>
          <AdSenseSlot slot={import.meta.env.VITE_ADSENSE_HOME_SLOT} />
        </section>

        <section id="pricing" className="bg-slate-100 py-16 dark:bg-slate-900">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-3xl font-bold tracking-normal">Free for quick jobs. Pro when documents become work.</h2>
              <p className="mt-3 text-slate-700 dark:text-slate-300">Use ads and free tools for discovery, then upgrade when you need serious batch workflows.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <Card className="dark:border-slate-800 dark:bg-slate-950">
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-3xl font-bold">₹0</p>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li>Browser-first small files</li>
                    <li>Ads may appear on guide/result pages</li>
                    <li>No saved history</li>
                  </ul>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/tools/split-pdf">Start free</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-blue-300 dark:border-blue-800 dark:bg-slate-950">
                <CardHeader>
                  <CardTitle>Pro Monthly</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-3xl font-bold">₹299/mo</p>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li>Larger files and more batches</li>
                    <li>No ads while working</li>
                    <li>Saved history and private cloud workspace</li>
                  </ul>
                  <RazorpayCheckoutButton planId="pro-monthly" label="Upgrade monthly" className="w-full" />
                </CardContent>
              </Card>
              <Card className="dark:border-slate-800 dark:bg-slate-950">
                <CardHeader>
                  <CardTitle>Pro Yearly</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-3xl font-bold">₹2,499/yr</p>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li>Best for repeat document work</li>
                    <li>Priority processing</li>
                    <li>Early access to India workflow presets</li>
                  </ul>
                  <RazorpayCheckoutButton planId="pro-yearly" label="Upgrade yearly" className="w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-white py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950">
        <p>© {new Date().getFullYear()} SplitMyPDF.online. Free PDF tools with privacy-first processing.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
