import { createRef, useLayoutEffect, useMemo } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { Button, ButtonType } from "../components/Button.component";
import { useOptionsContext } from "../hooks/useOptionsContext.hook";
import BitButton from "../components/BitButton.component";
import BitCounter from "../BitCounter";
import styles from "./TimerSetup.module.css";

function TimerSetup() {
  const navigate = useNavigate();
  const bitCounter = useMemo(() => new BitCounter(), []);
  const { isStopwatchMode } = useOptionsContext();
  const [selectedBits, setSelectedBits] = useState(bitCounter.getBits());

  const refs = useMemo(
    () =>
      Array.from({ length: bitCounter.getMaximumBits() }, () =>
        createRef<{
          isSelected: () => boolean;
          setAsSelected: (setAsSelected: boolean) => void;
        }>(),
      ),
    [bitCounter],
  );

  const handleBitClick = (index: number) => {
    setSelectedBits(bitCounter.reverseBit(index));
  };

  useLayoutEffect(() => {
    if (isStopwatchMode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedBits(bitCounter.setTime(0));
    }
  }, [bitCounter, isStopwatchMode]);

  useEffect(() => {
    refs.map((ref, index) => {
      if (ref.current?.isSelected() !== (selectedBits[index] === 1)) {
        ref.current?.setAsSelected(selectedBits[index] === 1);
      }
    });
  }, [refs, selectedBits]);

  const startButton = useMemo(
    () => (
      <Button
        type={ButtonType.Primary}
        text="Start"
        icon={faPlay}
        iconColor="#05df72"
        onClick={() => navigate(`?time=${bitCounter.getTime()}`)}
        disabled={!selectedBits.some((x) => x === 1) && !isStopwatchMode}
      />
    ),
    [bitCounter, isStopwatchMode, navigate, selectedBits],
  );

  const presetButtons = useMemo(() => {
    return [1, 2, 3, 5, 10, 15, 30, 60].map((value) => (
      <Button
        key={value}
        type={ButtonType.Secondary}
        text={`${value}m`}
        onClick={() => setSelectedBits(bitCounter.setTime(value * 60))}
      />
    ));
  }, [bitCounter]);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl uppercase mb-8">
        <span className={styles.typewriter} />
      </h1>
      <div className="flex flex-row justify-center align-center flex-wrap mt-8">
        {selectedBits.map((_, index) => (
          <BitButton
            key={selectedBits.length - index - 1}
            ref={refs[selectedBits.length - index - 1]}
            isClickable={!isStopwatchMode}
            isSelectedInitially={(() => {
              return (
                bitCounter.getBits()[selectedBits.length - index - 1] === 1
              );
            })()}
            onClick={() => handleBitClick(selectedBits.length - index - 1)}
          />
        ))}
      </div>
      <p className="my-4">
        {selectedBits.some((x) => x === 1)
          ? `${bitCounter.toString(isStopwatchMode)}`
          : isStopwatchMode
            ? "Press Start to begin"
            : "Select bits and press Start"}
      </p>
      {startButton}
      {!isStopwatchMode && (
        <div className="mt-8">
          <p className="mb-4">Presets:</p>
          <div className="flex flex-row justify-center align-center flex-wrap">
            {presetButtons}
          </div>
        </div>
      )}
    </div>
  );
}

export default TimerSetup;
