"use client";

import { motion } from "motion/react";
import { useState } from "react";

export type ScrollHighlightItem = { name: string; text: string };

type Props = {
  items: ScrollHighlightItem[];
  viewportMargin?: string;
  padTopBottomVh?: number;
};

function ScrollHighlightItemRow({
  item,
  index,
  isHighlighted,
  onHighlight,
  viewportMargin,
}: {
  item: ScrollHighlightItem;
  index: number;
  isHighlighted: boolean;
  onHighlight: (index: number) => void;
  viewportMargin: string;
}) {
  return (
    <motion.li
      className="skill-item"
      initial={false}
      animate={{
        opacity: isHighlighted ? 1 : 0.4,
        scale: isHighlighted ? 1.012 : 1,
      }}
      transition={{ type: "spring", stiffness: 100 }}
      onViewportEnter={() => onHighlight(index)}
      viewport={{ margin: viewportMargin, amount: "some" }}
    >
      <span className="skill-name">{item.name}</span>
      {isHighlighted && (
        <motion.p
          className="skill-description"
          layout
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          {item.text}
        </motion.p>
      )}
    </motion.li>
  );
}

export default function ScrollHighlight({
  items,
  viewportMargin = "-28% 0px -68% 0px",
  padTopBottomVh = 20, // reduced default vertical padding (was 50)
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!items?.length) return null;

  return (
    <div className="containerElement">
      <ul className="skills-list">
        {items.map((item, index) => (
          <ScrollHighlightItemRow
            key={`${item.name}-${index}`}
            item={item}
            index={index}
            isHighlighted={activeIndex === index}
            onHighlight={() => setActiveIndex(index)}
            viewportMargin={viewportMargin}
          />
        ))}
      </ul>
      <Stylesheet padTopBottomVh={padTopBottomVh} />
    </div>
  );
}

function Stylesheet({ padTopBottomVh }: { padTopBottomVh: number }) {
  return (
    <style>{`
      .containerElement { display: flex; }
      .skills-list {
        list-style: none;
        margin: 0; padding: 0;
        color: white;
        display: flex; flex-direction: column; gap: 32px; /* increased gap between elements */
        padding: ${padTopBottomVh}vh 0; /* smaller default padTopBottomVh reduces height */
      }
      .skill-item {
        will-change: opacity;
        font-size: clamp(1.5rem, 6vw, 3.2rem); /* smaller, more balanced sizes */
        font-weight: 700;
        margin: 0; padding: 0;
        line-height: 0.9;
        text-transform: uppercase;
        display: flex; flex-direction: column;
      }
      .skill-name { white-space: nowrap; }
      .skill-description {
        font-size: 1.2rem;
        min-height: 5rem; /* reduced min height to avoid huge gaps */
        font-weight: 400;
        line-height: 1.3;
        margin-top: 0.75rem;
        text-transform: none;
        opacity: 0.85;
        max-width: min(70ch, 90vw);
        white-space: normal;
        overflow-wrap: break-word; word-break: break-word;
        overflow: hidden; hyphens: auto;
      }
    `}</style>
  );
}
