const BASE_URL = 'https://unofficial-komikcast-api.vercel.app';

export const getSeries = async (offset, take = 20) => {
  const res = await fetch(`${BASE_URL}/series?offset=${offset}&take=${take}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch');
  }

  return res.json();
};

export const getSeriesDetail = async (slug) => {
  const res = await fetch(`${BASE_URL}/series/${slug}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch series detail');
  }

  return res.json();
};

export const getSeriesChapters = async (slug) => {
  const res = await fetch(`${BASE_URL}/series/${slug}/chapters`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch series chapters');
  }

  return res.json();
};

export const getChapterDetail = async (slug, chapterIndex) => {
  const res = await fetch(`${BASE_URL}/series/${slug}/chapters/${chapterIndex}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch chapter detail');
  }

  return res.json();
};
