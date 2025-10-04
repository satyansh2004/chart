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
    const yKeys = Object.keys(rows[0] || {}).filter(k => k.startsWith('y'));
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    // Only yaxis will have suffix
    const yTicksuffix = chartSettings.prefix || '';

    let traces = [];

    switch (chartType) {
      // ==================== BASIC CHARTS ====================
      case 'bar':
      case 'stacked-bar':
      case 'grouped-bar':
      case 'hbar':
      case 'stacked-hbar':
      case 'line':
      case 'line-smooth':
      case 'area':
      case 'area+marker':
      case 'scatter':
      case 'bubble':
      case 'histogram':
      case 'box':
      case 'violin':
      case 'polar':
      case 'funnel':
      case 'waterfall':
      case 'pie':
      case 'donut':
      case 'scatter3d':
      case 'surface': {
        traces = yKeys.map((key, idx) => {
          const y = rows.map(r => {
            const n = Number(String(r[key] ?? '').replace(/,/g, '').trim());
            return Number.isFinite(n) ? n : 0;
          });

          switch (chartType) {
            case 'bar':
            case 'stacked-bar':
            case 'grouped-bar':
              return { x, y, type: 'bar', name: key, marker: { color: colors[idx % colors.length] } };
            case 'hbar':
            case 'stacked-hbar':
              return { x: y, y: x, type: 'bar', orientation: 'h', name: key, marker: { color: colors[idx % colors.length] } };
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
            case 'polar':
              return { r: y, theta: x, type: 'scatterpolar', mode: 'lines+markers', name: key };
            case 'funnel':
              return { y: x, x: y, type: 'funnel', name: key };
            case 'waterfall':
              return { x, y, type: 'waterfall', name: key };
            case 'pie':
              if (idx === 0) return { labels: x, values: y, type: 'pie', textinfo: 'label+value' };
              return null;
            case 'donut':
              if (idx === 0) return { labels: x, values: y, type: 'pie', hole: 0.5, textinfo: 'label+value' };
              return null;
            case 'scatter3d': {
              const z = rows.map(r => Number(r['z'] ?? 0));
              return { x, y, z, mode: 'markers', type: 'scatter3d', marker: { color: colors[idx % colors.length] }, name: key };
            }
            case 'surface': {
              const zValues = rows.map(r => yKeys.map(k => Number(r[k] ?? 0)));
              return { z: zValues, type: 'surface', name: key };
            }
            default:
              return null;
          }
        }).filter(Boolean);
        break;
      }

      // ==================== HEATMAP ====================
      case 'heatmap': {
        const zMatrix = rows.map(r => yKeys.map(k => Number(r[k] ?? 0)));
        traces = [{
          x: yKeys,
          y: x,
          z: zMatrix,
          type: 'heatmap',
          colorscale: 'Viridis',
        }];
        break;
      }

      // ==================== CONTOUR ====================
      case 'contour': {
        const zMatrix = rows.map(r => yKeys.map(k => Number(r[k] ?? 0)));
        traces = [{
          x: yKeys,
          y: x,
          z: zMatrix,
          type: 'contour',
          colorscale: 'Viridis',
        }];
        break;
      }

      // ==================== CANDLESTICK / OHLC ====================
      case 'candlestick':
      case 'ohlc': {
        const open = rows.map(r => Number(r.y1 ?? 0));
        const high = rows.map(r => Number(r.y2 ?? 0));
        const low = rows.map(r => Number(r.y3 ?? 0));
        const close = rows.map(r => Number(r.y4 ?? 0));

        traces = [{
          x,
          open,
          high,
          low,
          close,
          type: chartType,
          name: 'Price'
        }];
        break;
      }

      default:
        break;
    }

    // ==================== LAYOUT ====================
    const layout = {
      title: {
        text: chartSettings?.title || `${chartType.toUpperCase()} Chart`,
        font: { size: 18, family: 'Arial, sans-serif', weight: chartSettings.titleFont || 'normal' },
        xanchor: 'center',
        yanchor: 'top',
        pad: { t: 5 }
      },
      xaxis: {
        title: {
          text: chartSettings?.xLabel || '',
          standoff: 10,
          font: { family: 'Arial', weight: chartSettings.labelFont }
        },
        automargin: true,
        range: chartSettings.minX != null && chartSettings.maxX != null
          ? [chartSettings.minX, chartSettings.maxX]
          : undefined
      },
      yaxis: {
        title: {
          text: chartSettings?.yLabel || '',
          standoff: 10,
          font: { family: 'Arial', weight: chartSettings.labelFont }
        },
        automargin: true,
        ticksuffix: yTicksuffix,
        range: chartSettings.minY != null && chartSettings.maxY != null
          ? [chartSettings.minY, chartSettings.maxY]
          : undefined
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