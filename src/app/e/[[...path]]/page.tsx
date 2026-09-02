import { EventShell } from "@/components/EventShell";

export function generateStaticParams() {
  return [{ path: [] }];
}

export default function Page() {
  return <EventShell />;
}
