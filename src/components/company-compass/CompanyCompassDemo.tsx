"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, CircleDollarSign, FileWarning, Package, Sparkles, Activity, TrendingUp, MessageSquareText, UsersRound, Clock3, BellRing, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/Button";

const scenarios = [
  { id: "tech-sales", label: "Technician Sales", title: "See what each technician sold — without merging reports", value: "$42,680", description: "CUE connects technician, job, line item, revenue, and conversion data into one weekly view so the owner can drill from a technician to the exact jobs sold.", columns: ["Tech","Jobs","Sold","Revenue","Conv."], rows: [["Mike","14","8","$18,450","57%"],["Carlos","11","6","$13,280","55%"],["Jordan","13","7","$10,950","54%"]], action: "Open technician detail" },
  { id: "workday", label: "Technician Workday", title: "Mike's Tuesday is a job-by-job timeline", value: "7.4 hrs", description: "Daily time totals become useful when CUE ties each time entry back to the job, customer, work performed, and revenue outcome.", columns: ["Time","Job","Work","Hours","Revenue"], rows: [["8:00"," #1042","Diagnostic","1.6","$450"],["10:30","#1048","Replacement","2.8","$1,850"],["1:15","#1051","Repair","1.4","$275"]], action: "View full workday" },
  { id: "booking", label: "Booking Rules", title: "Online booking request doesn't fit the native rules", value: "2 conflicts", description: "CUE evaluates service, day, time, and service-area constraints so the business can route customers instead of losing or misbooking them.", columns: ["Service","Day","Area","HCP","CUE"], rows: [["Estimate","Tue–Thu","All","Available","Available"],["Drain service","Mon–Wed","ZIP 926xx","Conflict","Route"],["Drain service","Thu","ZIP 928xx","Conflict","Route"]], action: "Review booking route" },
  { id: "conversation", label: "Customer Conversation", title: "A customer asked to book — but no appointment was created", value: "18 min", description: "CUE detects booking intent in the conversation and checks whether the operational outcome actually happened.", columns: ["Customer","Signal","Age","Appointment","Next"], rows: [["Garcia","Wants to schedule","18 min","None","Follow up"],["Patel","Asked for pricing","31 min","None","Review"],["Lee","Ready to book","47 min","None","Escalate"]], action: "Open response queue" },
  { id: "service-plan", label: "Service Plan Context", title: "Service-plan history needs context before the next conversation", value: "$250", description: "CUE keeps service-plan activity, delivered value, upcoming renewal, and customer context together so staff can act from the same picture.", columns: ["Customer","Plan","Service","Value","Renewal"], rows: [["Anderson","Pro Club","Maintenance","$125","43 days"],["Anderson","Pro Club","Prior service","$125","43 days"],["Anderson","Pro Club","Next action","—","43 days"]], action: "Review plan context" },
  { id: "data-quality", label: "Data Quality", title: "Important fields are present in the system — but not connected", value: "3 gaps", description: "CUE identifies information that prevents clean reporting, such as time entries without a linked job or records that cannot be reconciled across workflows.", columns: ["Signal","Source","Impact","Status"], rows: [["Time entry","Time tracking","Tech productivity","Needs link"],["Line item","Job record","Sales reporting","Needs match"],["Booking","Online booking","Conversion","Needs outcome"]], action: "Review data gaps" },
];

const signals = [
  ["Technician revenue","$42,680","This week",CircleDollarSign],
  ["Technician conversion","55%","31 jobs · 17 sold",TrendingUp],
  ["Booking outcomes","3","Need appointment review",CalendarClock],
  ["Data gaps","3","Need reconciliation",FileWarning],
];

