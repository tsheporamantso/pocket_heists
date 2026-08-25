// preview page for newly created UI components

import Skeleton from "@/components/Skeleton";
import Avatar from "@/components/Avatar";
import CreateHeistForm from "@/components/CreateHeistForm";
import HeistCard from "@/components/HeistCard";
import HeistCardSkeleton from "@/components/HeistCardSkeleton";
import type { Heist } from "@/types/firestore";

function makeSampleExpiredHeists(): Heist[] {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const twentySixHoursAgo = new Date(Date.now() - 26 * 60 * 60 * 1000);
  return [
    {
      id: "expired-success-1",
      createdAt: new Date("2026-08-10T09:00:00Z"),
      title: "Fridge Raid at Dawn",
      description: "Retrieve the last donut before standup.",
      createdBy: "user-1",
      createdByCodename: "Shadow",
      assignedTo: "user-2",
      assignedToCodename: "Phantom",
      deadline: threeDaysAgo,
      finalStatus: "success",
    },
    {
      id: "expired-failure-1",
      createdAt: new Date("2026-08-12T14:00:00Z"),
      title: "Stapler Smuggling Run",
      description: "Move the red stapler to desk 42 unnoticed.",
      createdBy: "user-3",
      createdByCodename: "Wraith",
      assignedTo: "user-1",
      assignedToCodename: "Specter",
      deadline: twentySixHoursAgo,
      finalStatus: "failure",
    },
  ];
}

export default function PreviewPage() {
  return (
    <div className="page-content">
      <h2>Preview</h2>
      <div className="my-4 max-w-3xl grid md:grid-cols-2 gap-5">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
      <div className="my-4 flex gap-3">
        <Avatar name="John" />
        <Avatar name="PascalCase" />
        <Avatar name="Jane Doe" />
      </div>
      <div className="my-4">
        <h3>CreateHeistForm</h3>
        <CreateHeistForm />
      </div>
      <div className="my-4">
        <h3>HeistCard (expired variant)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 max-w-5xl">
          {makeSampleExpiredHeists().map((heist) => (
            <HeistCard key={heist.id} heist={heist} variant="expired" />
          ))}
          <HeistCardSkeleton />
        </div>
      </div>
    </div>
  );
}
