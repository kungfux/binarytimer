import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import BitButton from "../components/BitButton";
import React from "react";

function TimerSetup() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(Array(12).fill(0) as number[]);
  const refs = Array.from({ length: 12 }, () =>
    React.createRef<{
      isSelected: () => boolean;
      setAsSelected: (setAsSelected: boolean) => void;
    }>()
  );

  const handleStartClick = () => {
    navigate(`/timer?time=${selected.reverse().join("")}`);
  };

  const handleBitClick = (refIndex: number) => {
    setSelected(
      selected.map((x, index) =>
        index === refIndex ? (selected[index] === 1 ? 0 : 1) : x
      )
    );
  };

  const binaryToDecimal = (number: number[]) => {
    return number.reduce((acc, bit, index) => {
      return acc + bit * Math.pow(2, index);
    }, 0);
  };

  const secondsToMinutes = (seconds: number) => {
    return `${Math.floor(seconds / 60)} minute(s) and ${
      seconds % 60
    } second(s)`;
  };

  const secondsToArray = (seconds: number) => {
    return seconds
      .toString(2)
      .padStart(12, "0")
      .split("")
      .map(Number)
      .reverse();
  };

  useEffect(() => {
    refs.map((ref, index) => {
      if (ref.current?.isSelected() !== (selected[index] === 1)) {
        ref.current?.setAsSelected(selected[index] === 1);
      }
    });
  }, [refs, selected]);

  // TODO: https://stackoverflow.com/questions/54719260/curved-header-with-pure-css
  // TODO: https://mui.com/toolpad/studio/reference/components/date-picker/

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <h1 style={{ textTransform: "uppercase" }}>Binary timer</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {selected.map((_value, index) => (
          <BitButton
            key={selected.length - index - 1}
            ref={refs[selected.length - index - 1]}
            isClickable={true}
            onClick={() => handleBitClick(selected.length - index - 1)}
          />
        ))}
      </div>
      <p>
        {selected.some((x) => x === 1)
          ? `${secondsToMinutes(binaryToDecimal(selected))}`
          : "Select bits and click Start"}
      </p>
      <button
        className="primary"
        onClick={handleStartClick}
        disabled={!selected.some((x) => x === 1)}
      >
        Start
      </button>
      <hr />
      <p style={{ marginRight: ".5rem" }}>Presets:</p>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {[1, 2, 3, 5, 10, 15, 30, 60].map((value) => (
          <button
            className="secondary"
            key={value}
            onClick={() => setSelected(secondsToArray(value * 60))}
          >
            {value}m
          </button>
        ))}
      </div>
    </div>
  );
}

export default TimerSetup;
