/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useCallback, useEffect } from 'react';
import { paymentMethodsService } from '../services/db/paymentMethodsService';
import type { TPaymentMethod } from '../types';

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<TPaymentMethod[]>([]);
  const load = useCallback(async () => {
    const data = await paymentMethodsService.getAll();
    setPaymentMethods(data);
  }, []);

  useEffect(() => { void load(); }, [load]);
  return { paymentMethods, reloadPaymentMethods: load };
};