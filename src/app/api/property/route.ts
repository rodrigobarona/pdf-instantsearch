import { searchClient, indexName } from "@/config/typesense";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const lng = searchParams.get("lng") || "pt";

  if (!slug) {
    return new Response("Slug is required", { status: 400 });
  }

  try {
    // Build filter based on language
    let slugFilter = "";
    if (lng === "pt") {
      slugFilter = `slug_url:${slug}`;
    } else {
      slugFilter = `slug_url_${lng}:${slug} OR (slug_url:${slug} AND NOT _exists_:slug_url_${lng})`;
    }

    const results = await searchClient.search([
      {
        indexName,
        query: "",
        params: {
          filters: slugFilter,
          hitsPerPage: 1,
        },
      },
    ]);

    const property = results.results[0].hits[0];

    if (!property) {
      return new Response("Property not found", { status: 404 });
    }

    // If localized slug doesn't exist, create it from the default one
    if (lng !== "pt" && !property[`slug_url_${lng}`]) {
      property[`slug_url_${lng}`] = property.slug_url;
    }

    return Response.json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    return new Response("Error fetching property", { status: 500 });
  }
}
