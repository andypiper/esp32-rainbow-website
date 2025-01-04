import { useState } from 'react';
import keys from './keydefs';

function Key({ name, image, onUpdateKey }: { name: string, image: string, onUpdateKey: (key: string, pressed: boolean) => void }) {
  const [pressed, setPressed] = useState(false);
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setPressed(true);
    onUpdateKey(name, true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setPressed(false);
    onUpdateKey(name, false);
  };

  const className = "w-full h-full" + (pressed ? ' opacity-50' : '');

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        touchAction: 'none'
      }}
    >
      <img src={image} alt={name} className={className} draggable="false" />
    </div>
  );
}

export default function Keyboard({ onUpdateKey }: { onUpdateKey: (key: string, pressed: boolean) => void }) {
  return (
    <div className="w-full mt-4">
      {keys.map((row, index) => (
        <div key={index} className="flex flex-row items-center justify-center w-full">
          {row.map((key) => (
            <Key key={key.name} name={key.name} image={key.image} onUpdateKey={onUpdateKey} />
          ))}
        </div>
      ))}
    </div>
  );
}