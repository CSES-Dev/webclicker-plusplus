import { BarGraph } from "@/components/ui/bar-chart";
import { BarB } from "@/components/ui/bar-chartB";
import { Button } from "@/components/ui/button";
import { LChart } from "@/components/ui/line-chart";
import { PieChart } from "@/components/ui/pie-chart";

export default function Home() {
    const items = [
        { topic: "Strings", value: 75, color: "yellow" },
        { topic: "Bools", value: 20, color: "blue" },
        { topic: "Loops", value: 87, color: "orange" },
        { topic: "Const", value: 73, color: "green" },
        { topic: "other", value: 90, color: "purple" },
    ];

    const lineChartData = [
        { day: "1/6", score: 23 },
        { day: "1/7", score: 57 },
        { day: "1/8", score: 50 },
        { day: "1/9", score: 75 },
        { day: "1/10", score: 70 },
    ];

    return (
        <div className="bg-primary  grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-start sm:items-center">
                <h1 className="text-2xl text-primary-foreground font-semibold">WebClicker++</h1>
                <Button variant="outline">Click</Button>
                <LChart data={lineChartData} />
                <PieChart value={50} pie_label={"assignment"} />
                {/* <BarGraph amount={50}/> */}
                <BarB title={"Chart!!!"} data={items} />
            </main>
            <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
                <a
                    className="text-primary-foreground flex items-center gap-2 hover:underline hover:underline-offset-4"
                    href="https://csesucsd.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    CSES UCSD
                </a>
            </footer>
        </div>
    );
}