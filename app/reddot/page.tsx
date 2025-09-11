"use client";
import React from "react";
import ExpandableCards from "@/app/components/ExpandableCards";
import TextHeadlineCombo from "@/app/components/TextHeadlineCombo";
import HeaderImageVideoComp2 from "@/app/components/HeaderImageVideoComp2";
import StaggeredSlideUp from "@/app/components/StaggeredSlideUp";
import { useRef } from "react";
import { useInView } from "motion/react";
import ScrollHighlight from "../components/ScrollHighlight";
export default async function Reddot() {
  return (
    <>
      <div
        id="Step3"
        className="grid grid-cols-12 z-1 mx-auto  mt-8 min-h-[90vh] relative ">
        <HeaderImageVideoComp2
          className="mt-12 min-h-[70vh] "
          useVideo={true}
          enableParallax={true}></HeaderImageVideoComp2>{" "}
        <div className="z-1  gap-8 col-span-12 py-32 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <StaggeredSlideUp
            className="flex flex-col  items-start mt-64 justify-center "
            delay={0.1}
            staggerDelay={0.1}
            duration={0.5}
            distance={80}>
            <h2 className="text-9xl leading-compress text-gray-100 max-w-3xl font-normal tracking-tighter leading-tighter mb-8">
              Von kleinen Ideen
            </h2>
            <p className="text-3xl text-gray-100 font-medium  max-w-2xs mx-auto">
              und grossen Visionen.
            </p>
          </StaggeredSlideUp>
        </div>{" "}
      </div>{" "}
      <div className="relative container mx-auto  mt-26   ">
        {" "}
        <TextHeadlineCombo
          eyebrow="Bei uns ist Standard alles andere als gewöhnlich. "
          headline="Innovations "
          highlight="Meister"
          subhead="Jede Küche wird mit höchster Sorgfalt gefertigt – stabil, langlebig und in einem Design, das bis ins Detail überzeugt. Außen wie innen perfekt aufeinander abgestimmt, mit hochwertigen Materialien und raffinierten Lösungen, die den Alltag leichter machen."
          kicker=""
          align="left"
          size="xl"
          className="max-w-1/2 my-24"
        />
         <div className="grid grid-cols-12 z-1 mx-auto relative container font-aspekta">
          <div className="z-1 grid col-span-12 py-32 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
<HeaderImageVideoComp2
          className="mt-12 min-h-[70vh] "
          useVideo={true}
          enableParallax={true}></HeaderImageVideoComp2>{" "}
            <div className="col-span-12 col-start-1">
              <ScrollHighlight />
            </div>
          </div>
        </div>{" "}
        <ExpandableCards className="mt-12" />
      </div>
               <div className="grid grid-cols-12 z-1 mx-auto relative container font-aspekta">
          <div className="z-1 grid col-span-12 py-32 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
<HeaderImageVideoComp2
          className="mt-12 min-h-[70vh] "
          useVideo={true} videoSrc="fenix-1.mp4"
          enableParallax={true}></HeaderImageVideoComp2>{" "}
            <div className="col-span-12 col-start-1 px-24  z-10 ">
              <ScrollHighlight />
            </div>
          </div>
        </div>{" "}
    </>
  );
}
