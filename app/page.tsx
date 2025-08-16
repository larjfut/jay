import Progress from '@/components/Progress'
import PatientCard from '@/components/patient/PatientCard'
import Checklist from '@/components/Checklist'

import ResumePrompt from '@/components/ResumePrompt'

export default function Page(){
  return (
    <main className="grid gap-6">
      <PatientCard />
      <ResumePrompt />
      <div className="card">
        <h2 className="text-lg font-semibold mb-2">Welcome</h2>
        <p>This dashboard guides you through Sections 1–8 of the Baylor UDC packet, then exports DOCX documents. Provider letter (Section 3) must be authored by a clinician on their own device.</p>
        <ul className="list-disc ml-6 text-sm mt-3">
          <li>Wizard covers Narrative, Timeline, Medications, Family, Records/Test indices, and Cover & TOC.</li>
          <li>Each page includes a sidebar with instructions, length/format recommendations, and checklists.</li>
        </ul>
      </div>
      <Progress />
      <Checklist />
      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Next Step</h3>
        <div className="flex gap-2 mb-2">
          <a className="btn" href="/quick-overview">Quick Overview</a>
          <a className="btn btn-primary" href="/wizard">Start the Wizard</a>
        </div>
      </div>
    </main>
  )
}