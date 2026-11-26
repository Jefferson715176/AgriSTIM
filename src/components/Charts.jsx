import React from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: { legend: { position: 'bottom' } },
  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
}

export function SalesTrend({ labels, revenue, profit }) {
  return <div className="chart-frame" role="img" aria-label="Daily revenue and profit trend; exact values are in the sales table below."><Line data={{ labels, datasets: [
    { label: 'Revenue (₱)', data: revenue, borderColor: '#27834d', backgroundColor: '#27834d', tension: 0.2 },
    { label: 'Profit (₱)', data: profit, borderColor: '#a87420', backgroundColor: '#a87420', tension: 0.2 },
  ] }} options={{ ...baseOptions, scales: { ...baseOptions.scales, y: { beginAtZero: true } } }} /></div>
}

export function TopProducts({ labels, quantities }) {
  return <div className="chart-frame" role="img" aria-label="Top products by units sold; exact values are in the table below."><Bar data={{ labels, datasets: [{ label: 'Units sold', data: quantities, backgroundColor: '#4b9864', borderRadius: 4 }] }} options={{ ...baseOptions, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } }, y: { ticks: { autoSkip: false } } } }} /></div>
}

export function TemperatureTrend({ labels, readings, min, max }) {
  return <div className="chart-frame" role="img" aria-label="Temperature readings with minimum and maximum safe limits; exact readings are in the table below."><Line data={{ labels, datasets: [
    { label: 'Temperature (°C)', data: readings, borderColor: '#27834d', backgroundColor: '#27834d', tension: 0.15, pointRadius: 2 },
    { label: 'Minimum (°C)', data: labels.map(() => min), borderColor: '#4b83ba', borderDash: [5, 5], pointRadius: 0 },
    { label: 'Maximum (°C)', data: labels.map(() => max), borderColor: '#bc6b4f', borderDash: [5, 5], pointRadius: 0 },
  ] }} options={{ ...baseOptions, scales: { y: { title: { display: true, text: '°C' } } } }} /></div>
}
