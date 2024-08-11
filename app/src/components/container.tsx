export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center items-center">
      <div className="max-w-[1200px] w-full border ">{children}</div>
    </div>
  );
}
