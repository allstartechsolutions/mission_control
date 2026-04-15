import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const clientSeedData = [
  {
    companyName: "Northstar Logistics Group",
    logoPath: "NL",
    addressLine1: "4850 Industrial Loop",
    city: "Dallas",
    state: "TX",
    zipCode: "75247",
    country: "USA",
    phone: "(214) 555-0143",
    mobile: "(214) 555-0198",
    whatsapp: "+1 214 555 0198",
    primaryContactName: "Melissa Grant",
    primaryContactTitle: "Director of Operations",
    primaryContactEmail: "melissa.grant@northstarlg.com",
    primaryContactPhone: "(214) 555-0143",
    status: "active",
    employees: [
      { name: "Melissa Grant", title: "Director of Operations", email: "melissa.grant@northstarlg.com", phone: "(214) 555-0143", mobile: "(214) 555-0198", whatsapp: "+1 214 555 0198", profileImagePath: "MG", status: "active" },
      { name: "Andre Wallace", title: "Warehouse Systems Lead", email: "andre.wallace@northstarlg.com", phone: "(214) 555-0148", mobile: "(214) 555-0126", whatsapp: "+1 214 555 0126", profileImagePath: "AW", status: "active" },
      { name: "Priya Patel", title: "Regional Account Manager", email: "priya.patel@northstarlg.com", phone: "(214) 555-0154", mobile: "(214) 555-0131", whatsapp: "+1 214 555 0131", profileImagePath: "PP", status: "active" },
    ],
  },
  {
    companyName: "BlueHarbor Medical Supply",
    logoPath: "BM",
    addressLine1: "112 Harbor View Ave",
    addressLine2: "Suite 400",
    city: "Tampa",
    state: "FL",
    zipCode: "33602",
    country: "USA",
    phone: "(813) 555-0117",
    mobile: "(813) 555-0171",
    whatsapp: "+1 813 555 0171",
    primaryContactName: "Dr. Elaine Foster",
    primaryContactTitle: "Procurement Director",
    primaryContactEmail: "elaine.foster@blueharbormed.com",
    primaryContactPhone: "(813) 555-0117",
    status: "active",
    employees: [
      { name: "Dr. Elaine Foster", title: "Procurement Director", email: "elaine.foster@blueharbormed.com", phone: "(813) 555-0117", mobile: "(813) 555-0171", whatsapp: "+1 813 555 0171", profileImagePath: "EF", status: "active" },
      { name: "Marco Ruiz", title: "Clinical Systems Coordinator", email: "marco.ruiz@blueharbormed.com", phone: "(813) 555-0118", mobile: "(813) 555-0164", whatsapp: "+1 813 555 0164", profileImagePath: "MR", status: "active" },
      { name: "Tanya Owens", title: "Facilities Buyer", email: "tanya.owens@blueharbormed.com", phone: "(813) 555-0130", mobile: "(813) 555-0104", whatsapp: "+1 813 555 0104", profileImagePath: "TO", status: "active" },
      { name: "Chris Lam", title: "Biomedical Support Specialist", email: "chris.lam@blueharbormed.com", phone: "(813) 555-0188", mobile: "(813) 555-0182", whatsapp: "+1 813 555 0182", profileImagePath: "CL", status: "active" },
    ],
  },
  {
    companyName: "Summit Peak Construction",
    logoPath: "SP",
    addressLine1: "780 Summit Ridge Rd",
    city: "Denver",
    state: "CO",
    zipCode: "80216",
    country: "USA",
    phone: "(303) 555-0162",
    mobile: "(303) 555-0179",
    whatsapp: "+1 303 555 0179",
    primaryContactName: "Jonathan Reeves",
    primaryContactTitle: "VP, Project Delivery",
    primaryContactEmail: "jonathan.reeves@summitpeakco.com",
    primaryContactPhone: "(303) 555-0162",
    status: "active",
    employees: [
      { name: "Jonathan Reeves", title: "VP, Project Delivery", email: "jonathan.reeves@summitpeakco.com", phone: "(303) 555-0162", mobile: "(303) 555-0179", whatsapp: "+1 303 555 0179", profileImagePath: "JR", status: "active" },
      { name: "Sofia Kim", title: "Field Operations Manager", email: "sofia.kim@summitpeakco.com", phone: "(303) 555-0141", mobile: "(303) 555-0170", whatsapp: "+1 303 555 0170", profileImagePath: "SK", status: "active" },
    ],
  },
  {
    companyName: "Crescent Hospitality Partners",
    logoPath: "CH",
    addressLine1: "930 Royal Crescent Blvd",
    addressLine2: "Floor 8",
    city: "New Orleans",
    state: "LA",
    zipCode: "70130",
    country: "USA",
    phone: "(504) 555-0120",
    mobile: "(504) 555-0183",
    whatsapp: "+1 504 555 0183",
    primaryContactName: "Alicia Monroe",
    primaryContactTitle: "Corporate IT Manager",
    primaryContactEmail: "alicia.monroe@crescenthp.com",
    primaryContactPhone: "(504) 555-0120",
    status: "onboarding",
    employees: [
      { name: "Alicia Monroe", title: "Corporate IT Manager", email: "alicia.monroe@crescenthp.com", phone: "(504) 555-0120", mobile: "(504) 555-0183", whatsapp: "+1 504 555 0183", profileImagePath: "AM", status: "active" },
      { name: "Peter Voss", title: "Property Systems Analyst", email: "peter.voss@crescenthp.com", phone: "(504) 555-0129", mobile: "(504) 555-0174", whatsapp: "+1 504 555 0174", profileImagePath: "PV", status: "active" },
      { name: "Nina Brooks", title: "Guest Experience Technology Lead", email: "nina.brooks@crescenthp.com", phone: "(504) 555-0152", mobile: "(504) 555-0185", whatsapp: "+1 504 555 0185", profileImagePath: "NB", status: "active" },
    ],
  },
  {
    companyName: "Redwood Financial Advisors",
    logoPath: "RF",
    addressLine1: "225 Market Plaza",
    addressLine2: "Suite 900",
    city: "Charlotte",
    state: "NC",
    zipCode: "28202",
    country: "USA",
    phone: "(704) 555-0102",
    mobile: "(704) 555-0187",
    whatsapp: "+1 704 555 0187",
    primaryContactName: "Lauren Bishop",
    primaryContactTitle: "Chief Compliance Officer",
    primaryContactEmail: "lauren.bishop@redwoodfa.com",
    primaryContactPhone: "(704) 555-0102",
    status: "active",
    employees: [
      { name: "Lauren Bishop", title: "Chief Compliance Officer", email: "lauren.bishop@redwoodfa.com", phone: "(704) 555-0102", mobile: "(704) 555-0187", whatsapp: "+1 704 555 0187", profileImagePath: "LB", status: "active" },
      { name: "Evan Price", title: "Security Program Manager", email: "evan.price@redwoodfa.com", phone: "(704) 555-0159", mobile: "(704) 555-0180", whatsapp: "+1 704 555 0180", profileImagePath: "EP", status: "active" },
    ],
  },
  {
    companyName: "Orbit Retail Labs",
    logoPath: "OR",
    addressLine1: "61 Innovation Way",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    country: "USA",
    phone: "(512) 555-0146",
    mobile: "(512) 555-0181",
    whatsapp: "+1 512 555 0181",
    primaryContactName: "Devon Miles",
    primaryContactTitle: "Head of Store Technology",
    primaryContactEmail: "devon.miles@orbitretail.com",
    primaryContactPhone: "(512) 555-0146",
    status: "inactive",
    employees: [
      { name: "Devon Miles", title: "Head of Store Technology", email: "devon.miles@orbitretail.com", phone: "(512) 555-0146", mobile: "(512) 555-0181", whatsapp: "+1 512 555 0181", profileImagePath: "DM", status: "inactive" },
      { name: "Heidi Lawson", title: "Retail Systems Architect", email: "heidi.lawson@orbitretail.com", phone: "(512) 555-0111", mobile: "(512) 555-0101", whatsapp: "+1 512 555 0101", profileImagePath: "HL", status: "inactive" },
      { name: "Marcus Green", title: "Deployment Coordinator", email: "marcus.green@orbitretail.com", phone: "(512) 555-0177", mobile: "(512) 555-0162", whatsapp: "+1 512 555 0162", profileImagePath: "MG", status: "inactive" },
    ],
  },
];

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@allstartech.com" },
    update: {
      name: "JR",
      password: hashedPassword,
      role: "admin",
      phone: "(214) 555-0100",
      mobile: "(214) 555-0199",
      whatsapp: "+1 214 555 0199",
      status: "active",
    },
    create: {
      name: "JR",
      email: "admin@allstartech.com",
      password: hashedPassword,
      role: "admin",
      phone: "(214) 555-0100",
      mobile: "(214) 555-0199",
      whatsapp: "+1 214 555 0199",
      status: "active",
    },
  });

  const hulkUser = await prisma.user.upsert({
    where: { email: "hulk@allstartech.com" },
    update: {
      name: "Hulk AllStar",
      password: hashedPassword,
      role: "user",
      status: "active",
    },
    create: {
      name: "Hulk AllStar",
      email: "hulk@allstartech.com",
      password: hashedPassword,
      role: "user",
      status: "active",
    },
  });

  await prisma.projectMilestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.clientEmployee.deleteMany();
  await prisma.client.deleteMany();

  const createdClients: Array<{ id: string; companyName: string; employees: Array<{ id: string; name: string }> }> = [];

  for (const client of clientSeedData) {
    const { employees, ...clientData } = client;

    const createdClient = await prisma.client.create({
      data: {
        ...clientData,
        employees: {
          create: employees,
        },
      },
      include: {
        employees: {
          select: {
            id: true,
            name: true,
          },
          orderBy: { name: "asc" },
        },
      },
    });

    createdClients.push({
      id: createdClient.id,
      companyName: createdClient.companyName,
      employees: createdClient.employees,
    });
  }

  const northstar = createdClients.find((c) => c.companyName === "Northstar Logistics Group");
  const blueHarbor = createdClients.find((c) => c.companyName === "BlueHarbor Medical Supply");
  const summitPeak = createdClients.find((c) => c.companyName === "Summit Peak Construction");
  const crescent = createdClients.find((c) => c.companyName === "Crescent Hospitality Partners");
  const redwood = createdClients.find((c) => c.companyName === "Redwood Financial Advisors");

  // Helper to find an employee by name within a client
  const emp = (client: typeof createdClients[number] | undefined, name: string) =>
    client?.employees.find((e) => e.name === name);

  // --- Northstar Logistics Group ---
  if (northstar) {
    await prisma.project.create({
      data: {
        name: "Warehouse Mobility Rollout",
        clientId: northstar.id,
        requesterId: emp(northstar, "Melissa Grant")?.id,
        status: "active",
        priority: "high",
        description: "<p>Roll out rugged tablets, barcode workflows, and dispatch dashboards across Northstar warehouse teams.</p><p><strong>Primary goal:</strong> reduce pick-pack lag and improve real-time inventory visibility.</p>",
        estimatedPrice: 48500,
        finalPrice: 51250,
        startDate: new Date("2026-04-07T00:00:00.000Z"),
        dueDate: new Date("2026-05-20T00:00:00.000Z"),
        milestones: {
          create: [
            {
              title: "Discovery and site walkthrough",
              description: "Confirm floor coverage, workflows, and device readiness.",
              status: "done",
              sortOrder: 1,
              dueDate: new Date("2026-04-10T00:00:00.000Z"),
              estimatedPrice: 7500,
              finalPrice: 7800,
            },
            {
              title: "Pilot deployment",
              description: "Stand up the first warehouse pilot with training and feedback loops.",
              status: "active",
              sortOrder: 2,
              dueDate: new Date("2026-04-22T00:00:00.000Z"),
              estimatedPrice: 16000,
            },
            {
              title: "Full rollout",
              description: "Expand the approved configuration to remaining warehouse teams.",
              status: "planned",
              sortOrder: 3,
              dueDate: new Date("2026-05-20T00:00:00.000Z"),
              estimatedPrice: 25000,
            },
          ],
        },
      },
    });

    await prisma.project.create({
      data: {
        name: "Network Infrastructure Refresh",
        clientId: northstar.id,
        requesterId: emp(northstar, "Andre Wallace")?.id,
        status: "active",
        priority: "critical",
        description: "<p>Replace aging Cisco switches and Wi-Fi access points across all three DFW warehouse facilities. Upgrade backbone to 10GbE and deploy centralized management via Meraki dashboard.</p><p>Current infrastructure is past end-of-life and causing intermittent outages during peak shipping hours.</p>",
        estimatedPrice: 72000,
        startDate: new Date("2026-03-15T00:00:00.000Z"),
        dueDate: new Date("2026-05-30T00:00:00.000Z"),
        milestones: {
          create: [
            {
              title: "Site surveys and cable audit",
              description: "Document existing cabling, port counts, and AP placement at all three sites.",
              status: "done",
              sortOrder: 1,
              dueDate: new Date("2026-03-25T00:00:00.000Z"),
              estimatedPrice: 8500,
              finalPrice: 8500,
            },
            {
              title: "Equipment procurement",
              description: "Order switches, APs, and cabling. Coordinate vendor lead times.",
              status: "done",
              sortOrder: 2,
              dueDate: new Date("2026-04-05T00:00:00.000Z"),
              estimatedPrice: 38000,
              finalPrice: 39200,
            },
            {
              title: "Warehouse A cutover",
              description: "Install and configure new stack at primary warehouse during maintenance window.",
              status: "active",
              sortOrder: 3,
              dueDate: new Date("2026-04-20T00:00:00.000Z"),
              estimatedPrice: 9000,
            },
            {
              title: "Warehouses B & C cutover",
              description: "Roll out identical config to secondary and overflow facilities.",
              status: "planned",
              sortOrder: 4,
              dueDate: new Date("2026-05-10T00:00:00.000Z"),
              estimatedPrice: 12000,
            },
            {
              title: "Monitoring and handoff",
              description: "Validate uptime for 14 days, hand off Meraki dashboard credentials, and close out.",
              status: "planned",
              sortOrder: 5,
              dueDate: new Date("2026-05-30T00:00:00.000Z"),
              estimatedPrice: 4500,
            },
          ],
        },
      },
    });
  }

  // --- BlueHarbor Medical Supply ---
  if (blueHarbor) {
    await prisma.project.create({
      data: {
        name: "Clinical Inventory Command Center",
        clientId: blueHarbor.id,
        requesterId: emp(blueHarbor, "Dr. Elaine Foster")?.id,
        status: "planned",
        priority: "medium",
        description: "<p>Build a centralized inventory and replenishment command center for BlueHarbor clinical operations.</p><ul><li>Dashboard standardization</li><li>Approval paths</li><li>Vendor reporting</li></ul>",
        estimatedPrice: 36200,
        startDate: new Date("2026-04-28T00:00:00.000Z"),
        dueDate: new Date("2026-06-15T00:00:00.000Z"),
        milestones: {
          create: [
            {
              title: "Process mapping",
              description: "Map replenishment and exception handling across departments.",
              status: "planned",
              sortOrder: 1,
              dueDate: new Date("2026-05-05T00:00:00.000Z"),
              estimatedPrice: 8200,
            },
            {
              title: "Dashboard build",
              description: "Create inventory dashboards, thresholds, and review views.",
              status: "planned",
              sortOrder: 2,
              dueDate: new Date("2026-05-27T00:00:00.000Z"),
              estimatedPrice: 18000,
            },
          ],
        },
      },
    });

    await prisma.project.create({
      data: {
        name: "HIPAA Workstation Hardening",
        clientId: blueHarbor.id,
        requesterId: emp(blueHarbor, "Marco Ruiz")?.id,
        status: "active",
        priority: "critical",
        description: "<p>Audit and harden all 140+ clinical workstations to meet updated HIPAA Security Rule requirements. Includes full-disk encryption enforcement, USB lockdown, and endpoint detection rollout.</p><p>Triggered by findings from the Q1 compliance review.</p>",
        estimatedPrice: 28500,
        startDate: new Date("2026-03-20T00:00:00.000Z"),
        dueDate: new Date("2026-05-15T00:00:00.000Z"),
        milestones: {
          create: [
            {
              title: "Workstation inventory and gap analysis",
              description: "Scan all endpoints, document current encryption status, and identify non-compliant machines.",
              status: "done",
              sortOrder: 1,
              dueDate: new Date("2026-03-28T00:00:00.000Z"),
              estimatedPrice: 4200,
              finalPrice: 4200,
            },
            {
              title: "Policy deployment via Intune",
              description: "Push BitLocker, USB restriction, and EDR agent policies to all managed devices.",
              status: "done",
              sortOrder: 2,
              dueDate: new Date("2026-04-08T00:00:00.000Z"),
              estimatedPrice: 6800,
              finalPrice: 7100,
            },
            {
              title: "Remediation of non-compliant devices",
              description: "Manually image or replace machines that failed automated policy application.",
              status: "active",
              sortOrder: 3,
              dueDate: new Date("2026-04-25T00:00:00.000Z"),
              estimatedPrice: 10500,
            },
            {
              title: "Compliance validation and report",
              description: "Run final compliance scan, generate executive report for BlueHarbor compliance team.",
              status: "planned",
              sortOrder: 4,
              dueDate: new Date("2026-05-15T00:00:00.000Z"),
              estimatedPrice: 7000,
            },
          ],
        },
      },
    });

    await prisma.project.create({
      data: {
        name: "Biomedical Device Network Segmentation",
        clientId: blueHarbor.id,
        requesterId: emp(blueHarbor, "Chris Lam")?.id,
        status: "completed",
        priority: "high",
        description: "<p>Segment biomedical devices (infusion pumps, imaging systems, lab analyzers) onto isolated VLANs with firewall rules restricting lateral movement. Required by insurer after a peer facility had a ransomware incident.</p>",
        estimatedPrice: 19500,
        finalPrice: 20100,
        startDate: new Date("2026-01-10T00:00:00.000Z"),
        dueDate: new Date("2026-03-15T00:00:00.000Z"),
        milestones: {
          create: [
            {
              title: "Device discovery and classification",
              description: "Identify all networked biomed devices and classify by risk tier.",
              status: "done",
              sortOrder: 1,
              dueDate: new Date("2026-01-24T00:00:00.000Z"),
              estimatedPrice: 5000,
              finalPrice: 5000,
            },
            {
              title: "VLAN design and firewall rules",
              description: "Design segmentation architecture and write ACL/firewall policy.",
              status: "done",
              sortOrder: 2,
              dueDate: new Date("2026-02-10T00:00:00.000Z"),
              estimatedPrice: 6500,
              finalPrice: 6500,
            },
            {
              title: "Implementation and testing",
              description: "Apply VLAN changes during maintenance window, validate device connectivity.",
              status: "done",
              sortOrder: 3,
              dueDate: new Date("2026-02-28T00:00:00.000Z"),
              estimatedPrice: 5500,
              finalPrice: 6100,
            },
            {
              title: "Documentation and insurer report",
              description: "Deliver network diagrams, test results, and compliance attestation letter.",
              status: "done",
              sortOrder: 4,
              dueDate: new Date("2026-03-15T00:00:00.000Z"),
              estimatedPrice: 2500,
              finalPrice: 2500,
            },
          ],
        },
      },
    });
  }

  // --- Summit Peak Construction ---
  if (summitPeak) {
    await prisma.project.create({
      data: {
        name: "Field Delivery Standards Program",
        clientId: summitPeak.id,
        requesterId: emp(summitPeak, "Jonathan Reeves")?.id,
        status: "on_hold",
        priority: "high",
        description: "<p>Standardize field delivery, approvals, and closeout reporting across active Summit Peak jobsites.</p>",
        estimatedPrice: 21800,
        dueDate: new Date("2026-06-01T00:00:00.000Z"),
        milestones: {
          create: [
            {
              title: "Standards review",
              description: "Align the rollout approach with operations leadership.",
              status: "planned",
              sortOrder: 1,
              dueDate: new Date("2026-04-30T00:00:00.000Z"),
              estimatedPrice: 6000,
            },
          ],
        },
      },
    });

    await prisma.project.create({
      data: {
        name: "Jobsite Connectivity Kits",
        clientId: summitPeak.id,
        requesterId: emp(summitPeak, "Sofia Kim")?.id,
        status: "active",
        priority: "medium",
        description: "<p>Design and deploy portable connectivity kits (Cradlepoint LTE routers, mesh Wi-Fi, weatherproof enclosures) for remote Summit Peak jobsites that lack reliable internet.</p><p>Each kit should be self-contained and deployable by a field crew without IT on-site.</p>",
        estimatedPrice: 34000,
        startDate: new Date("2026-04-01T00:00:00.000Z"),
        dueDate: new Date("2026-06-15T00:00:00.000Z"),
        milestones: {
          create: [
            {
              title: "Kit design and BOM",
              description: "Finalize bill of materials, enclosure specs, and power requirements.",
              status: "done",
              sortOrder: 1,
              dueDate: new Date("2026-04-10T00:00:00.000Z"),
              estimatedPrice: 4500,
              finalPrice: 4500,
            },
            {
              title: "Prototype build and field test",
              description: "Assemble first kit, deploy to active jobsite, and validate coverage and uptime.",
              status: "active",
              sortOrder: 2,
              dueDate: new Date("2026-04-28T00:00:00.000Z"),
              estimatedPrice: 7500,
            },
            {
              title: "Production run (10 kits)",
              description: "Order components and assemble remaining kits for deployment pool.",
              status: "planned",
              sortOrder: 3,
              dueDate: new Date("2026-05-20T00:00:00.000Z"),
              estimatedPrice: 18000,
            },
            {
              title: "Deployment guide and training",
              description: "Create field deployment guide and train operations team on setup/teardown.",
              status: "planned",
              sortOrder: 4,
              dueDate: new Date("2026-06-15T00:00:00.000Z"),
              estimatedPrice: 4000,
            },
          ],
        },
      },
    });
  }

  // --- Crescent Hospitality Partners ---
  if (crescent) {
    await prisma.project.create({
      data: {
        name: "Property Management System Migration",
        clientId: crescent.id,
        requesterId: emp(crescent, "Alicia Monroe")?.id,
        status: "planned",
        priority: "high",
        description: "<p>Migrate Crescent's five hotel properties from legacy on-prem PMS (Opera v5) to cloud-hosted Oracle OPERA Cloud. Includes data migration, staff training, and POS/PBX integration testing at each property.</p><p>Timeline driven by Opera v5 end-of-support in Q3 2026.</p>",
        estimatedPrice: 89000,
        startDate: new Date("2026-05-01T00:00:00.000Z"),
        dueDate: new Date("2026-09-30T00:00:00.000Z"),
        milestones: {
          create: [
            {
              title: "Environment provisioning and data mapping",
              description: "Stand up OPERA Cloud tenants, map legacy data fields, and define migration rules.",
              status: "planned",
              sortOrder: 1,
              dueDate: new Date("2026-05-20T00:00:00.000Z"),
              estimatedPrice: 12000,
            },
            {
              title: "Pilot migration — Flagship property",
              description: "Migrate the French Quarter flagship property first. Run parallel operations for two weeks.",
              status: "planned",
              sortOrder: 2,
              dueDate: new Date("2026-06-20T00:00:00.000Z"),
              estimatedPrice: 22000,
            },
            {
              title: "Integration testing (POS, PBX, door locks)",
              description: "Validate all integrations at the pilot site before proceeding to remaining properties.",
              status: "planned",
              sortOrder: 3,
              dueDate: new Date("2026-07-10T00:00:00.000Z"),
              estimatedPrice: 15000,
            },
            {
              title: "Remaining properties rollout",
              description: "Migrate four remaining properties in two-week sprints.",
              status: "planned",
              sortOrder: 4,
              dueDate: new Date("2026-09-01T00:00:00.000Z"),
              estimatedPrice: 32000,
            },
            {
              title: "Decommission legacy servers",
              description: "Shut down on-prem Opera servers, archive data, and close out vendor contracts.",
              status: "planned",
              sortOrder: 5,
              dueDate: new Date("2026-09-30T00:00:00.000Z"),
              estimatedPrice: 8000,
            },
          ],
        },
      },
    });

    await prisma.project.create({
      data: {
        name: "Guest Wi-Fi and Captive Portal Upgrade",
        clientId: crescent.id,
        requesterId: emp(crescent, "Nina Brooks")?.id,
        status: "active",
        priority: "medium",
        description: "<p>Upgrade guest-facing Wi-Fi across all Crescent properties. Replace aging Ruckus APs with Aruba Instant On, deploy branded captive portal with loyalty program integration, and ensure PCI-compliant segmentation between guest and corporate networks.</p>",
        estimatedPrice: 41000,
        startDate: new Date("2026-03-25T00:00:00.000Z"),
        dueDate: new Date("2026-06-01T00:00:00.000Z"),
        milestones: {
          create: [
            {
              title: "RF survey and AP placement",
              description: "Conduct heat-map surveys at all properties and finalize AP mounting locations.",
              status: "done",
              sortOrder: 1,
              dueDate: new Date("2026-04-05T00:00:00.000Z"),
              estimatedPrice: 6000,
              finalPrice: 6200,
            },
            {
              title: "Captive portal design and branding",
              description: "Build branded splash page with loyalty opt-in, terms acceptance, and bandwidth tiers.",
              status: "done",
              sortOrder: 2,
              dueDate: new Date("2026-04-12T00:00:00.000Z"),
              estimatedPrice: 5500,
              finalPrice: 5500,
            },
            {
              title: "Flagship property installation",
              description: "Install APs, configure SSIDs, and validate captive portal at French Quarter location.",
              status: "active",
              sortOrder: 3,
              dueDate: new Date("2026-04-25T00:00:00.000Z"),
              estimatedPrice: 10000,
            },
            {
              title: "Remaining properties rollout",
              description: "Install at four remaining properties using documented playbook.",
              status: "planned",
              sortOrder: 4,
              dueDate: new Date("2026-05-20T00:00:00.000Z"),
              estimatedPrice: 16000,
            },
            {
              title: "PCI segmentation validation",
              description: "Run third-party segmentation scan and deliver compliance documentation.",
              status: "planned",
              sortOrder: 5,
              dueDate: new Date("2026-06-01T00:00:00.000Z"),
              estimatedPrice: 3500,
            },
          ],
        },
      },
    });
  }

  // --- Redwood Financial Advisors ---
  if (redwood) {
    await prisma.project.create({
      data: {
        name: "SOC 2 Readiness and Evidence Collection",
        clientId: redwood.id,
        requesterId: emp(redwood, "Lauren Bishop")?.id,
        status: "active",
        priority: "critical",
        description: "<p>Prepare Redwood Financial for SOC 2 Type II audit. Implement missing controls, automate evidence collection, and coordinate with external auditors from Schellman.</p><p>Board has mandated audit completion by end of Q2 to satisfy institutional client requirements.</p>",
        estimatedPrice: 54000,
        startDate: new Date("2026-02-15T00:00:00.000Z"),
        dueDate: new Date("2026-06-30T00:00:00.000Z"),
        milestones: {
          create: [
            {
              title: "Gap assessment",
              description: "Map current controls against SOC 2 Trust Services Criteria. Identify gaps.",
              status: "done",
              sortOrder: 1,
              dueDate: new Date("2026-03-01T00:00:00.000Z"),
              estimatedPrice: 8000,
              finalPrice: 8000,
            },
            {
              title: "Control implementation",
              description: "Implement missing controls: MFA enforcement, access reviews, change management, incident response.",
              status: "done",
              sortOrder: 2,
              dueDate: new Date("2026-03-25T00:00:00.000Z"),
              estimatedPrice: 16000,
              finalPrice: 17200,
            },
            {
              title: "Evidence automation",
              description: "Deploy Vanta or Drata for continuous monitoring and automated evidence collection.",
              status: "active",
              sortOrder: 3,
              dueDate: new Date("2026-04-20T00:00:00.000Z"),
              estimatedPrice: 12000,
            },
            {
              title: "Observation period",
              description: "Maintain controls for 60-day observation window required for Type II.",
              status: "planned",
              sortOrder: 4,
              dueDate: new Date("2026-06-10T00:00:00.000Z"),
              estimatedPrice: 6000,
            },
            {
              title: "Auditor fieldwork support",
              description: "Support Schellman auditors with evidence requests, walkthroughs, and remediation.",
              status: "planned",
              sortOrder: 5,
              dueDate: new Date("2026-06-30T00:00:00.000Z"),
              estimatedPrice: 12000,
            },
          ],
        },
      },
    });

    await prisma.project.create({
      data: {
        name: "Email Security and Phishing Defense",
        clientId: redwood.id,
        requesterId: emp(redwood, "Evan Price")?.id,
        status: "completed",
        priority: "high",
        description: "<p>Deploy advanced email security stack for Redwood Financial: Proofpoint gateway, DMARC enforcement, and quarterly phishing simulation program. Initiated after a near-miss BEC attempt targeting the wire transfer team.</p>",
        estimatedPrice: 18500,
        finalPrice: 19000,
        startDate: new Date("2026-01-05T00:00:00.000Z"),
        dueDate: new Date("2026-03-10T00:00:00.000Z"),
        milestones: {
          create: [
            {
              title: "Proofpoint deployment",
              description: "Configure Proofpoint Essentials, update MX records, tune spam/threat policies.",
              status: "done",
              sortOrder: 1,
              dueDate: new Date("2026-01-18T00:00:00.000Z"),
              estimatedPrice: 7000,
              finalPrice: 7000,
            },
            {
              title: "DMARC/DKIM/SPF enforcement",
              description: "Publish DMARC record at p=quarantine, monitor for 30 days, then move to p=reject.",
              status: "done",
              sortOrder: 2,
              dueDate: new Date("2026-02-15T00:00:00.000Z"),
              estimatedPrice: 4500,
              finalPrice: 4500,
            },
            {
              title: "Phishing simulation baseline",
              description: "Run first KnowBe4 phishing campaign, establish click-rate baseline, deliver awareness training.",
              status: "done",
              sortOrder: 3,
              dueDate: new Date("2026-03-10T00:00:00.000Z"),
              estimatedPrice: 7000,
              finalPrice: 7500,
            },
          ],
        },
      },
    });
  }

  await prisma.suggestion.upsert({
    where: { id: "employees-improvement-suggestion" },
    update: {
      title: "Employees module improvements for operational use",
      body:
        "Top recommendations:\n\n1. Role + escalation metadata\nAdd fields like decision-maker, billing contact, technical contact, onsite contact, emergency contact, and escalation tier. This makes dispatch and client communication faster immediately.\n\n2. Location and site assignment\nLet each employee be tied to one or more client sites, offices, or properties. AllStar will need to know who belongs to which location before sending techs or coordinating work.\n\n3. Communication preferences\nTrack preferred channel, best contact hours, after-hours availability, and do-not-contact flags. This is high practical value for support, outages, and follow-up.\n\n4. Service/system ownership\nAdd structured ownership tags like network, printers, cameras, Microsoft 365, ISP, line-of-business app, approvals. This turns employees into accountable contacts for real workstreams.\n\n5. Notes + relationship history\nAdd internal notes, last contacted date, last touched by, and interaction log. Without this, team knowledge stays in people’s heads instead of Mission Control.\n\n6. Document and credential-adjacent records\nNot passwords, but things like NDA on file, onboarding docs, badge/access status, vendor portal access, MFA required, approval authority. Very useful operationally.\n\n7. Quick actions from the employee record\nOne-click call, email, SMS/WhatsApp, copy contact info, and “create ticket/project for this contact.” That would make the module feel connected to the work instead of isolated.\n\n8. Statuses beyond active/inactive\nAdd statuses like primary, backup, onboarding, former employee, no longer authorized, unreachable. AllStar needs operational clarity, not just alive/dead records.",
      category: "Internal improvement",
      area: "Employees module",
      impact: "High",
      effort: "Medium",
      whyItMatters:
        "The Employees area needs to support dispatch, support, approvals, and account coordination, not just store names and phone numbers. These additions make the record operationally useful during real work.",
      expectedOutcome:
        "Mission Control should show who owns what, where they belong, how to reach them, and what actions the team can take immediately from the employee record.",
      linkedProject: "Employees operational improvements",
      decisionNotes: "Keep this suggestion attributed to Hulk AllStar and use it as the actionable reference for the Employees module improvement pass.",
      status: "under_review",
      suggestedById: hulkUser.id,
      clientId: null,
    },
    create: {
      id: "employees-improvement-suggestion",
      title: "Employees module improvements for operational use",
      body:
        "Top recommendations:\n\n1. Role + escalation metadata\nAdd fields like decision-maker, billing contact, technical contact, onsite contact, emergency contact, and escalation tier. This makes dispatch and client communication faster immediately.\n\n2. Location and site assignment\nLet each employee be tied to one or more client sites, offices, or properties. AllStar will need to know who belongs to which location before sending techs or coordinating work.\n\n3. Communication preferences\nTrack preferred channel, best contact hours, after-hours availability, and do-not-contact flags. This is high practical value for support, outages, and follow-up.\n\n4. Service/system ownership\nAdd structured ownership tags like network, printers, cameras, Microsoft 365, ISP, line-of-business app, approvals. This turns employees into accountable contacts for real workstreams.\n\n5. Notes + relationship history\nAdd internal notes, last contacted date, last touched by, and interaction log. Without this, team knowledge stays in people’s heads instead of Mission Control.\n\n6. Document and credential-adjacent records\nNot passwords, but things like NDA on file, onboarding docs, badge/access status, vendor portal access, MFA required, approval authority. Very useful operationally.\n\n7. Quick actions from the employee record\nOne-click call, email, SMS/WhatsApp, copy contact info, and “create ticket/project for this contact.” That would make the module feel connected to the work instead of isolated.\n\n8. Statuses beyond active/inactive\nAdd statuses like primary, backup, onboarding, former employee, no longer authorized, unreachable. AllStar needs operational clarity, not just alive/dead records.",
      category: "Internal improvement",
      area: "Employees module",
      impact: "High",
      effort: "Medium",
      whyItMatters:
        "The Employees area needs to support dispatch, support, approvals, and account coordination, not just store names and phone numbers. These additions make the record operationally useful during real work.",
      expectedOutcome:
        "Mission Control should show who owns what, where they belong, how to reach them, and what actions the team can take immediately from the employee record.",
      linkedProject: "Employees operational improvements",
      decisionNotes: "Keep this suggestion attributed to Hulk AllStar and use it as the actionable reference for the Employees module improvement pass.",
      status: "under_review",
      suggestedById: hulkUser.id,
      clientId: null,
    },
  });

  console.log(`Seed complete: admin@allstartech.com / password123, ${clientSeedData.length} clients created, employees suggestion upserted`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
