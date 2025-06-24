'use client';

import { Icon } from '@iconify/react';

interface IconifyProps {
  icon: string;
  color?: string;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
}
const Iconify = (props: IconifyProps) => {
  const {
    icon,
    width = 24,
    height = 24,
    size = 24,
    className,
    color,
    onClick,
  } = props;

  return (
    <Icon
      icon={icon}
      color={color}
      onClick={onClick}
      className={className}
      width={size ? size : width}
      height={size ? size : height}
    />
  );
};

export default Iconify;
