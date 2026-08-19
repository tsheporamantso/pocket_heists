// preview page for newly created UI components

import Skeleton from "@/components/Skeleton";
import Avatar from "@/components/Avatar";

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
    </div>
  );
}
