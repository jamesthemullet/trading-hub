export type AttributeDisplayType = 'boosted' | 'default' | 'excluded';

export type BaseDisplayValueMeta = {
  isBeginningOfDisplayTypeGroup: boolean;
  isEndOfDisplayTypeGroup: boolean;
};
type BaseDisplayValue = {
  id: string;
  displayType: AttributeDisplayType;
  meta: BaseDisplayValueMeta;
};
type SingleAttributeDisplayValue = BaseDisplayValue & {
  mergeType: 'unmerged';
  displayValue: string;
};
type MergedAttributeDisplayValue = BaseDisplayValue & {
  mergedValues: string[];
  displayValue: string;
  mergeType: 'merged';
};
export type AttributeRowDisplayValue =
  | SingleAttributeDisplayValue
  | MergedAttributeDisplayValue;
