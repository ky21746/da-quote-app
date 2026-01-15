import React from 'react';

export default function VersionBadge() {
  const release = process.env.REACT_APP_RELEASE_VERSION || '0';
  const revision = process.env.REACT_APP_REVISION || '0';
  const sha = process.env.REACT_APP_GIT_SHA || '';

  const version = `217.${release}.${revision}`;

  return (
    <div className="fixed bottom-3 right-3 z-50 select-none rounded-md border border-black/20 bg-black/80 px-3 py-1.5 text-sm font-mono text-white shadow-lg backdrop-blur">
      {version}
      {sha ? ` (${sha})` : ''}
    </div>
  );
}
