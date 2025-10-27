interface ColorSegment {
    color: string;
    width: number; // as a percentage of total width
}

interface ColorBarProps {
    segments: ColorSegment[];
    height?: number;
    width?: string;
}

export default function ColorBar({ segments, height = 30, width = '100%' }: ColorBarProps) {
    return (
        <div style={{
            width,
            height: `${height}px`,
            display: 'flex',
            overflow: 'hidden',
            borderRadius: '4px',
            border: '1px solid var(--border-color, rgba(11,17,18,0.08))',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            {segments.map((segment, index) => (
                <div
                    key={index}
                    style={{
                        width: `${segment.width}%`,
                        height: '100%',
                        backgroundColor: segment.color
                    }}
                />
            ))}
        </div>
    );
}