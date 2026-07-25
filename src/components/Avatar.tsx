import { ReactNode } from 'react';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<AvatarSize, number> = {
  sm: 36,
  md: 42,
  lg: 62,
  xl: 82,
};

type Props = {
  icon?: ReactNode;
  src?: string;
  alt?: string;
  size?: AvatarSize;
  /** light = pill translucent putih (dipakai di atas hero berwarna), brand = tinted hijau (di atas bg putih) */
  tone?: 'light' | 'brand';
};

/** Avatar bulat dengan fallback icon, dipakai di hero profil & baris entitas mana pun yang butuh avatar. */
const Avatar = ({ icon, src, alt = '', size = 'md', tone = 'brand' }: Props) => {
  const px = SIZE_MAP[size];
  const isLight = tone === 'light';

  return (
    <div
      className="d-flex align-items-center justify-content-center flex-shrink-0"
      style={{
        width: px,
        height: px,
        borderRadius: '50%',
        background: isLight ? 'rgba(255,255,255,0.18)' : 'var(--color-green-lighter)',
        color: isLight ? '#fff' : 'var(--color-green)',
        border: isLight ? '2px solid rgba(255,255,255,0.25)' : 'none',
        backdropFilter: isLight ? 'blur(10px)' : undefined,
        fontSize: px * 0.4,
        overflow: 'hidden',
      }}
    >
      {src ? (
        <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        icon
      )}
    </div>
  );
};

export default Avatar;
