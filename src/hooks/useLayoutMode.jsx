import { useState, useEffect } from "react";

function useLayoutMode(containerRef) {
  const [layoutMode, setLayoutMode] = useState("");
  useEffect(() => {
    function updateDimensions() {
      if (!containerRef.current) return;
      const { width } = containerRef.current.getBoundingClientRect();
      const newLayoutMode = width >= 960 ? "desktop" : "mobile";
      if (layoutMode !== newLayoutMode) {
        setLayoutMode(newLayoutMode);
      }
    }

    // Add event listener
    window.addEventListener("resize", updateDimensions);
    // Call handler right away so state gets updated with initial window size
    updateDimensions();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", updateDimensions);
  }, [containerRef.current, layoutMode]);
  return layoutMode;
}

export default useLayoutMode;
