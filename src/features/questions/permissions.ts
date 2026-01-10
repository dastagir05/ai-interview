// import { requireUserId } from "@/lib/auth";
// import { hasPermission } from "@/services/Oauth/lib/hasPermission";
// import { count, eq } from "drizzle-orm";

// export async function canCreateQuestion() {
//   return await Promise.any([
//     hasPermission("unlimited_questions").then(
//       (bool) => bool || Promise.reject()
//     ),
//     Promise.all([hasPermission("5_questions"), getUserQuestionCount()]).then(
//       ([has, c]) => {
//         if (has && c < 5) return true;
//         return Promise.reject();
//       }
//     ),
//   ]).catch(() => false);
// }

// async function getUserQuestionCount() {
//   const userId = await requireUserId();
//   if (userId == null) return 0;

//   return getQuestionCount(userId);
// }

// async function getQuestionCount(userId: string) {
//   return 2;
//   // const [{ count: c }] = await db
//   //   .select({ count: count() })
//   //   .from(QuestionTable)
//   //   .innerJoin(JobInfoTable, eq(QuestionTable.jobInfoId, JobInfoTable.id))
//   //   .where(eq(JobInfoTable.userId, userId));

//   // return Number(c) || 0;
// }
