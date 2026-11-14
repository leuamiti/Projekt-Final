import React from 'react';
import { View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

export default function LineChart({ data, width = 340, height = 180, color = '#4ade80' }) {
  if (!data || data.length < 2) return <View style={{ width, height }} />;

  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const pad = 8;

  const points = data
    .map((d, i) => {
      const x = pad + (i / (data.length - 1)) * (width - pad * 2);
      const y = pad + (1 - (d.price - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
    </Svg>
  );
}
