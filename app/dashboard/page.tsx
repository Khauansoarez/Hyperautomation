import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
    Rocket,
    FileText,
    CheckCircle2,
    Trophy,
    History,
    TrendingUp,
    LayoutDashboard,
    Activity,
    ChevronRight
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
    // Fetch stats (mocked or real)
    const totalQuestions = await prisma.question.count()
    const attempts = await prisma.attempt.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    })

    const totalAttempts = await prisma.attempt.count()
    const averageScoreRaw = totalAttempts > 0
        ? (await prisma.attempt.aggregate({ _avg: { score: true } }))._avg.score
        : 0

    const averageScore = Number(averageScoreRaw).toFixed(1)

    return (
        <main className="min-h-screen bg-[#0B1120] text-slate-100 font-sans selection:bg-indigo-500/30 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">

            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-5xl z-10 relative space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/10">
                            <LayoutDashboard className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
                                Hyperautomation Specialist
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-slate-400 text-sm font-medium">Practice Exam</span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wider">v2.0</span>
                            </div>
                        </div>
                    </div>
                    {/* Back to Menu Link added for convenience */}
                    <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                        Back to Menu
                    </Link>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Card 1: Total Questions (Cyan/Blue) */}
                    <div className="group relative bg-[#151E32]/80 backdrop-blur-sm p-8 rounded-3xl border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.15)] hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FileText size={100} className="text-cyan-400 transform rotate-12 translate-x-4 -translate-y-4" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4 text-cyan-400 border border-cyan-500/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                <FileText size={28} />
                            </div>
                            <span className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-2">Total Questions</span>
                            <span className="text-5xl font-bold text-white tracking-tight">{totalQuestions}</span>
                        </div>
                    </div>

                    {/* Card 2: Attempts (Indigo/Violet) */}
                    <div className="group relative bg-[#151E32]/80 backdrop-blur-sm p-8 rounded-3xl border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(99,102,241,0.15)] hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <History size={100} className="text-indigo-400 transform rotate-12 translate-x-4 -translate-y-4" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-400 border border-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                <History size={28} />
                            </div>
                            <span className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-2">Attempts</span>
                            <span className="text-5xl font-bold text-white tracking-tight">{totalAttempts}</span>
                        </div>
                    </div>

                    {/* Card 3: Avg Score (Emerald/Green) */}
                    <div className="group relative bg-[#151E32]/80 backdrop-blur-sm p-8 rounded-3xl border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.15)] hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Trophy size={100} className="text-emerald-400 transform rotate-12 translate-x-4 -translate-y-4" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400 border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp size={28} />
                            </div>
                            <span className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-2">Avg Score</span>
                            <span className="text-5xl font-bold text-white tracking-tight">{averageScore}</span>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center py-4">
                    <Link
                        href="/"
                        className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full overflow-hidden shadow-[0_0_40px_-5px_rgba(79,70,229,0.3)] hover:shadow-[0_0_60px_-10px_rgba(79,70,229,0.5)] transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                    >
                        <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative text-xl font-bold text-white flex items-center gap-3">
                            Start New Quiz
                            <Rocket className="w-6 h-6 animate-pulse" />
                        </span>
                        <div className="absolute right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                            <ChevronRight className="w-5 h-5 text-white/90" />
                        </div>
                    </Link>
                </div>

                {/* Recent Activity */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3 px-1">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-indigo-400" />
                        </div>
                        Recent Activity
                    </h2>

                    <div className="bg-[#151E32]/60 backdrop-blur-sm border border-slate-800 rounded-3xl p-2 min-h-[200px] flex flex-col justify-center">
                        {attempts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                <div className="w-24 h-24 bg-slate-800/30 rounded-full flex items-center justify-center mb-2 border border-slate-700/50">
                                    <Rocket className="w-10 h-10 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-slate-300">No activity yet</p>
                                    <p className="text-slate-500 max-w-xs mx-auto mt-1">Ready to test your knowledge? Start your first quiz attempt above.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800/50 w-full">
                                {attempts.map((attempt) => (
                                    <Link
                                        href={`/results/${attempt.id}`}
                                        key={attempt.id}
                                        className="group flex items-center justify-between p-5 hover:bg-slate-800/40 transition-colors first:rounded-t-[20px] last:rounded-b-[20px]"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all border border-slate-700 group-hover:border-blue-500/30 shadow-sm">
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-200 group-hover:text-white transition-colors text-lg">Quiz Attempt</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Completed</span>
                                                    <p className="text-xs text-slate-500">{new Date(attempt.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="flex items-baseline gap-1 justify-end">
                                                    <span className={`block text-2xl font-bold leading-none ${attempt.score >= (attempt.total * 0.7) ? 'text-emerald-400' : 'text-white'}`}>
                                                        {attempt.score}
                                                    </span>
                                                    <span className="text-sm text-slate-500 font-medium">/{attempt.total}</span>
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 group-hover:text-slate-500 transition-colors">Score</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-800/0 flex items-center justify-center group-hover:bg-slate-700/50 transition-colors">
                                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </main>
    )
}
