import { IconTypes } from "./IconTypes";

export const StarSVG: React.FC<IconTypes> = ({
  color,
  height,
  width,
  className,
}) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 36 34"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M28.7818 21.7029C28.6179 21.8647 28.542 22.094 28.5799 22.3203L29.8898 31.6695C29.993 32.4158 29.6727 33.1591 29.055 33.6026C28.4388 34.0462 27.6252 34.1211 26.9362 33.7945L18.3259 29.6705C18.1195 29.5716 17.8797 29.5716 17.6732 29.6705L9.06295 33.7945C8.37389 34.1241 7.55731 34.0537 6.93652 33.6086C6.31725 33.1636 5.99701 32.4188 6.10176 31.6695L7.41161 22.3203C7.44955 22.094 7.37366 21.8647 7.20974 21.7029L0.592327 14.9012C0.0520072 14.3573 -0.136207 13.5616 0.100576 12.8378C0.337351 12.1125 0.962693 11.5775 1.72309 11.4486L11.1334 9.79128C11.3626 9.75381 11.5584 9.61145 11.6631 9.40765L16.1711 1.08343H16.1696C16.5308 0.416576 17.2335 0 18 0C18.7665 0 19.4692 0.416576 19.8304 1.08343L24.3384 9.40765H24.3369C24.4416 9.61145 24.6374 9.75381 24.8666 9.79128L34.2769 11.4486C35.0373 11.5775 35.6626 12.1125 35.8994 12.8378C36.1362 13.5616 35.948 14.3573 35.4077 14.9012L28.7818 21.7029Z"
        fill={color}
      />
    </svg>
  );
};