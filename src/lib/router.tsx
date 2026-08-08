import { useEffect, useState, useCallback } from 'react';

function parseHash(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash || '/';
}

export function useRouter() {
  const [path, setPath] = useState(parseHash());

  useEffect(() => {
    const onChange = () => {
      setPath(parseHash());
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);

  return { path, navigate };
}

export function navigate(to: string) {
  window.location.hash = to;
}

export function Link({
  to,
  children,
  className,
  onClick,
  style,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <a
      href={`#${to}`}
      className={className}
      style={style}
      onClick={(e) => {
        e.preventDefault();
        window.location.hash = to;
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}
