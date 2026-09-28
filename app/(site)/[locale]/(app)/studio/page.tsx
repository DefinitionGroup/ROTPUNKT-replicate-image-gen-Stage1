import { setRequestLocale } from "next-intl/server";
import { StudioShell } from "@/components/studio/studio-shell";

type Props = {
  params: Promise<{ locale: string }>;
};

/** The configurator: choices on the left, the current step on the stage, the image where the step was. */
export default async function StudioPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <StudioShell />;
}
