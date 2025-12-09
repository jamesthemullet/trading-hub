import { useRouter } from 'next/router';

type HistoryData<T> = {
  changes?: Array<{
    id: string;
    change: T;
  }>;
};

type UseHistoricalOrCurrentRulesetProps<T> = {
  id: string;
  historyData: {
    history: HistoryData<T>;
    isLoading: boolean;
    error: string;
  };
  currentData: {
    data: T | undefined;
    isLoading: boolean;
  };
};

type UseHistoricalOrCurrentRulesetReturn<T> = {
  rulesetData: T | undefined;
  isLoading: boolean;
  error: string;
};

export const useHistoricalOrCurrentRuleset = <T>({
  historyData,
  currentData,
}: UseHistoricalOrCurrentRulesetProps<T>): UseHistoricalOrCurrentRulesetReturn<T> => {
  const router = useRouter();
  const isHistoryView = router.query.history === 'true';
  const historyId = router.query.historyId;

  const {
    history,
    isLoading: isHistoryLoading,
    error: historyError,
  } = historyData;
  const { data: current, isLoading: isCurrentLoading } = currentData;

  const isLoading = isHistoryView ? isHistoryLoading : isCurrentLoading;

  const historyChange = history.changes?.find(
    (change) => change.id === historyId
  );
  const rulesetData = isHistoryView ? historyChange?.change : current;

  return {
    rulesetData,
    isLoading,
    error: historyError,
  };
};
