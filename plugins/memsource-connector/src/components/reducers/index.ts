import { State, Action } from '../../types';
import { useReducer } from 'react';

const initialSelectedLocales: State = { selectedLocales: new Set() };

const selectedLocalesReducer = (state: State, action: Action): State => {
  const { locale, checked } = action;
  if (checked) {
    return { selectedLocales: new Set(state.selectedLocales).add(locale) };
  } else {
    const selectedLocales = new Set(state.selectedLocales);
    selectedLocales.delete(locale);
    return { selectedLocales };
  }
};

export const useSelectedLocalesReducer = (): {
  selectedLocales: Set<string>;
  dispatch: React.Dispatch<Action>;
} => {
  const [{ selectedLocales }, dispatch] = useReducer(
    selectedLocalesReducer,
    initialSelectedLocales
  );

  return { selectedLocales, dispatch };
};

type LocaleDialogStageState = {
  onDisplay: boolean;
  onResult: boolean;
  message: string;
  severity: 'warning' | 'success' | 'error' | 'info';
};

type LocaleDialogStageAction = {
  nextStage: 'display' | 'success' | 'failure';
  message: string;
};

const initialLocaleDialogStage: LocaleDialogStageState = {
  onDisplay: true,
  onResult: false,
  severity: 'info',
  message: ''
};

const localeDialogStageReducer = (
  _: LocaleDialogStageState,
  action: LocaleDialogStageAction
): LocaleDialogStageState => {
  if (action.nextStage === 'display') {
    const onDisplayNext: LocaleDialogStageState = {
      onDisplay: true,
      onResult: false,
      severity: 'info',
      message: ''
    };
    return onDisplayNext;
  }

  if (action.nextStage === 'success') {
    const onSuccessNext: LocaleDialogStageState = {
      onDisplay: false,
      onResult: true,
      severity: 'success',
      message: action.message
    };

    return onSuccessNext;
  }

  if ((action.nextStage = 'failure')) {
    const onFailureNext: LocaleDialogStageState = {
      onDisplay: false,
      onResult: true,
      severity: 'error',
      message: action.message
    };

    return onFailureNext;
  }

  return initialLocaleDialogStage;
};

export const useLocaleDialogStageReducer = (): {
  localeDialogStage: LocaleDialogStageState;
  dispatch: React.Dispatch<LocaleDialogStageAction>;
} => {
  const [localeDialogStage, dispatch] = useReducer(
    localeDialogStageReducer,
    initialLocaleDialogStage
  );

  return { localeDialogStage, dispatch };
};
