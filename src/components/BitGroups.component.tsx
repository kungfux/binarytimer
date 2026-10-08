import { useEffect, useState, type RefObject } from "react";
import BitButton from "./BitButton.component";
import styles from "./BitGroups.module.css";

const BITS_PER_GROUP = 4;
const ANIMATION_MS = 300;

function BitGroups({
  bits,
  refs,
  isClickable,
  onBitClick,
}: {
  bits: number[];
  refs: RefObject<unknown>[];
  isClickable: boolean;
  onBitClick?: (index: number) => void;
}) {
  const groupCount = Math.ceil(bits.length / BITS_PER_GROUP);
  const [renderedCount, setRenderedCount] = useState(groupCount);
  const [isAnimated, setIsAnimated] = useState(false);

  if (groupCount > renderedCount) {
    setRenderedCount(groupCount);
  }

  // Skips the enter animation for groups present on first render.
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (groupCount >= renderedCount) {
      return;
    }
    const timer = setTimeout(() => setRenderedCount(groupCount), ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [groupCount, renderedCount]);

  return (
    <>
      {Array.from({ length: renderedCount }, (_, index) => {
        const group = renderedCount - index - 1;
        const isLeaving = group >= groupCount;
        const className = isLeaving
          ? styles.leaving
          : isAnimated
            ? styles.entering
            : "";

        return (
          <div key={group} className={`flex flex-row ${className}`}>
            {Array.from({ length: BITS_PER_GROUP }, (_, i) => {
              const bitIndex = group * BITS_PER_GROUP + BITS_PER_GROUP - i - 1;
              return (
                <BitButton
                  key={bitIndex}
                  ref={refs[bitIndex]}
                  isClickable={isClickable && !isLeaving}
                  ariaLabel={`bit-${bitIndex}`}
                  isSelectedInitially={bits[bitIndex] === 1}
                  onClick={() => onBitClick?.(bitIndex)}
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
}

export default BitGroups;
