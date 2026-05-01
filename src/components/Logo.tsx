import React from 'react';

const Logo: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <img
    src="/britinstitute_v1.png"
    alt="EdTech Logo"
    width={size}
    height={size}
    style={{ borderRadius: 8 }}
  />
);

export default Logo;
