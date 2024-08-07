-- DropForeignKey
ALTER TABLE "TenantUserInvitation" DROP CONSTRAINT "TenantUserInvitation_createdUserId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "description" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "TenantUserInvitation" ADD COLUMN     "fromUserId" TEXT;

-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "createdByUserId" TEXT;

-- AlterTable
ALTER TABLE "WorkflowBlock" ADD COLUMN     "appliesToAllTenants" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WorkflowCredential" ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "WorkflowExecution" ADD COLUMN     "appliesToAllTenants" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "createdByUserId" TEXT;

-- AlterTable
ALTER TABLE "WorkflowVariable" ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "TenantUserInvitation" ADD CONSTRAINT "TenantUserInvitation_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUserInvitation" ADD CONSTRAINT "TenantUserInvitation_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowVariable" ADD CONSTRAINT "WorkflowVariable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowCredential" ADD CONSTRAINT "WorkflowCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
