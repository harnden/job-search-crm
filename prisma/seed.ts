import { PrismaClient, ActivityType, ApplicationStatus, CompanyTier } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.activity.deleteMany();
  await prisma.application.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();

  const northstar = await prisma.company.create({
    data: {
      name: "Northstar Analytics",
      domain: "northstaranalytics.com",
      tier: CompanyTier.Target,
      notes: "High-growth data platform with a strong product analytics team.",
      contacts: {
        create: {
          name: "Maya Chen",
          role: "Director of Product",
          email: "maya.chen@northstaranalytics.com",
          phone: "(415) 555-0142",
          lastContactDate: new Date("2026-10-20T15:30:00Z"),
          nextFollowUpDate: new Date("2026-10-30T15:30:00Z")
        }
      },
      applications: {
        create: {
          jobTitle: "Senior Product Analyst",
          jobUrl: "https://northstaranalytics.com/careers/senior-product-analyst",
          description: "Own product metrics and turn customer behavior into roadmap insights.",
          salaryTarget: 145000,
          status: ApplicationStatus.Screening,
          appliedDate: new Date("2026-10-14T12:00:00Z"),
          activities: {
            create: {
              type: ActivityType.Interview,
              notes: "Recruiter screen completed; technical interview scheduled for next week."
            }
          }
        }
      }
    }
  });

  const redwood = await prisma.company.create({
    data: {
      name: "Redwood Commerce",
      domain: "redwoodcommerce.io",
      tier: CompanyTier.Reach,
      notes: "Interesting marketplace business; monitor openings on the strategy team.",
      contacts: {
        create: {
          name: "Jordan Ellis",
          role: "Talent Partner",
          email: "jordan.ellis@redwoodcommerce.io",
          lastContactDate: new Date("2026-10-10T17:00:00Z"),
          nextFollowUpDate: new Date("2026-11-05T17:00:00Z")
        }
      },
      applications: {
        create: {
          jobTitle: "Strategy & Operations Manager",
          jobUrl: "https://redwoodcommerce.io/jobs/strategy-operations-manager",
          description: "Partner with leadership on growth initiatives and operating cadence.",
          salaryTarget: 135000,
          status: ApplicationStatus.Applied,
          appliedDate: new Date("2026-10-22T14:00:00Z"),
          activities: {
            create: {
              type: ActivityType.Email,
              notes: "Application submitted; send a concise follow-up to Jordan next week."
            }
          }
        }
      }
    }
  });

  console.log(`Seeded ${northstar.name} and ${redwood.name}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
