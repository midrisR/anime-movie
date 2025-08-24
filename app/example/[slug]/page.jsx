import List from "../components/list";

export default async function Page({ params }) {
  const { slug } = await params;
  const res = await fetch(`${process.env.API_URL}/api/info?id=${slug}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  const { results } = await res.json();

  const server = await fetch(`${process.env.API_URL}/api/episodes/${slug}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  const data = await server.json();

  return (
    <div className="div">
      <div className="flex flex-wrap items-top">
        <div className="w-1/5">
          <img
            src={results.data.poster}
            alt={results.data.title}
            className="rounded-2xl "
          />
        </div>
        <div className="text-white w-2/3">
          <h1 className="text-3xl font-bold mb-4">{results.data.title}</h1>
          <p className="text-sm">{results.data.animeInfo.Overview}</p>
        </div>
      </div>
      <List data={data.results} />
    </div>
  );
}
