
'use client'
import { saveAs } from '@/lib/saveAs'
import { usePacket, PacketState } from '@/lib/store'
import { buildCoverTocDoc, buildNarrativeDoc, buildTimelineDoc, buildMedsDoc, buildFamilyDoc, buildRecordsCoverDoc, buildTestsCoverDoc } from '@/lib/docgen'

export async function downloadAllZip(state?: PacketState){
  const JSZip = (await import('jszip')).default;
  const store = state ?? (usePacket.getState() as any)
  const pName = store.patient?.name || 'Patient'
  const zip = new JSZip()

  const docs = [
    [buildCoverTocDoc(store), '1_Cover_TOC.docx'],
    [buildNarrativeDoc(store), '2_Narrative.docx'],
    [buildTimelineDoc(store), '4_Timeline.docx'],
    [buildRecordsCoverDoc(store), '5_Records_Index_Cover.docx'],
    [buildTestsCoverDoc(store), '6_Tests_Index_Cover.docx'],
    [buildMedsDoc(store), '7_Medications.docx'],
    [buildFamilyDoc(store), '8_Family_History.docx'],
  ] as const

  for (const [promise, name] of docs) {
    const doc = await promise
    const blob = await doc.createBlob()
    zip.file(name, blob)
  }

  const manifest = {
    patient: store.patient, generatedAt: new Date().toISOString(),
    sections: ['Cover & TOC','Narrative','Timeline','Records Cover','Tests Cover','Medications','Family']
  }
  zip.file('manifest.json', JSON.stringify(manifest, null, 2))

  const blob = await zip.generateAsync({ type: 'blob' })
  const fname = `${pName.replace(/\W+/g,'_')}_Baylor_UDC_Packet.zip`
  saveAs(blob, fname)
}
