// const Dashboard = () => {
//   return (
//     <>
//       <div>Dashboard</div>
//       <ThemeToggle />
//       <button
//         className="bg-red-500 text-white px-3 py-2 cursor-pointer rounded text-sm hover:bg-red-700 transition-colors"
//         onClick={() => signOut({ callbackUrl: "/" })}
//       >
//         Sign Out
//       </button>
//     </>
//   );
// };

// export default Dashboard;

import JobInfos from "./JobInfos";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="h-screen-header flex items-center justify-center">
          <Loader2Icon className="size-24 animate-spin" />
        </div>
      }
    >
      <JobInfos />
    </Suspense>
  );
}
