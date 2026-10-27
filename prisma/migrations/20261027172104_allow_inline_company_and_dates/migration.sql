-- SQLite does not allow a non-constant default when adding a column. Rebuild
-- the table so the schema can retain the desired CURRENT_TIMESTAMP default.
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "jobUrl" TEXT,
    "description" TEXT,
    "salaryTarget" INTEGER,
    "status" TEXT NOT NULL,
    "discoveredDate" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "appliedDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Application" ("id", "companyId", "jobTitle", "jobUrl", "description", "salaryTarget", "status", "discoveredDate", "appliedDate", "createdAt", "updatedAt")
SELECT "id", "companyId", "jobTitle", "jobUrl", "description", "salaryTarget", "status", CURRENT_TIMESTAMP, "appliedDate", "createdAt", "updatedAt"
FROM "Application";

DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE INDEX "Application_discoveredDate_idx" ON "Application"("discoveredDate");
