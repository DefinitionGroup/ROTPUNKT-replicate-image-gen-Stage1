export type WizardProgress = {
  totalStages: number;
  currentStage: number;
  progressPercent: number;
  hasStarted: boolean;
};

export function getWizardProgress(
  currentStep: number,
  totalSteps: number
): WizardProgress {
  const totalStages = Math.max(1, totalSteps + 1);
  const hasStarted = currentStep >= 0;
  const currentStage = hasStarted
    ? Math.min(Math.max(currentStep + 1, 1), totalStages)
    : 0;
  const progressPercent = hasStarted
    ? (currentStage / totalStages) * 100
    : 0;

  return {
    totalStages,
    currentStage,
    progressPercent,
    hasStarted,
  };
}
