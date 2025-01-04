import keys from './keydefs';

function Key({ name, image }: { name: string, image: string }) {
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default to avoid unwanted behaviors
    console.log(`Key ${name} pressed`);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    console.log(`Key ${name} released`);
  };

  return (
    <div
      className=""
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img src={image} alt={name} className="w-full h-full" />
    </div>
  );
}

export default function Keyboard() {
  return <div className="flex flex-col items-center justify-center">
    {keys.map((row, index) => (
      <div key={index} className="flex flex-row items-center justify-center">
        {row.map((key) => (
          <Key key={key.name} name={key.name} image={key.image} />
        ))}
      </div>
    ))}
  </div>
}