import type { ChangeEvent, Dispatch, RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { RuleSetActions } from '@/libs/components/types';

type UseBoostWeightMenuArgs = {
  id: string;
  dispatch: Dispatch<RuleSetActions>;
  onConfirm: () => void;
};

type UseBoostWeightMenuResult = {
  isBoostWeightMenuOpen: boolean;
  boostWeight: number;
  boostWeightError: string;
  boostWeightInputRef: RefObject<HTMLInputElement | null>;
  openBoostWeightMenu: () => void;
  closeBoostWeightMenu: () => void;
  onBoostWeightChange: (event: ChangeEvent<HTMLInputElement>) => void;
  confirmBoost: () => void;
};

export const useBoostWeightMenu = ({
  id,
  dispatch,
  onConfirm,
}: UseBoostWeightMenuArgs): UseBoostWeightMenuResult => {
  const [isBoostWeightMenuOpen, setIsBoostWeightMenuOpen] = useState(false);
  const [boostWeight, setBoostWeight] = useState(100);
  const [boostWeightError, setBoostWeightError] = useState('');
  const boostWeightInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (boostWeightInputRef.current) {
      boostWeightInputRef.current.focus();
    }
  }, [isBoostWeightMenuOpen]);

  const openBoostWeightMenu = () => {
    setBoostWeight(100);
    setBoostWeightError('');
    setIsBoostWeightMenuOpen(true);
  };

  const closeBoostWeightMenu = useCallback(() => {
    setIsBoostWeightMenuOpen(false);
  }, []);

  const onBoostWeightChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setBoostWeightError('');
      setBoostWeight(0);
      return;
    }

    const parsed = Number(trimmedValue);
    const isValidBoostWeight =
      Number.isInteger(parsed) && parsed >= 1 && parsed <= 100;

    setBoostWeight(parsed);

    if (!isValidBoostWeight) {
      setBoostWeightError('Please enter a whole number between 1 and 100');
    } else {
      setBoostWeightError('');
    }
  };

  const confirmBoost = () => {
    dispatch({
      type: 'product',
      payload: {
        ids: [id],
        operation: 'boost',
        change: 'add',
        weight: boostWeight,
      },
    });
    closeBoostWeightMenu();
    onConfirm();
  };

  return {
    isBoostWeightMenuOpen,
    boostWeight,
    boostWeightError,
    boostWeightInputRef,
    openBoostWeightMenu,
    closeBoostWeightMenu,
    onBoostWeightChange,
    confirmBoost,
  };
};
