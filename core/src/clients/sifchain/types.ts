import { TsProtoGeneratedType } from "@cosmjs/proto-signing";

export type PickType<TObject, TPicked> = Pick<
  TObject,
  Exclude<
    keyof TObject,
    {
      [P in keyof TObject]: TObject[P] extends TPicked ? never : P;
    }[keyof TObject]
  >
>;

export type ProtoPackageAndMessages<T extends { protobufPackage: any }> = {
  protobufPackage: T["protobufPackage"];
} & PickType<T, TsProtoGeneratedType>;

export type EncodeObjectRecord<T extends ProtoPackageAndMessages<T>> = {
  [P in keyof PickType<T, TsProtoGeneratedType>]: {
    typeUrl: P extends string ? `/${T["protobufPackage"]}.${P}` : void;
    value: T[P] extends TsProtoGeneratedType
      ? ReturnType<T[P]["fromPartial"]>
      : void;
  };
};
