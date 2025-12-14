// flows/shared/hooks/useFlowNavigation.ts
import { useNavigation } from '@react-navigation/native';
import { useState, useCallback } from 'react';
import { FlowData } from '../types/flow';

export const useFlowNavigation = (initialData: FlowData = {}) => {
  const navigation = useNavigation();
  const [flowData, setFlowData] = useState<FlowData>(initialData);
  const [history, setHistory] = useState<string[]>([]);

  const navigateToScreen = useCallback(
    (screenName: string, data?: Partial<FlowData>) => {
      if (data) {
        setFlowData(prev => ({ ...prev, ...data }));
      }
      setHistory(prev => [...prev, screenName]);
      // @ts-ignore
      navigation.navigate(screenName, { flowData: { ...flowData, ...data } });
    },
    [navigation, flowData],
  );

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);
    }
    navigation.goBack();
  }, [navigation, history]);

  const updateFlowData = useCallback((data: Partial<FlowData>) => {
    setFlowData(prev => ({ ...prev, ...data }));
  }, []);

  const resetFlow = useCallback(() => {
    setFlowData({});
    setHistory([]);
  }, []);

  return {
    flowData,
    navigateToScreen,
    goBack,
    updateFlowData,
    resetFlow,
    canGoBack: history.length > 0,
  };
};
