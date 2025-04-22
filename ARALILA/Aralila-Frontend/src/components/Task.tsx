import React from "react";

interface TaskProps {
  imagePath: string;
  marginLeft: string;
}

const Task = ({ imagePath, marginLeft }: TaskProps) => {
  return (
    <div>
      <button className="custom-task-point-button">
        <img
          src={imagePath}
          alt=""
          width="70px"
          style={{ marginLeft: marginLeft }}
        />
      </button>
    </div>
  );
};

export default Task;