export function CompanyCompassDemo() {
  const [activeId, setActiveId] = useState("invoice");
  const [actioned, setActioned] = useState<string[]>([]);
  const active = scenarios.find((s) => s.id === activeId) ?? scenarios[0];
  const done = actioned.includes(active.id);

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-cue-purple-400/30 bg-[#07101f] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.3)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(59,130,246,0.18),transparent_34%),radial-gradient(circle_at_90%_90%,rgba(139,92,246,0.16),transparent_38%)]" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cue-purple-300"><Sparkles className="h-4 w-4" /> CUE intelligence</div>
          <h2 className="mt-3 max-w-3xl text-2xl font-semibold text-white">HCP records the work. CUE watches what happens next.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-charcoal-300">CUE sits above the workflow and looks across jobs, estimates, purchases, memberships, documentation, and customer activity to surface the exceptions that are easy to miss during a busy day.</p>
          <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-charcoal-300">{["Capture","Understand","Enhance","Execute","Expand"].map((item,i)=><span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{i+1}. {item}</span>)}</div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-400">Daily intelligence check</p><h3 className="mt-1 text-lg font-semibold text-charcoal-900">What CUE understands across the workflow</h3></div>
          <span className="text-xs text-charcoal-400">Demonstration data</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {signals.map(([label,value,detail,Icon]) => { const I = Icon as typeof Activity; return <div key={String(label)} className="rounded-xl border border-charcoal-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-xs font-medium text-charcoal-600">{label}</p><I className="h-4 w-4 text-cue-blue-300" /></div><p className="mt-3 text-2xl font-semibold text-charcoal-900">{value}</p><p className="mt-1 text-xs text-charcoal-500">{detail}</p></div>; })}
        </div>
      </section>

      <section className="rounded-xl border border-charcoal-200 bg-white shadow-sm">
        <div className="border-b border-charcoal-200 px-5 pt-4">
          <div className="flex items-center gap-2"><Package className="h-4 w-4 text-cue-orange-300" /><h3 className="text-sm font-semibold text-charcoal-900">HCP workflow · Where CUE adds intelligence</h3></div>
          <p className="mt-1 pb-4 text-xs text-charcoal-400">Five HCP workflow scenarios. Click one to see how CUE connects the data and surfaces the next action.</p>
          <div className="flex gap-1 overflow-x-auto">
            {scenarios.map((s) => <button key={s.id} onClick={() => setActiveId(s.id)} className={\`whitespace-nowrap border-b-2 px-3 py-3 text-xs font-semibold transition \${activeId === s.id ? "border-cue-purple-500 text-cue-purple-700" : "border-transparent text-charcoal-500 hover:text-charcoal-800"}\`}>{s.label}</button>)}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 xl:grid-cols-[1.5fr_0.75fr]">
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-charcoal-200 bg-charcoal-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-charcoal-600">Detected by CUE · no AI theatrics</span>
                <h4 className="mt-3 text-lg font-semibold text-charcoal-900">{active.title}</h4>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-charcoal-600">{active.description}</p>
              </div>
              <div className="shrink-0 rounded-xl bg-charcoal-50 px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-500">Exception value</p><p className="mt-1 text-xl font-semibold text-charcoal-900">{active.value}</p></div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-charcoal-200">
              <div className="grid bg-charcoal-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-charcoal-500" style={{ gridTemplateColumns: \`repeat(\${active.columns.length}, minmax(0, 1fr))\` }}>{active.columns.map((c) => <span key={c}>{c}</span>)}</div>
              <div className="divide-y divide-charcoal-200">{active.rows.map((row,ri) => <div key={ri} className="grid px-3 py-3 text-xs text-charcoal-700" style={{ gridTemplateColumns: \`repeat(\${active.columns.length}, minmax(0, 1fr))\` }}>{row.map((cell,ci) => <span key={ci} className={ci === row.length-1 ? "font-semibold text-charcoal-900" : ""}>{cell}</span>)}</div>)}</div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant={done ? "secondary" : "cue"} size="sm" onClick={() => !done && setActioned([...actioned,active.id])}>{done ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}{done ? "Review logged" : active.action}</Button>
              <span className="text-[11px] text-charcoal-400">CUE recommends the next step; the owner stays in control.</span>
            </div>
          </div>

          <aside className="rounded-xl border border-cue-blue-200 bg-cue-blue-50/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cue-blue-700">Why this matters</p>
            <div className="mt-4 space-y-4">{[["Event","A workflow event occurs."],["Context","CUE checks related records."],["Exception","It finds something worth reviewing."],["Action","The owner gets a specific next step."]].map(([step,copy],i)=><div key={step} className="flex gap-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-cue-blue-700 shadow-sm">{i+1}</div><div><p className="text-xs font-semibold text-charcoal-900">{step}</p><p className="mt-0.5 text-[11px] leading-5 text-charcoal-600">{copy}</p></div></div>)}</div>
          </aside>
        </div>
      </section>

      <section className="rounded-xl border border-cue-purple-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2"><BellRing className="h-4 w-4 text-cue-purple-600" /><h3 className="text-sm font-semibold text-charcoal-900">CUE Command Center · What needs attention?</h3></div>
            <p className="mt-1 text-xs leading-5 text-charcoal-500">Instead of making the owner hunt through reports, CUE turns connected HCP activity into a short exception queue.</p>
          </div>
          <span className="rounded-full border border-cue-purple-200 bg-cue-purple-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-cue-purple-700">5 active signals</span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-charcoal-200 bg-charcoal-50 p-4">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-charcoal-900">$1,850 estimate</p><p className="mt-1 text-[11px] text-charcoal-500">No follow-up</p></div><span className="text-[10px] font-semibold text-cue-purple-600">48 hrs</span></div>
              <button className="mt-4 text-[11px] font-semibold text-cue-blue-700 hover:underline">Follow up →</button>
            </div><div className="rounded-xl border border-charcoal-200 bg-charcoal-50 p-4">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-charcoal-900">2 booking leads</p><p className="mt-1 text-[11px] text-charcoal-500">No appointment</p></div><span className="text-[10px] font-semibold text-cue-purple-600">18–47 min</span></div>
              <button className="mt-4 text-[11px] font-semibold text-cue-blue-700 hover:underline">Respond →</button>
            </div><div className="rounded-xl border border-charcoal-200 bg-charcoal-50 p-4">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-charcoal-900">Mike · 57%</p><p className="mt-1 text-[11px] text-charcoal-500">Weekly conversion</p></div><span className="text-[10px] font-semibold text-cue-purple-600">14 jobs</span></div>
              <button className="mt-4 text-[11px] font-semibold text-cue-blue-700 hover:underline">View tech →</button>
            </div><div className="rounded-xl border border-charcoal-200 bg-charcoal-50 p-4">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-charcoal-900">3 jobs</p><p className="mt-1 text-[11px] text-charcoal-500">Time not linked</p></div><span className="text-[10px] font-semibold text-cue-purple-600">7.4 hrs total</span></div>
              <button className="mt-4 text-[11px] font-semibold text-cue-blue-700 hover:underline">Review →</button>
            </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /><h3 className="text-sm font-semibold text-charcoal-900">CUE outcome check</h3></div>
          <div className="mt-4 grid grid-cols-3 gap-3">{[["17","sold this week"],["3","booking reviews"],["3","data gaps"]].map(([v,l])=><div key={l} className="rounded-lg border border-charcoal-200 bg-charcoal-50 p-3 text-center"><p className="text-2xl font-semibold text-charcoal-900">{v}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-charcoal-500">{l}</p></div>)}</div>
          <p className="mt-4 text-xs leading-5 text-charcoal-500">CUE turns disconnected operational records into a short list of actions and measurable outcomes.</p>
        </div>
        <div className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-charcoal-900">Connected systems</h3>
          <p className="mt-1 text-xs leading-5 text-charcoal-400">CUE is designed to sit above the systems the business already uses and connect the signals they contain.</p>
          <div className="mt-4 space-y-2">{[["Housecall Pro","Core system","Jobs · techs · time · booking"],["QuickBooks","Planned","Revenue · payments"],["Twilio","Planned","Customer conversations"],["Booking channels","Planned","Lead · appointment outcomes"]].map(([name,status,detail])=><div key={name} className="rounded-lg border border-charcoal-200 bg-charcoal-50 p-3"><div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold text-charcoal-900">{name}</p><span className="text-[10px] font-medium text-cue-purple-600">{status}</span></div><p className="mt-1 text-[11px] text-charcoal-400">{detail}</p></div>)}</div>
        </div>
      </section>

      <section className="rounded-xl border border-cue-purple-200 bg-[#0b1220] p-5 text-white">
        <div className="flex items-center gap-2"><MessageSquareText className="h-4 w-4 text-cue-purple-300" /><h3 className="text-sm font-semibold">Outcome loop</h3></div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">{[["1","Work happens","Job, technician, booking, conversation, or service-plan event."],["2","CUE watches","CUE connects related records and checks the business outcome."],["3","Owner acts","A specific action or drill-down is presented."],["4","Outcome returns","The outcome feeds back into the operating picture."]].map(([n,title,copy])=><div key={n} className="rounded-lg border border-white/10 bg-white/5 p-3"><span className="text-xs font-bold text-cue-purple-300">{n}</span><p className="mt-2 text-xs font-semibold">{title}</p><p className="mt-1 text-[11px] leading-5 text-charcoal-300">{copy}</p></div>)}</div>
      </section>
    </div>
  );
}
