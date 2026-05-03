const SkeletonCard = () => (
  <li className="flex flex-col bg-neutral-900 rounded-2xl overflow-hidden shadow-lg border border-neutral-800 animate-pulse">
    <div className="aspect-[3/4] w-full bg-neutral-800" />
    <div className="flex flex-col flex-1 p-3.5 gap-2">
      <div className="h-4 bg-neutral-800 rounded w-3/4 mb-1" />
      <div className="h-3 bg-neutral-800 rounded w-1/2" />
      <div className="mt-auto flex items-center pt-3">
        <div className="h-8 bg-neutral-800 rounded-xl w-full" />
      </div>
    </div>
  </li>
);

export default SkeletonCard;
