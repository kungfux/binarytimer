import { forwardRef, useImperativeHandle, useState } from "react";
import NumberFlow from "@number-flow/react";
import "@fontsource/montserrat/400.css";
import styles from "./BitButton.module.css";

const BitButton = forwardRef(
  (
    {
      isClickable,
      isSelectedInitially = false,
      ariaLabel,
      onClick,
    }: {
      isClickable: boolean;
      isSelectedInitially?: boolean;
      ariaLabel: string;
      onClick?: () => void;
    },
    ref
  ) => {
    const [hovered, setHovered] = useState(false);
    const [selected, setSelected] = useState(isSelectedInitially);

    const isSelected = (): boolean => {
      return selected;
    };

    const setAsSelected = (isSelected: boolean) => {
      setSelected(isSelected);
    };

    useImperativeHandle(ref, () => ({
      isSelected,
      setAsSelected,
    }));

    const getClassName = (): string => {
      if (hovered && selected) return `${styles.hovered} ${styles.selected}`;
      if (selected) return isClickable ? styles.selected : styles.hovered;
      if (hovered) return styles.hovered;
      return "";
    };

    const handleClick = () => {
      setSelected(!selected);
      if (onClick) {
        onClick();
      }
    };

    return (
      <button
        type="button"
        aria-label={ariaLabel}
        aria-pressed={selected}
        title={selected ? "1" : "0"}
        className={`${styles.button} ${getClassName()}`}
        onMouseEnter={() => isClickable && setHovered(true)}
        onMouseLeave={() => isClickable && setHovered(false)}
        onClick={() => isClickable && handleClick()}
      >
        <NumberFlow value={selected ? 1 : 0} />
      </button>
    );
  }
);

export default BitButton;
