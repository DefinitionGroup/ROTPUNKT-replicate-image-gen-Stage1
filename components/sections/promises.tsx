"use client";

import { useState } from "react";
import { Card } from "@/components/design-system/card";
import { DetailCard, DetailTrigger } from "@/components/design-system/detail-card";
import { Emphasis } from "@/components/design-system/emphasis";
import { Label, SectionIntro } from "@/components/design-system/label";
import { Pill } from "@/components/design-system/pill";
import { Reveal } from "@/components/design-system/reveal";
import type { PromisesContent } from "@/lib/content/types";

/** The four promises. Each opens its story out of its own "+". */
export function Promises({ promises, closeLabel }: { promises: PromisesContent; closeLabel: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = promises.items.find((item) => item.id === openId) ?? null;

  return (
    <section className="signature-container pt-20 md:pt-[120px]" id="zusagen">
      <Reveal className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
        <SectionIntro label={promises.label} title={<Emphasis text={promises.title} />} />
        <p className="m-0 max-w-[40ch] text-body text-graphite">{promises.intro}</p>
      </Reveal>
      <div className="mt-7 grid gap-3 md:mt-12 md:grid-cols-2 md:gap-4 xl:grid-cols-4">
        {promises.items.map((item, index) => (
          <Reveal as="article" index={index} key={item.id}>
            <Card className="flex h-full min-h-[220px] flex-col justify-between gap-4 p-6 md:gap-8 md:p-7">
              <div className="flex items-start justify-between gap-4">
                <Label>{item.label}</Label>
                <DetailTrigger
                  id={item.id}
                  label={item.title}
                  onOpen={() => setOpenId(item.id)}
                  open={openId === item.id}
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <h3 className="m-0 text-card-title">{item.title}</h3>
                <p className="m-0 text-nav font-base text-graphite">{item.body}</p>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>

      {open && (
        <DetailCard
          closeLabel={closeLabel}
          footer={
            promises.cta && (
              <>
                <p className="m-0 text-caption text-graphite">{open.body}</p>
                <Pill className="h-11" href={promises.cta.href}>
                  {promises.cta.label}
                </Pill>
              </>
            )
          }
          id={open.id}
          label={open.label}
          onClose={() => setOpenId(null)}
          open
          title={open.title}
        >
          {open.detail.map((paragraph) => (
            <p className="m-0 text-body text-graphite" key={paragraph.slice(0, 24)}>
              {paragraph}
            </p>
          ))}
        </DetailCard>
      )}
    </section>
  );
}
