import React from "react";

interface PaneProps {
  fullWidth: boolean;
  title?: string;
  children: React.ReactNode;
}

const Pane: React.FC<PaneProps> = ({ fullWidth, title, children }) => {
  return (
    <div
      className={
        !fullWidth
          ? "flex w-full  flex-col gap-6 rounded-xl  xl:w-1/2"
          : "flex w-full  flex-col gap-6 rounded-lg "
      }
    >
      {title !== "" && <h3 className="attention-voice">{title}</h3>}
      <div className="grid gap-4 p-2">{children}</div>
    </div>
  );
};

export default Pane;
