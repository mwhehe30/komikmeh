const API_BASE_URL = 'https://unofficial-komikcast-api.vercel.app/komikcast';

export const getAllKomik = async (page = 1) => {
  const response = await fetch(`${API_BASE_URL}/${page}`, {
    next: {
      revalidate: 60,
    },
  });
  const { data, meta } = await response.json();
  return { data, meta };
};

export const getLatestKomik = async () => {
  const response = await fetch(`${API_BASE_URL}/latest`, {
    next: {
      revalidate: 60,
    },
  });
  const { data } = await response.json();
  return data;
};

export const getChapterImage = async (slug) => {
  const response = await fetch(`${API_BASE_URL}/chapter/${slug}`, {
    next: {
      revalidate: 60,
    },
  });
  const { data } = await response.json();
  return data;
};

export const getDetailKomik = async (slug) => {
  const response = await fetch(`${API_BASE_URL}/detail/${slug}`, {
    next: {
      revalidate: 60,
    },
  });
  const { data } = await response.json();
  return data;
};

export const SearchKomik = async (query, page = 1) => {
  const response = await fetch(
    `${API_BASE_URL}/search/?q=${query}&page=${page}`,
    {
      next: {
        revalidate: 60,
      },
    }
  );
  const { data, meta } = await response.json();
  return { data, meta };
};
