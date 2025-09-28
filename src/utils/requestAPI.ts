const fetchGETApi = async (
  mainUrl: string,
  params: { [key: string]: any }
): Promise<any | {}> => {
  const paramStr = Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join("&");
  const url = `${import.meta.env.VITE_SERVER_HOST}/${mainUrl}?${paramStr}`;
  try {
    const response = await fetch(url);
    const result = await response.json();
    if (result.data) {
      return result.data;
    } else {
      throw new Error('API response does not contain "data" property');
    }
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

const fetchPOSTApi = async (
  mainUrl: string,
  bodyTemplate: string,
  params: { [key: string]: any }
): Promise<any | {}> => {
  const body = bodyTemplate.replace(
    /{(\w+)}/g,
    (_, key) => params[key]?.toString() || ""
  );
  const url = `${import.meta.env.VITE_SERVER_HOST}/${mainUrl}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    const result = await response.json();
    console.log(`fetchPOSTApi response:`, result);
    if (result?.data) {
      return result.data;
    } else {
      throw new Error('API response does not contain "data" property');
    }
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// const queryGETApi = async (
//   mainUrl: string,
//   params: { [key: string]: string | number | boolean }
// ): Promise<any | {}> => {
//   const paramStr = Object.keys(params)
//     .map(
//       (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
//     )
//     .join("&");
//   const url = `${import.meta.env.VITE_SERVER_HOST}/${mainUrl}?${paramStr}`;
//   const response = await fetch(url);
//   const result = await response.json();
//   if (!result.data || result.data.length === 0) {
//     return [];
//   }
//   const item = result.data;
//   return item;
// };

// const queryPOSTApi = async (
//   mainUrl: string,
//   bodyTemplate: string,
//   params: { [key: string]: string | number | boolean }
// ): Promise<any | {}> => {
//   const body = bodyTemplate.replace(
//     /{(\w+)}/g,
//     (_, key) => params[key]?.toString() || ""
//   );
//   const url = `${import.meta.env.VITE_SERVER_HOST}/${mainUrl}`;
//   const response = await fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: body,
//   });
//   const result = await response.json();
//   if (!result.data || result.data.length === 0) {
//     return [];
//   }
//   const item = result.data;
//   return item;
// };

export { fetchGETApi, fetchPOSTApi };
