import * as Slider from "@radix-ui/react-slider";

export default function RangeSlider() {
  return (
    <div className="w-64">
      <Slider.Root
        className="relative flex items-center w-full h-5"
        defaultValue={[25, 75]}
        min={0}
        max={100}
        step={1}
      >
        {/* Track (the background line) */}
        <Slider.Track className="bg-gray-300 relative grow rounded-full h-1">
          {/* Range (the highlighted area between thumbs) */}
          <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
        </Slider.Track>

        {/* Thumbs (the draggable handles) */}
        <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-pointer hover:bg-blue-100 focus:outline-none" />
        <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-pointer hover:bg-blue-100 focus:outline-none" />
      </Slider.Root>
    </div>
  );
}

