// src/components/Toolbar.jsx
import React, { useState } from "react";
import Plotly from "plotly.js-dist-min";
import "./Toolbar.css"; // optional (see step 2)

const Toolbar = ({ mobileSidebarOpen, setMobileSidebarOpen }) => {
  const [exportOpen, setExportOpen] = useState(false);

  const handleExport = async (format) => {
    try {
      await Plotly.downloadImage("plotly-chart", {
        format,
        filename: `chart_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}`,
        width: 1200,
        height: 800,
        scale: 2,
      });
      setExportOpen(false);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <header className="bg-[#3A7DD9] text-[#F0F4F8] shadow py-2 relative">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Mobile Export */}
        <div className="md:hidden relative">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="bg-[#003a8b] hover:bg-[#004cff] text-white px-4 py-2 rounded-md flex items-center gap-1"
          >
            Export ▼
          </button>

          {exportOpen && (
            <ul
              className="export-dropdown absolute left-0 mt-2 rounded-md shadow-lg w-40 overflow-hidden z-50"
              style={{ backgroundColor: "#ffffff", color: "#000000" }} // <- inline override
            >
              <li className="hover:bg-gray-100 cursor-pointer px-4 py-2" onClick={() => handleExport("png")}>
                📸 PNG
              </li>
              <li className="hover:bg-gray-100 cursor-pointer px-4 py-2" onClick={() => handleExport("svg")}>
                🖼️ SVG
              </li>
              <li className="hover:bg-gray-100 cursor-pointer px-4 py-2" onClick={() => handleExport("jpeg")}>
                🌆 JPEG
              </li>
            </ul>
          )}
        </div>

        {/* Logo */}
        <a href="#" className="text-white font-bold text-xl mx-auto md:mx-0">
          Graph Maker
        </a>

        {/* Mobile Hamburger */}
        <button className="md:hidden text-white text-2xl" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}>
          ☰
        </button>

        {/* Desktop Export */}
        <nav className="hidden md:flex ml-auto">
          <ul className="flex space-x-6 items-center">
            <li className="relative">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="bg-[#003a8b] hover:bg-[#004cff] text-white px-4 py-2 rounded-md flex items-center gap-1"
              >
                Export ▼
              </button>

              {exportOpen && (
                <ul
                  className="export-dropdown absolute right-0 mt-2 rounded-md shadow-lg w-40 overflow-hidden z-50"
                  style={{ backgroundColor: "#ffffff", color: "#000000" }} // <- inline override
                >
                  <li className="hover:bg-gray-100 cursor-pointer px-4 py-2" onClick={() => handleExport("png")}>
                    📸 PNG
                  </li>
                  <li className="hover:bg-gray-100 cursor-pointer px-4 py-2" onClick={() => handleExport("svg")}>
                    🖼️ SVG
                  </li>
                  <li className="hover:bg-gray-100 cursor-pointer px-4 py-2" onClick={() => handleExport("jpeg")}>
                    🌆 JPEG
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Toolbar;
