import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

const Chart = ({ rows = [], chartType = 'bar', chartSettings = {} }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!rows || rows.length === 0) {
      if (chartRef.current) Plotly.purge(chartRef.current);
      return;
    }

    const chartNode = chartRef.current;

    const x = rows.map(r => r.x);
    const yKeys = Object.keys(rows[0]).filter(k => k.startsWith('y'));
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    const traces = yKeys.map((key, idx) => {
      const y = rows.map(r => {
        const n = Number(String(r[key] ?? '').replace(/,/g, '').trim());
        return Number.isFinite(n) ? n : 0;
      });

      switch (chartType) {
        // Basic Charts
        case 'bar':
          return { x, y, type: 'bar', name: key, marker: { color: colors[idx % colors.length] } };
        case 'hbar':
          return { x: y, y: x, type: 'bar', orientation: 'h', name: key, marker: { color: colors[idx % colors.length] } };
        case 'stacked-bar':
          return { x, y, type: 'bar', name: key, marker: { color: colors[idx % colors.length] } };
        case 'stacked-hbar':
          return { x: y, y: x, type: 'bar', orientation: 'h', name: key, marker: { color: colors[idx % colors.length] } };
        case 'grouped-bar':
          return { x, y, type: 'bar', name: key, marker: { color: colors[idx % colors.length] } };
        case 'line':
          return { x, y, type: 'scatter', mode: 'lines+markers', name: key, line: { color: colors[idx % colors.length] } };
        case 'line-smooth':
          return { x, y, type: 'scatter', mode: 'lines+markers', line: { shape: 'spline', color: colors[idx % colors.length] }, name: key };
        case 'area':
          return { x, y, type: 'scatter', mode: 'lines', fill: 'tozeroy', name: key, line: { color: colors[idx % colors.length] } };
        case 'area+marker':
          return { x, y, type: 'scatter', mode: 'lines+markers', fill: 'tozeroy', name: key, line: { color: colors[idx % colors.length] } };
        case 'scatter':
          return { x, y, mode: 'markers', type: 'scatter', name: key, marker: { color: colors[idx % colors.length] } };
        case 'bubble':
          return { x, y, mode: 'markers', type: 'scatter', name: key, marker: { size: y.map(v => Math.max(10, v)), color: colors[idx % colors.length] } };
        case 'histogram':
          return { x: y, type: 'histogram', name: key, marker: { color: colors[idx % colors.length] } };
        case 'box':
          return { y, type: 'box', boxpoints: 'all', jitter: 0.5, name: key, marker: { color: colors[idx % colors.length] } };
        case 'violin':
          return { y, type: 'violin', box: { visible: true }, line: { color: colors[idx % colors.length] }, name: key };
        case 'contour':
          return { z: y.map(v => [v]), type: 'contour', colorscale: 'Viridis', name: key };

        // Pie / Donut
        case 'pie':
          if (idx === 0) return {
            labels: x,
            values: y,
            type: 'pie',
            name: key,
            textinfo: 'label+value',
            texttemplate: `%{label}: %{value}${chartSettings.prefix || ''}`
          };
          return null;
        case 'donut':
          if (idx === 0) return {
            labels: x,
            values: y,
            type: 'pie',
            hole: 0.5,
            name: key,
            textinfo: 'label+value',
            texttemplate: `%{label}: %{value}${chartSettings.prefix || ''}`
          };
          return null;

        // 3D Charts
        case 'scatter3d': {
          const z = rows.map(r => Number(r['z'] ?? 0));
          return { x, y, z, mode: 'markers', type: 'scatter3d', marker: { color: colors[idx % colors.length] }, name: key };
        }
        case 'surface': {
          const zValues = rows.map(r => yKeys.map(k => Number(r[k] ?? 0)));
          return { z: zValues, type: 'surface', name: key };
        }

        // Polar / Funnel / Waterfall
        case 'polar':
          return { r: y, theta: x, type: 'scatterpolar', mode: 'lines+markers', name: key };
        case 'funnel':
          return { y: x, x: y, type: 'funnel', name: key };
        case 'waterfall':
          return { x, y, type: 'waterfall', name: key };

        // Heatmap
        case 'heatmap':
          return { x, y: [y], type: 'heatmap', colorscale: 'Viridis', name: key };

        // Financial Charts
        case 'candlestick': {
          const open = rows.map(r => Number(r.open ?? 0));
          const close = rows.map(r => Number(r.close ?? 0));
          const high = rows.map(r => Number(r.high ?? 0));
          const low = rows.map(r => Number(r.low ?? 0));
          return { x, open, close, high, low, type: 'candlestick', name: key };
        }
        case 'ohlc': {
          const open = rows.map(r => Number(r.open ?? 0));
          const close = rows.map(r => Number(r.close ?? 0));
          const high = rows.map(r => Number(r.high ?? 0));
          const low = rows.map(r => Number(r.low ?? 0));
          return { x, open, close, high, low, type: 'ohlc', name: key };
        }

        default:
          return { x, y, type: 'bar', name: key };
      }
    }).filter(Boolean);

    const layout = {
      title: {
        text: chartSettings?.title || `${chartType.toUpperCase()} Chart`,
        font: {
          size: 18,
          family: 'Arial, sans-serif',
          weight: chartSettings.titleFont || 'normal'
        },
        xanchor: 'center',
        yanchor: 'top',
        pad: { t: 5 }
      },
      xaxis: {
        title: { text: chartSettings?.xLabel || '', standoff: 10, font: { family: 'Arial', weight: chartSettings.labelFont } },
        automargin: true,
        tickpadding: 2,
        tickprefix: '',
        ticksuffix: chartSettings.prefix || '',
        range: chartSettings.minX != null && chartSettings.maxX != null ? [chartSettings.minX, chartSettings.maxX] : undefined
      },
      yaxis: {
        title: { text: chartSettings?.yLabel || '', standoff: 10, font: { family: 'Arial', weight: chartSettings.labelFont } },
        automargin: true,
        tickpadding: 2,
        tickprefix: '',
        ticksuffix: chartSettings.prefix || '',
        range: chartSettings.minY != null && chartSettings.maxY != null ? [chartSettings.minY, chartSettings.maxY] : undefined
      },
      annotations: chartSettings.source ? [{
        xref: 'paper',
        yref: 'paper',
        x: 1,
        y: -0.2,
        text: `Source: ${chartSettings.source}`,
        showarrow: false,
        xanchor: 'right',
        yanchor: 'top',
        font: { size: 12 }
      }] : [],
      autosize: true,
      margin: { t: 60, r: 20, b: 80, l: 70 },
      legend: { orientation: 'h', y: -0.3 }
    };

    if (['stacked-bar', 'stacked-hbar'].includes(chartType)) layout.barmode = 'stack';
    if (chartType === 'grouped-bar') layout.barmode = 'group';

    Plotly.newPlot(chartNode, traces, layout, {
      displayModeBar: false,
      responsive: true,
      scrollZoom: false,
      staticPlot: false,
      doubleClick: false,
      editable: false,
      dragMode: false
    });

    const handleResize = () => Plotly.Plots.resize(chartNode);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      Plotly.purge(chartNode);
    };
  }, [rows, chartType, chartSettings]);

  return <div id="plotly-chart" ref={chartRef} style={{ width: '100%', height: '100%' }} />;
};

export default Chart;
