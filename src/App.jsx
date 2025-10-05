import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Sidebar from "./components/Sidebar";
import Chart from "./components/Chart";
import Toolbar from "./components/Toolbar";

export default function App() {
  const [rows, setRows] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const [chartSettings, setChartSettings] = useState({
    title: "",
    xLabel: "",
    yLabel: "",
    source: "",
    maxY: null,
    minY: null,
    prefix: "",
    titleFont: "normal",
    labelFont: "normal",
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ✅ Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  // Update body class for overall background
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const updateRowsWithHistory = (newRows) => {
    setRows(typeof newRows === "function" ? newRows(rows) : newRows);
  };

  const handleRowsChange = (newRows) => updateRowsWithHistory(newRows);

  const addRow = () => {
    updateRowsWithHistory((prevRows) => {
      if (prevRows.length === 0) return [{ x: "", y1: "" }];
      const yKeys = Object.keys(prevRows[0]).filter((k) => k.startsWith("y"));
      const newRow = { x: "" };
      yKeys.forEach((key) => (newRow[key] = ""));
      return [...prevRows, newRow];
    });
  };

  const removeRow = (idx) => updateRowsWithHistory(rows.filter((_, i) => i !== idx));

  const addYColumn = () => {
    const nextIndex =
      rows.length > 0
        ? Object.keys(rows[0]).filter((k) => k.startsWith("y")).length + 1
        : 1;
    const newKey = `y${nextIndex}`;
    const newRows =
      rows.length === 0 ? [{ x: "", [newKey]: "" }] : rows.map((r) => ({ ...r, [newKey]: "" }));
    updateRowsWithHistory(newRows);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const sheetArr = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      if (!sheetArr.length) return;

      const headers = sheetArr[0];
      const dataRows = sheetArr.slice(1);
      const newRows = dataRows.map((row) => {
        const rowObj = { x: String(row[0] ?? "").trim() };
        for (let i = 1; i < headers.length; i++) rowObj[`y${i}`] = row[i] ?? "";
        return rowObj;
      });

      updateRowsWithHistory(newRows.length ? newRows : [{ x: "", y1: "" }]);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      {/* Toolbar remains unchanged */}
      <Toolbar mobileSidebarOpen={mobileSidebarOpen} setMobileSidebarOpen={setMobileSidebarOpen} />

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          rows={rows}
          onRowsChange={handleRowsChange}
          onFileUpload={handleFileUpload}
          addRow={addRow}
          removeRow={removeRow}
          addYColumn={addYColumn}
          chartType={chartType}
          setChartType={setChartType}
          chartSettings={chartSettings}
          setChartSettings={setChartSettings}
          mobileSidebarOpen={mobileSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Chart container */}
        <div className="flex-1 flex items-center justify-center p-2 overflow-auto">
          <div className="bg-white w-full max-w-full sm:max-w-md md:max-w-3xl lg:max-w-4xl h-[300px] sm:h-[400px] md:h-[450px] lg:h-[400px] shadow-md rounded">
            <Chart rows={rows} chartType={chartType} chartSettings={chartSettings} />
          </div>
        </div>
      </div>
    </>
  );
}
