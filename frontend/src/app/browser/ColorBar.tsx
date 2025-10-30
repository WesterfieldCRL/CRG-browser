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
        <div style={{ width, height: `${height}px`, display: 'flex', overflow: 'hidden', borderRadius: '0px' }}>
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
