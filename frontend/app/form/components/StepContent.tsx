// app/form/components/StepContent.tsx
import InputField from "./InputField";

interface StepContentProps {
  step: number;
}

export default function StepContent({ step }: StepContentProps) {
  switch (step) {
    case 0: // Stage แรก
      return (
        <div>
          <InputField label="ชื่อบริษัท/หน่วยงาน" />
          <InputField label="ที่อยู่" />
          <InputField label="ผู้รับผิดชอบ" />
          <InputField label="กิจกรรมประมวลผล" placeholder="เช่น การเก็บข้อมูลลูกค้า, การสื่อสารการตลาด" />
          <InputField label="วัตถุประสงค์ของการประมวลผล" />
        </div>
      );
    case 1: // Stage 2
      return (
        <div>
          <InputField label="ข้อมูลส่วนบุคคลที่จัดเก็บ" placeholder="ชื่อ, เบอร์โทร, อีเมล ฯลฯ" />
          <InputField label="หมวดหมู่ของข้อมูล (ลูกค้า / คู่ค้า / พนักงาน / ผู้ติดต่อ)" />
          <InputField label="ประเภทของข้อมูล (ทั่วไป / อ่อนไหว)" />
          <InputField label="วิธีการได้มาซึ่งข้อมูล (soft file / hard copy)" />
          <InputField label="แหล่งที่ได้มาซึ่งข้อมูล (เจ้าของโดยตรง / แหล่งอื่น)" />
        </div>
      );
    case 2: // Stage 3
      return (
        <div>
          <InputField label="ฐานในการประมวลผล (เช่น ความยินยอม, สัญญา, ปฏิบัติตามกฎหมาย)" />
          <InputField label="การขอความยินยอมของผู้เยาว์ (อายุไม่เกิน 10 ปี, 10–20 ปี)" />
        </div>
      );
    case 3: // Stage 4
      return (
        <div>
          <InputField label="มีการส่งหรือโอนข้อมูลไปต่างประเทศหรือไม่" />
          <InputField label="ประเทศปลายทาง" />
          <InputField label="เป็นการส่งไปยังบริษัทในเครือหรือไม่ (ระบุชื่อบริษัท)" />
          <InputField label="วิธีการโอน" />
          <InputField label="มาตรฐานการคุ้มครองข้อมูลของประเทศปลายทาง" />
          <InputField label="ข้อยกเว้นตามมาตรา 28" placeholder="เช่น ความยินยอม, สัญญา, ป้องกันอันตรายต่อชีวิต" />
        </div>
      );
    case 4: // Stage 5
      return (
        <div>
          <InputField label="นโยบายการเก็บรักษาข้อมูลส่วนบุคคล" />
          <InputField label="ประเภทของข้อมูล (soft file / hard copy)" />
          <InputField label="วิธีการเก็บรักษา" />
          <InputField label="ระยะเวลาการเก็บรักษา" />
          <InputField label="สิทธิและวิธีการเข้าถึงข้อมูล" />
          <InputField label="วิธีการลบ/ทำลายข้อมูล" />
          <InputField label="การใช้หรือเปิดเผยข้อมูลที่ไม่ต้องขอความยินยอม" />
          <InputField label="การปฏิเสธคำขอหรือคำคัดค้านของเจ้าของข้อมูล" />
        </div>
      );
    case 5: // Stage 6
      return (
        <div>
          <InputField label="มาตรการเชิงองค์กร" />
          <InputField label="มาตรการเชิงเทคนิค" />
          <InputField label="มาตรการทางกายภาพ" />
          <InputField label="การควบคุมการเข้าถึงข้อมูล" />
          <InputField label="การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน" />
          <InputField label="มาตรการตรวจสอบย้อนหลัง" />
        </div>
      );
    default:
      return null;
  }
}