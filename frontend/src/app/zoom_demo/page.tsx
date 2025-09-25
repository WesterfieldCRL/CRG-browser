'use client';

import React, { useEffect, useRef } from "react";
import { useDragSelect } from "./DragSelectContext";

export const SomeOtherComponentsThatNeedsDragSelect = () => {
  const ds = useDragSelect();
  const inputEl = useRef(null);

  // adding a selectable element
  useEffect(() => {
    const element = inputEl.current as unknown as HTMLElement;
    if (!element || !ds) return;
    ds.addSelectables(element);
  }, [ds, inputEl]);

  // subscribing to a callback
  useEffect(() => {
    if (!ds) return;
    const handler = (e) => {
        console.log(e)
    };
    const id = ds.subscribe("DS:end", handler);

    return () => ds.unsubscribe("DS:end", handler);
  }, [ds]);

  return (
    <button ref={inputEl} aria-labelledby="Selectable">
      Selectable
    </button>
  );
};
