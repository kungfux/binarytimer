import { useCallback, useMemo, useState } from "react";
import {
  faCircleCheck,
  faCircleXmark,
  faClockRotateLeft,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "./IconButton.component";
import styles from "./EditableTitle.component.module.css";

const EditableTitle = () => {
  const countdownTitleSettingKey = "title";
  const defaultTitle = "Please stand by";

  const getInitialTitle = () => {
    return localStorage.getItem(countdownTitleSettingKey) || defaultTitle;
  };

  const [displayText, setDisplayText] = useState(getInitialTitle);
  const [newText, setNewText] = useState(getInitialTitle);
  const [isEditVisible, setEditVisible] = useState(false);
  const [isEditMode, setEditMode] = useState(false);

  const accept = useCallback(() => {
    setDisplayText(newText);
    setEditMode(false);
    setEditVisible(false);
    localStorage.setItem(countdownTitleSettingKey, newText);
  }, [newText]);

  const discard = useCallback(() => {
    setEditMode(false);
    setEditVisible(false);
  }, []);

  const reset = useCallback(() => {
    setNewText(defaultTitle);
    setDisplayText(defaultTitle);
    setEditMode(false);
    setEditVisible(false);
    localStorage.setItem(countdownTitleSettingKey, defaultTitle);
  }, []);

  const confirmDiscardButtons = useMemo(
    () => (
      <div>
        <IconButton
          tooltip="Accept"
          icon={faCircleCheck}
          color="#05df72"
          onClick={accept}
        />
        <IconButton
          tooltip="Discard"
          icon={faCircleXmark}
          color="#ff6467"
          onClick={discard}
        />
        <IconButton
          tooltip="Reset to default"
          icon={faClockRotateLeft}
          color="#ffd43b"
          onClick={reset}
        />
      </div>
    ),
    [accept, discard, reset],
  );

  const editButton = useMemo(
    () => (
      <IconButton
        icon={faPencil}
        color="#ffd43b"
        tooltip="Edit title"
        onClick={() => setEditMode(true)}
      />
    ),
    [],
  );

  return (
    <div
      className="flex flex-row flex-wrap items-center justify-center mb-8 w-full min-h-12"
      onMouseOver={() => setEditVisible(true)}
      onMouseOut={() => setEditVisible(false)}
    >
      {!isEditMode && (
        <>
          <h1 className="text-5xl uppercase">{displayText}</h1>
          {isEditVisible && editButton}
        </>
      )}
      {isEditMode && (
        <>
          <input
            type="text"
            className={styles.input}
            value={newText}
            autoFocus
            onChange={(e) => {
              setNewText(e.target.value);
            }}
            onKeyDown={(e) => {
              switch (e.key) {
                case "Escape":
                  discard();
                  break;
                case "Enter":
                  accept();
                  break;
                default:
                  break;
              }
            }}
          />
          {confirmDiscardButtons}
        </>
      )}
    </div>
  );
};

export default EditableTitle;
