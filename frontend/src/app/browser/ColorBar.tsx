import Tooltip from '../components/Tooltip';
import { useState } from 'react';

interface ColorSegment {
  type: string;
  width: number; 
  start: number; 
  end: number;
}

interface ColorBarProps {
    segments: ColorSegment[];
    color_mapping: { [key: string]: string };
    height?: number;
    width?: string;
}

const getBackgroundStyle = (color: string) => {
    if (color === 'stripes') {
        return {
            backgroundImage: `repeating-linear-gradient(
                45deg,
                #d42626ff,
                #e21818ff 10px,
                #cccccc 10px,
                #cccccc 20px
            )`
        };
    } else if (color === 'bars') {
        return {
            backgroundImage: `repeating-linear-gradient(
                90deg,
                #153be2ff,
                #0638dfff 10px,
                #cccccc 10px,
                #cccccc 20px
            )`
        };
    }
    return { backgroundColor: color };
};

export default function ColorBar({ segments, color_mapping,height = 30, width = '100%' }: ColorBarProps) {
    const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number; } | null>(null);

    return (
        <>
            <div style={{ width, height: `${height}px`, display: 'flex', overflow: 'hidden', borderRadius: '0px' }}>
                {segments.map((segment, index) => (
                    <div
                        key={index}
                        style={{
                            width: `${segment.width}%`,
                            height: '100%',
                            cursor: segment.type !== 'none' ? 'pointer' : 'default',
                            pointerEvents: segment.type !== 'none' ? 'auto' : 'none',
                            ...getBackgroundStyle(color_mapping[segment.type])
                        }}
                        onMouseEnter={(e) => {
                            if (segment.type !== "none") {
                                const text = `Type: ${segment.type}\nStart: ${segment.start}\nEnd: ${segment.end}`;
                                setTooltip({ text, x: e.clientX, y: e.clientY });
                            }
                        }}
                        onMouseMove={(e) => {
                            if (tooltip) {
                                setTooltip({ ...tooltip, x: e.clientX, y: e.clientY });
                            }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                    />
                ))}
            </div>
            <Tooltip tooltip={tooltip} />
        </>
    );
}
