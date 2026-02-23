import { ReactNode, Suspense, use } from "react";

export function SuspendedItem<T>({
  item,
  fallback,
  result,
}: {
  item: Promise<T>;
  fallback: ReactNode;
  result: (item: T) => ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      <InnerComponent item={item} result={result} />
    </Suspense>
  );
}

function InnerComponent<T>({
  item,
  result,
}: {
  item: Promise<T>;
  result: (item: T) => ReactNode;
}) {
  const value = use(item);
  return <>{result(value)}</>;
}
