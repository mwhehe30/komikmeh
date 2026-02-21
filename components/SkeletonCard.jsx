const SkeletonCard = () => (
  <li className="flex flex-col bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm border border-neutral-200 dark:border-neutral-800 animate-pulse">
    <div className="aspect-3/4 w-full bg-neutral-200 dark:bg-neutral-800" />
    <div className="flex flex-col flex-1 p-3.5 gap-2">
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-1" />
      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
      <div className="mt-auto flex items-center pt-3">
        <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded-full w-16" />
      </div>
    </div>
  </li>
);

export default SkeletonCard;
