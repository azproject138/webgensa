import { getAnnouncementBar } from "@/lib/public-data";

interface AnnouncementBarProps {
  data: Awaited<ReturnType<typeof getAnnouncementBar>>;
}

export function AnnouncementBar({ data }: AnnouncementBarProps) {
  if (!data) return null;

  return (
    <div className="bg-orange text-warm-cream px-4 py-2 text-center text-xs font-medium uppercase tracking-wider sm:px-6 sm:py-2.5 sm:text-sm">
      {data.text}
    </div>
  );
}