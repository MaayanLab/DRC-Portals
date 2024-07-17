import { FancyTab } from "@/components/misc/FancyTabs";

export default function Page() {
  return (
    <>
      <FancyTab id='all' label={<>Processed Data</>} loading />
      <FancyTab id='c2m2' label={<>Cross-Cut Metadata Model</>} loading />
    </>
  )
}