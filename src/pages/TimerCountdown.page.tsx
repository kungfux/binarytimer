import { createRef, useCallback, useMemo } from "react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import routes from "../routes";
import BitGroups from "../components/BitGroups.component";
import BitCounter from "../BitCounter";
import EditableTitle from "../components/EditableTitle.component";
import { Button, ButtonType } from "../components/Button.component";
import { useOptionsContext } from "../hooks/useOptionsContext.hook";
import { faStop } from "@fortawesome/free-solid-svg-icons";

function TimerCountdown() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMuted, isHidden, isStopwatchMode } = useOptionsContext();
  const queryParams = new URLSearchParams(location.search);
  const timeParam = queryParams.get("time");

  const bitCounter = useMemo(() => new BitCounter(), []);

  const [timeLeft, setTimeLeft] = useState(() => {
    bitCounter.setTime(parseInt(timeParam || "0"));
    return bitCounter.getTime();
  });
  const [bitPattern, setBitPattern] = useState(() => bitCounter.getBits());

  const refs = useMemo(
    () =>
      Array.from({ length: bitPattern.length }, () =>
        createRef<{
          isSelected: () => boolean;
          setAsSelected: (setAsSelected: boolean) => void;
        }>(),
      ),
    [bitPattern.length],
  );

  const playCountdownSound = useCallback(() => {
    const audio = document.getElementById("bee") as HTMLAudioElement;
    audio.play();
  }, []);

  const playEndSound = useCallback(() => {
    const audio = document.getElementById("doo") as HTMLAudioElement;
    audio
      .play()
      .then(() => {
        audio.onended = () => {
          navigate(routes.root.path);
        };
      })
      .catch(() => {
        navigate(routes.root.path);
      });
  }, [navigate]);

  useEffect(() => {
    if (isStopwatchMode) {
      return;
    }

    switch (timeLeft) {
      case 0:
        playEndSound();
        break;
      case 1:
      case 2:
        playCountdownSound();
        break;
      default:
        break;
    }
  }, [isStopwatchMode, playCountdownSound, playEndSound, timeLeft]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextBits = isStopwatchMode
        ? bitCounter.addTime(1)
        : bitCounter.reduceTime(1);

      refs.forEach((ref, index) => {
        if (ref.current?.isSelected() !== (nextBits[index] === 1)) {
          ref.current?.setAsSelected(nextBits[index] === 1);
        }
      });

      setBitPattern(nextBits);
      setTimeLeft(bitCounter.getTime());
    }, 1000);
    return () => clearTimeout(timer);
  }, [bitCounter, isStopwatchMode, refs, timeLeft]);

  const stopButton = useMemo(
    () => (
      <Button
        type={ButtonType.Primary}
        text="Stop"
        icon={faStop}
        iconColor="#ff6467"
        onClick={() => navigate(routes.root.path)}
      />
    ),
    [navigate],
  );

  const addTimeButtons = useMemo(() => {
    return [1, 2, 3, 5, 10, 15, 30, 60].map((value) => (
      <Button
        key={value}
        type={ButtonType.Secondary}
        text={`${value}m`}
        onClick={() => {
          setBitPattern(bitCounter.addTime(value * 60));
          setTimeLeft(bitCounter.getTime());
        }}
      />
    ));
  }, [bitCounter]);

  return (
    <>
      <audio
        id="bee"
        src={`${routes.base}bee.mp3`}
        preload="auto"
        muted={isMuted}
      />
      <audio
        id="doo"
        src={`${routes.base}doo.mp3`}
        preload="auto"
        muted={isMuted}
      />
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center justify-center text-center">
          <EditableTitle />
          <div className="flex flex-row justify-center align-center flex-wrap mt-8">
            <BitGroups bits={bitPattern} refs={refs} isClickable={false} />
          </div>
          <p className="my-4">{bitCounter.toString(isStopwatchMode)}</p>
          {stopButton}
        </div>
        <div
          className={`mt-8 rounded-2xl ${
            timeLeft <= 0 ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {!isHidden && !isStopwatchMode && (
            <>
              <p className="mb-4">Add time:</p>
              <div className="flex flex-row justify-center align-center flex-wrap">
                {addTimeButtons}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default TimerCountdown;
