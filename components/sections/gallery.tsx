import { MediaCard } from "@/components/design-system/card";
import { Emphasis } from "@/components/design-system/emphasis";
import { SectionIntro } from "@/components/design-system/label";
import { Pill } from "@/components/design-system/pill";
import { Reveal } from "@/components/design-system/reveal";
import { Tilt } from "@/components/design-system/tilt";
import type { GalleryContent } from "@/lib/content/types";

/** Generated kitchens as cinematic cards: a snap band on phones, a grid above. */
export function Gallery({ gallery }: { gallery: GalleryContent }) {
  return (
    <section className="pt-20 md:pt-[120px]" id="galerie">
      <Reveal className="signature-container grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
        <SectionIntro label={gallery.label} title={<Emphasis text={gallery.title} />} />
        {gallery.intro && <p className="m-0 max-w-[40ch] text-body text-graphite">{gallery.intro}</p>}
      </Reveal>
      <div className="mt-6 md:mt-12">
        <ul className="signature-container my-0 flex snap-x snap-mandatory list-none gap-3 overflow-x-auto p-0 pb-2 [scrollbar-width:none] md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:pb-0 xl:grid-cols-3 [&::-webkit-scrollbar]:hidden">
          {gallery.items.map((item, index) => (
            <Reveal as="li" className="w-[300px] shrink-0 snap-start md:w-auto" index={index} key={item.image}>
              <Tilt>
                <MediaCard
                  alt={item.alt ?? item.title}
                  body={item.description}
                  image={item.image}
                  ratio="aspect-[4/5] md:aspect-[16/11]"
                  shade="deep"
                  sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 300px"
                  title={item.title}
                />
              </Tilt>
            </Reveal>
          ))}
        </ul>
      </div>
      {gallery.cta && (
        <div className="signature-container mt-6 md:mt-8">
          <Pill href={gallery.cta.href} variant="secondary">
            {gallery.cta.label}
          </Pill>
        </div>
      )}
    </section>
  );
}
