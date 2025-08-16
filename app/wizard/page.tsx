import dynamic from 'next/dynamic'
const Wizard = dynamic(()=>import('@/components/Wizard'), { ssr:false })

export default function Page(){
  return (
    <main>
      <Wizard />
    </main>
  )
}
