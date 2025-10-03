import React, { useRef } from 'react';

const Sidebar = ({
    rows,
    onRowsChange,
    onFileUpload,
    addRow,
    removeRow,
    addYColumn,
    chartType,
    setChartType,
    chartSettings,
    setChartSettings,
    mobileSidebarOpen,          // ✅ add this
    // setMobileSidebarOpen,
}) => {

    const fileInputRef = useRef(null);

    const handleCellChange = (rowIdx, key, value) => {
        const newRows = [...rows];
        newRows[rowIdx][key] = value;
        onRowsChange(newRows);
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            onFileUpload(file);
            e.target.value = null;
        }
    };

    const handleSettingChange = (key, value) => {
        setChartSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleClearData = () => {
        onRowsChange([]);
        if (fileInputRef.current) fileInputRef.current.value = null;
    };

    return (
        <div
            className={`
    bg-gray-100 flex flex-col border-r overflow-y-auto custom-scrollbar
    fixed md:relative top-0 left-0 z-50 transform transition-transform duration-300
    ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
    md:translate-x-0 w-64 md:w-80
  `} style={{ maxHeight: '91dvh' }}
        >
            {/* Header Section */}
            <div className="p-4 border-b flex-shrink-0">
                <h2 className="text-lg font-semibold mb-3">📊 Data Editor</h2>

                {/* Upload Button */}
                <div className="flex gap-2">
                    <div className="mt-2 mb-4">
                        <label
                            htmlFor="file-upload"
                            className="bg-blue-600 text-white px-3 py-2 rounded cursor-pointer inline-block text-sm hover:bg-blue-700 transition"
                        >
                            📂 Upload File
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept=".csv, .xlsx, .xls"
                            onChange={handleFile}
                            ref={fileInputRef}
                            className="hidden"
                        />
                    </div>

                    <div className="mt-2 mb-4">
                        <label
                            htmlFor="clear-btn"
                            className="bg-red-600 text-white px-3 py-2 rounded cursor-pointer inline-block text-sm hover:bg-red-700 transition"
                        >
                            Clear Data
                        </label>
                        <button onClick={handleClearData} id='clear-btn'></button>
                    </div>
                </div>

                {/* Chart Type Dropdown */}
                <div className="mt-4">
                    <h2 className="text-lg font-semibold mb-3">Chart Type</h2>
                    <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="w-full border p-1 text-sm rounded"
                    >
                        {/* Basic Charts */}
                        <option value="bar">Bar</option>
                        <option value="hbar">Horizontal Bar</option>
                        <option value="stacked-bar">Stacked Bar</option>
                        <option value="stacked-hbar">Stacked Horizontal Bar</option>
                        <option value="line">Line</option>
                        <option value="line-smooth">Smoothed Line</option>
                        <option value="area">Area</option>
                        <option value="scatter">Scatter</option>
                        <option value="bubble">Bubble</option>
                        <option value="histogram">Histogram</option>
                        <option value="box">Box</option>
                        <option value="pie">Pie</option>
                        <option value="donut">Donut</option>

                        {/* Scientific / Statistical Charts */}
                        <option value="polar">Radar / Polar</option>
                        <option value="heatmap">Heatmap</option>
                        <option value="violin">Violin</option>
                        <option value="contour">Contour</option>

                        {/* Financial Charts */}
                        <option value="candlestick">Candlestick</option>
                        <option value="ohlc">OHLC</option>
                        <option value="waterfall">Waterfall</option>
                        <option value="funnel">Funnel</option>

                        {/* 3D Charts */}
                        <option value="scatter3d">3D Scatter</option>
                        <option value="surface">3D Surface</option>
                    </select>
                </div>
            </div>

            {/* Data Section - fixed height with scroll */}
            <div
                className="px-4 py-4 overflow-y-auto custom-scrollbar flex-shrink-0"
                style={{ height: '300px' }}
            >
                <div className="flex justify-between mb-4 bg-gray-100 z-10 pb-2">
                    <button
                        onClick={addRow}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                    >
                        + Row
                    </button>
                    <button
                        onClick={addYColumn}
                        className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                    >
                        + Y Column
                    </button>
                </div>

                {rows.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No data. Add a row or upload a file.</p>
                )}

                {rows.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex gap-1 mb-2">
                        <input
                            type="text"
                            value={row.x}
                            onChange={e => handleCellChange(rowIdx, 'x', e.target.value)}
                            className="border p-1 w-20 text-sm rounded"
                            placeholder="X"
                        />
                        {Object.keys(row)
                            .filter(k => k.startsWith('y'))
                            .map(key => (
                                <input
                                    key={key}
                                    type="number"
                                    value={row[key]}
                                    onChange={e => handleCellChange(rowIdx, key, e.target.value)}
                                    className="border p-1 w-16 text-sm rounded"
                                    placeholder={key.toUpperCase()}
                                />
                            ))}
                        <button
                            onClick={() => removeRow(rowIdx)}
                            className="text-red-500 font-bold hover:text-red-700"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="px-4 py-6 border-t flex-shrink-0">
                <h2 className="text-lg font-semibold mb-3">Labels</h2>
                <div id="titles" className="flex flex-col my-2 gap-4">
                    <div className="w-full flex flex-col">
                        <label htmlFor="main-title">Title</label>
                        <input
                            type="text"
                            id="main-title"
                            placeholder="Enter Title"
                            className="border rounded-sm p-1"
                            value={chartSettings.title}
                            onChange={e => handleSettingChange('title', e.target.value)}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <label htmlFor="x-title">X - Title</label>
                        <input
                            type="text"
                            id="x-title"
                            placeholder="Enter X - Title"
                            className="border rounded-sm p-1"
                            value={chartSettings.xLabel}
                            onChange={e => handleSettingChange('xLabel', e.target.value)}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <label htmlFor="y-title">Y - Title</label>
                        <input
                            type="text"
                            id="y-title"
                            placeholder="Enter Y - Title"
                            className="border rounded-sm p-1"
                            value={chartSettings.yLabel}
                            onChange={e => handleSettingChange('yLabel', e.target.value)}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <label htmlFor="source">Source</label>
                        <input
                            type="text"
                            id="source"
                            placeholder="Source"
                            className="border rounded-sm p-1"
                            value={chartSettings.source}
                            onChange={e => handleSettingChange('source', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="px-4 py-6 border-t flex-shrink-0">
                <h2 className="text-lg font-semibold mb-3">General Settings</h2>

                <div className="flex flex-col gap-4">
                    <div className="w-full flex flex-col">
                        <label htmlFor="max-y">Max - y</label>
                        <input
                            type="number"
                            id="max-y"
                            className="border rounded-sm p-1"
                            value={chartSettings.maxY}
                            onChange={e => handleSettingChange('maxY', Number(e.target.value))}
                        />
                    </div>

                    <div className="w-full flex flex-col">
                        <label htmlFor="min-y">Min - y</label>
                        <input
                            type="number"
                            id="min-y"
                            className="border rounded-sm p-1"
                            value={chartSettings.minY}
                            onChange={e => handleSettingChange('minY', Number(e.target.value))}
                        />
                    </div>

                    <div className="w-full flex flex-col">
                        <label htmlFor="prefix">Prefix</label>
                        <select
                            id="prefix"
                            className="w-full border p-2 text-sm rounded"
                            value={chartSettings.prefix}
                            onChange={e => handleSettingChange('prefix', e.target.value)}
                        >
                            <option value=""></option>
                            <option value="$">$</option>
                            <option value="€">€</option>
                            <option value="£">£</option>
                            <option value="¥">¥</option>
                            <option value="₹_">₹</option>
                            <option value="₿_">₿</option>
                            <option value="_%">%</option>
                            <option value="°C">°C</option>
                            <option value="°F">°F</option>
                            <option value="K">K</option>
                            <option value="pH">pH</option>
                            <option value="g">g</option>
                            <option value="G">G</option>
                            <option value="ml">ml</option>
                            <option value="l">l</option>
                            <option value="μm">μm</option>
                            <option value="cm">cm</option>
                            <option value="m">m</option>
                            <option value="km">km</option>
                            <option value="Pa">Pa</option>
                            <option value="J">J</option>
                            <option value="Bq">Bq</option>
                            <option value="Ω">Ω</option>
                            <option value="W">W</option>
                            <option value="A">A</option>
                            <option value="Hz">Hz</option>
                            <option value="V">V</option>
                        </select>
                    </div>

                    <div className="w-full flex flex-col">
                        <label htmlFor="title-font">Title Font</label>
                        <select
                            id="title-font"
                            className="w-full border p-2 text-sm rounded"
                            value={chartSettings.titleFont}
                            onChange={e => handleSettingChange('titleFont', e.target.value)}
                        >
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                            <option value="italic">Italic</option>
                        </select>
                    </div>

                    <div className="w-full flex flex-col">
                        <label htmlFor="label-font">Label Font</label>
                        <select
                            id="label-font"
                            className="w-full border p-2 text-sm rounded"
                            value={chartSettings.labelFont}
                            onChange={e => handleSettingChange('labelFont', e.target.value)}
                        >
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                            <option value="italic">Italic</option>
                        </select>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Sidebar;
