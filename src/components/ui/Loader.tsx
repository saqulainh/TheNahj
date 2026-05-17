import React from "react";

interface LoaderProps {
  size?: string; // e.g. "2rem" or "4em"
  className?: string;
}

export function Loader({ size = "3em", className = "" }: LoaderProps) {
  return (
    <div
      className={`loader ${className}`}
      style={{ "--main-size": size } as React.CSSProperties}
    >
      <div className="text"><span>Loading</span></div>
      <div className="text"><span>Loading</span></div>
      <div className="text"><span>Loading</span></div>
      <div className="text"><span>Loading</span></div>
      <div className="text"><span>Loading</span></div>
      <div className="text"><span>Loading</span></div>
      <div className="text"><span>Loading</span></div>
      <div className="text"><span>Loading</span></div>
      <div className="text"><span>Loading</span></div>
      <div className="line"></div>
    </div>
  );
}
