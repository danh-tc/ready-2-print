'use client';

import SizeInput, {Unit} from './SizeInput';

export default function SizeConfigurator() {
  const handleChange = (size: { width: number; height: number; unit: Unit }) => {
    console.log('Size selected:', size);
  };

  return (
    <div>
      <SizeInput label="Paper Size" onChange={handleChange} />
      <SizeInput label="Image Size" onChange={handleChange} />
    </div>
  );
}
