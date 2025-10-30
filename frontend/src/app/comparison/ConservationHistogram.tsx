'use client'

import { useEffect, useState } from 'react';

interface HistogramProps {
  geneName: string;
  scoreType: 'phastcons' | 'phylop';
}

interface HistogramDataPoint {
  nucleotide: string;
  phastcon_score: number;
  phylop_score: number;
}

const NUCLEOTIDE_COLORS: { [key: string]: string } = {
  'A': '#4caf50',  // green
  'T': '#f44336',  // red
  'G': '#ff9800',  // orange
  'C': '#2196f3',  // blue
  '-': '#9e9e9e',  // gray for gaps
};

export default function ConservationHistogram({ geneName, scoreType }: HistogramProps) {
  const [data, setData] = useState<HistogramDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/conservation_scores/histogram_data?species_name=Homo%20sapiens&gene_name=${encodeURIComponent(geneName)}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error('Error fetching histogram data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [geneName]);

  if (loading) {
    return (
      <div className="histogram-placeholder">
        Loading {scoreType === 'phastcons' ? 'PhastCons' : 'PhyloP'} data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="histogram-error">
        Error loading histogram: {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="histogram-placeholder">
        No data available
      </div>
    );
  }

  // Calculate min/max for scaling
  const scores = data.map(d => scoreType === 'phastcons' ? d.phastcon_score : d.phylop_score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const range = maxScore - minScore;

  const width = 600;
  const height = 200;
  const padding = 40;
  const barWidth = Math.max(1, (width - 2 * padding) / data.length);

  return (
    <div className="histogram-container">
      <svg width={width} height={height} className="histogram-svg">
        {/* Y-axis */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="var(--border-color)"
          strokeWidth={2}
        />

        {/* X-axis */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="var(--border-color)"
          strokeWidth={2}
        />

        {/* Y-axis labels */}
        <text
          x={padding - 30}
          y={padding}
          fontSize="12"
          fill="var(--main-text)"
          textAnchor="middle"
        >
          {maxScore.toFixed(2)}
        </text>
        <text
          x={padding - 30}
          y={height - padding}
          fontSize="12"
          fill="var(--main-text)"
          textAnchor="middle"
        >
          {minScore.toFixed(2)}
        </text>

        {/* Bars */}
        {data.map((point, index) => {
          const score = scoreType === 'phastcons' ? point.phastcon_score : point.phylop_score;
          const normalizedHeight = range !== 0
            ? ((score - minScore) / range) * (height - 2 * padding)
            : 0;

          const x = padding + index * barWidth;
          const y = height - padding - normalizedHeight;
          const color = NUCLEOTIDE_COLORS[point.nucleotide] || NUCLEOTIDE_COLORS['-'];

          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={barWidth}
              height={normalizedHeight}
              fill={color}
              opacity={0.8}
            >
              <title>{`${point.nucleotide}: ${score.toFixed(3)}`}</title>
            </rect>
          );
        })}

        {/* Title */}
        <text
          x={width / 2}
          y={20}
          fontSize="14"
          fontWeight="600"
          fill="var(--heading-color)"
          textAnchor="middle"
        >
          {scoreType === 'phastcons' ? 'PhastCons' : 'PhyloP'} Conservation Scores
        </text>
      </svg>

      <style jsx>{`
        .histogram-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 10px;
        }

        .histogram-svg {
          max-width: 100%;
          height: auto;
        }

        .histogram-placeholder,
        .histogram-error {
          padding: 40px 20px;
          text-align: center;
          color: var(--info-color);
          font-style: italic;
        }

        .histogram-error {
          color: var(--error-color);
        }
      `}</style>
    </div>
  );
}
