import { useState } from 'react';
import ImageModal from './ImageModal';
import { Game } from '../../types/game';

interface Props {
  game: Game;
  getDisplayUrl: (file: Game['f'][0]) => string;
}

export default function ImageGallery({ game, getDisplayUrl }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!game.f.some(f => f.l.toLowerCase().match(/\.(scr|gif|png|jpg|jpeg)$/))) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Screenshots</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {game.f
          .filter(file => file.l.toLowerCase().match(/\.(scr|gif|png|jpg|jpeg)$/))
          .map((file, index) => (
            <div 
              key={index}
              className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => setSelectedImage(getDisplayUrl(file))}
            >
              <img
                src={getDisplayUrl(file)}
                alt={`Screenshot ${index + 1} of ${game.t}`}
                className={`absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110`}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-sm truncate">{file.y}</p>
              </div>
            </div>
          ))}
      </div>
      {selectedImage && (
        <ImageModal 
          imageUrl={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </section>
  );
} 