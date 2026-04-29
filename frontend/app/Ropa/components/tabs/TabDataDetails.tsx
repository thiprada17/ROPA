"use client";
import { RopaItem } from "../../types/ropa";

export default function TabDataDetails({
  item,
  RenderValue,
  InfoRowPlain,
  formOptions,
}: {
  item: RopaItem;
  RenderValue: any;
  BulletRow: any;
  InfoRowPlain: any;
  InfoRow: any;
  formOptions?: any;
}) {
  const step2: any = item.step2 || {};
  const safeItem: any = item;

  const isUuid = (value: any) =>
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );

  const resolveOne = (value: any, optionList: any[] = []) => {
    if (!value) return "";

    if (!isUuid(value)) return value;

    const found = optionList.find(
      (o: any) => o.id === value || o.value === value,
    );

    return found?.name || found?.label || "";
  };

  const resolveMany = (values: any, optionList: any[] = []) => {
    const arr = Array.isArray(values) ? values : values ? [values] : [];
    return arr.map((value) => resolveOne(value, optionList)).filter(Boolean);
  };

  const dataClass =
    step2?.dataClass ||
    step2?.personalDataType ||
    step2?.data_main_type ||
    safeItem.dataClass ||
    "";

  const description =
    step2?.description ||
    step2?.dataDetail ||
    step2?.data_detail ||
    safeItem.dataDescription ||
    safeItem.description ||
    "";

  const categoryNames = resolveMany(
    step2?.categories ||
      step2?.dataCategories ||
      step2?.dataCategoryIds ||
      step2?.data_category_ids,
    formOptions?.dataCategories ?? [],
  );

  const methodNames = resolveMany(
    step2?.methods ||
      step2?.acquisitionMethods ||
      step2?.acquisitionMethodIds ||
      step2?.acquisition_method_ids,
    formOptions?.acquisitionMethods ?? [],
  );

  const dataTypeName = resolveOne(
    step2?.dataType || step2?.dataTypeId || step2?.data_type_id,
    formOptions?.dataTypes ?? [],
  );

  const dataSourceName = resolveOne(
    step2?.dataSource ||
      step2?.dataSourceId ||
      step2?.sourceId ||
      step2?.source_id,
    formOptions?.dataSources ?? [],
  );

  const dataOwner =
    safeItem.dataOwner || safeItem.step1?.dataOwner || "ไม่มีข้อมูล";

  return (
    <div className="space-y-2">
      <InfoRowPlain label="ประเภทข้อมูลส่วนบุคคล">
        <RenderValue value={dataClass ? [dataClass] : []} />
      </InfoRowPlain>

      <div className="ml-4 space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          <span className="text-[11px] text-[#A6A6A6]">
            รายละเอียดข้อมูลเพิ่มเติม
          </span>
        </div>

        <textarea
          readOnly
          value={description}
          placeholder="ไม่มีข้อมูล"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 min-h-[80px] text-[#1C1B1F] bg-gray-50 text-[12px] resize-none"
        />
      </div>

      <InfoRowPlain label="หมวดหมู่ข้อมูล">
        <RenderValue value={categoryNames} />
      </InfoRowPlain>

      <InfoRowPlain label="ประเภทของข้อมูล">
        <RenderValue value={dataTypeName ? [dataTypeName] : []} />
      </InfoRowPlain>

      <InfoRowPlain label="เจ้าของข้อมูล">
        <span className="text-[11px] text-[#1C1B1F]">{dataOwner}</span>
      </InfoRowPlain>

      <InfoRowPlain label="วิธีที่ได้มาซึ่งข้อมูล">
        <RenderValue value={methodNames} />
      </InfoRowPlain>

      <InfoRowPlain label="แหล่งที่ได้มาซึ่งข้อมูล">
        <RenderValue value={dataSourceName ? [dataSourceName] : []} />
      </InfoRowPlain>
    </div>
  );
}