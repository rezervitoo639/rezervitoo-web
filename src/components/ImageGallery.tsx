import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="aspect-[16/9] w-full">
        <img
          src={images[current]}
          alt={`Image ${current + 1}`}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 backdrop-blur-sm transition-colors hover:bg-card"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 backdrop-blur-sm transition-colors hover:bg-card"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${
                  i === current ? "w-6 bg-primary-foreground" : "w-2 bg-primary-foreground/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageGallery;
