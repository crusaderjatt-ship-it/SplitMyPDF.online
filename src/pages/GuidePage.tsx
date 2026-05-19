import { Link, useParams } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import AdSenseSlot from "@/components/AdSenseSlot";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const guides = {
  "compress-pdf-under-200kb": {
    title: "Compress PDF Under 200KB for Online Forms",
    description: "A practical guide for reducing PDF size before uploading documents to Indian application portals.",
    tool: "/tools/compress-pdf",
    steps: [
      "Start with a clean scan. Re-scan at 150 DPI when a portal only needs readable text.",
      "Use the free browser compression tool first so your document stays on your device.",
      "Download the compressed copy and check the portal size requirement before submitting.",
      "If the file is still too large, split attachments into separate PDFs when the form allows it.",
    ],
    faqs: [
      ["Can every PDF be compressed under 200KB?", "No. Scanned image-heavy PDFs may need re-scanning or image optimization before they can hit strict limits."],
      ["Is this safe for certificates?", "The free browser tool processes basic files locally, which is safer than uploading sensitive documents for every small change."],
    ],
  },
  "merge-certificates-pdf": {
    title: "Merge Certificates Into One PDF",
    description: "Combine mark sheets, ID proof, certificates, and supporting documents into a single upload-ready PDF.",
    tool: "/tools/merge-pdf",
    steps: [
      "Keep documents in the order requested by the school, employer, or portal.",
      "Choose all PDFs in the merge tool and name the output clearly.",
      "Download the merged PDF and open it once before uploading.",
      "Use Pro batch workflows later when you need saved history or larger document sets.",
    ],
    faqs: [
      ["Do I need to create an account?", "No for small free jobs. Accounts are useful when you want saved history or larger files."],
      ["Can I merge scanned PDFs?", "Yes, as long as each file is within the anonymous file-size limit."],
    ],
  },
  "split-pdf-for-online-form": {
    title: "Split PDF for Online Form Uploads",
    description: "Extract only the required pages from a long PDF before uploading documents to forms and portals.",
    tool: "/tools/split-pdf",
    steps: [
      "Check which pages the form actually asks for.",
      "Split the PDF by one page or extract a specific range.",
      "Rename the downloaded files so you can identify them during upload.",
      "Avoid uploading extra pages that contain private or unnecessary details.",
    ],
    faqs: [
      ["Should I split or extract pages?", "Use split when you need many separate PDFs. Use extract when you need one smaller PDF with selected pages."],
      ["Will splitting reduce quality?", "Splitting copies pages into new PDFs and should preserve the original page quality."],
    ],
  },
};

const GuidePage = () => {
  const { guideSlug } = useParams();
  const guide = guides[guideSlug as keyof typeof guides] || guides["compress-pdf-under-200kb"];

  return (
    <div className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <AppHeader />
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-16 pt-28 lg:grid-cols-[1fr_320px]">
        <article className="space-y-8">
          <header className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">India document workflow</p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-normal md:text-5xl">{guide.title}</h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-300">{guide.description}</p>
            <Button asChild>
              <Link to={guide.tool}>Open free tool</Link>
            </Button>
          </header>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Step-by-step</h2>
            <ol className="space-y-3">
              {guide.steps.map((step, index) => (
                <li key={step} className="rounded-md border bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <span className="mr-2 font-semibold text-blue-600">{index + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Common questions</h2>
            {guide.faqs.map(([question, answer]) => (
              <Card key={question} className="dark:border-slate-800 dark:bg-slate-900">
                <CardContent className="p-5">
                  <h3 className="font-semibold">{question}</h3>
                  <p className="mt-2 text-slate-700 dark:text-slate-300">{answer}</p>
                </CardContent>
              </Card>
            ))}
          </section>
        </article>

        <aside className="space-y-4">
          <AdSenseSlot slot={import.meta.env.VITE_ADSENSE_GUIDE_SLOT} />
          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="space-y-3 p-5">
              <h2 className="font-semibold">Free PDF tools</h2>
              <Link className="block text-blue-600" to="/tools/compress-pdf">Compress PDF</Link>
              <Link className="block text-blue-600" to="/tools/merge-pdf">Merge PDF</Link>
              <Link className="block text-blue-600" to="/tools/split-pdf">Split PDF</Link>
              <Link className="block text-blue-600" to="/tools/extract-pages">Extract pages</Link>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
};

export default GuidePage;
