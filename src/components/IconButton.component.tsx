import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import styles from "./IconButton.component.module.css";

const IconButton = ({
  icon,
  tooltip,
  disabled = false,
  className,
  color,
  tabIndex,
  onClick,
}: {
  icon: IconDefinition;
  tooltip?: string;
  disabled?: boolean;
  className?: string;
  color?: string;
  tabIndex?: number;
  onClick?: () => void;
}) => {
  return (
    <button
      key={crypto.randomUUID()}
      type="button"
      aria-label={tooltip}
      title={tooltip}
      className={[styles.icon, className].join(" ")}
      disabled={disabled}
      tabIndex={tabIndex}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={icon} style={{ color: color }} />
    </button>
  );
};

export { IconButton };
