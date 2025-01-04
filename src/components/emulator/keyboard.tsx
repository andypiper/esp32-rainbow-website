import { useState } from 'react';
import keys from './keydefs';

function Key({ name, image }: { name: string, image: string }) {
  const [pressed, setPressed] = useState(false);
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    console.log(`Key ${name} pressed`);
    setPressed(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    console.log(`Key ${name} released`);
    setPressed(false);
  };

  const className = "w-full h-full" + (pressed ? ' opacity-50' : '');

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <img src={image} alt={name} className={className} />
    </div>
  );
}

export default function Keyboard() {
  return (
    <div className="w-full mt-4">
      {keys.map((row, index) => (
        <div key={index} className="flex flex-row items-center justify-center w-full">
          {row.map((key) => (
            <Key key={key.name} name={key.name} image={key.image} />
          ))}
        </div>
      ))}
    </div>
  );
}