--
-- PostgreSQL database dump
--

\restrict kjhTXtF5CN58LFQagrpgHEd4V1GxTI3FBDYQ3Zu6G24l39ZvrGfgfvPbI8xYeQ4

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: TaskBillingType; Type: TYPE; Schema: public; Owner: mission_control
--

CREATE TYPE public."TaskBillingType" AS ENUM (
    'none',
    'fixed',
    'hourly'
);


ALTER TYPE public."TaskBillingType" OWNER TO mission_control;

--
-- Name: TaskExecutorType; Type: TYPE; Schema: public; Owner: mission_control
--

CREATE TYPE public."TaskExecutorType" AS ENUM (
    'human',
    'hulk',
    'agent',
    'automation'
);


ALTER TYPE public."TaskExecutorType" OWNER TO mission_control;

--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: mission_control
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'scheduled',
    'in_progress',
    'waiting',
    'completed',
    'canceled'
);


ALTER TYPE public."TaskStatus" OWNER TO mission_control;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: mission_control
--

CREATE TABLE public."Account" (
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Account" OWNER TO mission_control;

--
-- Name: Client; Type: TABLE; Schema: public; Owner: mission_control
--

CREATE TABLE public."Client" (
    id text NOT NULL,
    "companyName" text NOT NULL,
    "logoPath" text,
    "addressLine1" text,
    "addressLine2" text,
    city text,
    state text,
    "zipCode" text,
    country text,
    phone text,
    mobile text,
    whatsapp text,
    "primaryContactName" text,
    "primaryContactTitle" text,
    "primaryContactEmail" text,
    "primaryContactPhone" text,
    status text DEFAULT 'active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Client" OWNER TO mission_control;

--
-- Name: ClientEmployee; Type: TABLE; Schema: public; Owner: mission_control
--

CREATE TABLE public."ClientEmployee" (
    id text NOT NULL,
    "clientId" text NOT NULL,
    name text NOT NULL,
    title text,
    email text,
    phone text,
    mobile text,
    whatsapp text,
    "profileImagePath" text,
    status text DEFAULT 'active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "primaryLocationId" text
);


ALTER TABLE public."ClientEmployee" OWNER TO mission_control;

--
-- Name: ClientEmployeeLocation; Type: TABLE; Schema: public; Owner: mission_control
--

CREATE TABLE public."ClientEmployeeLocation" (
    "employeeId" text NOT NULL,
    "locationId" text NOT NULL
);


ALTER TABLE public."ClientEmployeeLocation" OWNER TO mission_control;

--
-- Name: ClientLocation; Type: TABLE; Schema: public; Owner: mission_control
--

CREATE TABLE public."ClientLocation" (
    id text NOT NULL,
    "clientId" text NOT NULL,
    name text NOT NULL,
    "addressLine1" text,
    "addressLine2" text,
    city text,
    state text,
    "zipCode" text,
    country text,
    phone text,
    status text DEFAULT 'active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ClientLocation" OWNER TO mission_control;

--
-- Name: Project; Type: TABLE; Schema: public; Owner: mission_control
--

CREATE TABLE public."Project" (
    id text NOT NULL,
    name text NOT NULL,
    "clientId" text NOT NULL,
    "requesterId" text,
    status text DEFAULT 'planned'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    description text,
    "estimatedPrice" numeric(12,2),
    "finalPrice" numeric(12,2),
    "startDate" timestamp(3) without time zone,
    "dueDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Project" OWNER TO mission_control;

--
-- Name: ProjectMilestone; Type: TABLE; Schema: public; Owner: mission_control
--

CREATE TABLE public."ProjectMilestone" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'planned'::text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "estimatedPrice" numeric(12,2),
    "finalPrice" numeric(12,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProjectMilestone" OWNER TO mission_control;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: mission_control
--

CREATE TABLE public."Session" (
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO mission_control;

--
-- Name: Suggestion; Type: TABLE; Schema: public; Owner: mission_control
--

CREATE TABLE public."Suggestion" (
    id text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    category text,
    area text,
    impact text,
    effort text,
    "whyItMatters" text,
    "expectedOutcome" text,
    "linkedProject" text,
    "decisionNotes" text,
    status text DEFAULT 'new'::text NOT NULL,
    "suggestedById" text NOT NULL,
    "clientId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "suggestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Suggestion" OWNER TO mission_control;

--
-- Name: SuggestionAttachment; Type: TABLE; Schema: public; Owner: mission_control
--

CREATE TABLE public."SuggestionAttachment" (
    id text NOT NULL,
    "suggestionId" text NOT NULL,
    "filePath" text NOT NULL,
    "fileName" text NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "storedName" text NOT NULL
);


ALTER TABLE public."SuggestionAttachment" OWNER TO mission_control;

--
-- Name: Task; Type: TABLE; Schema: public; Owner: mission_control
--

CREATE TABLE public."Task" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    status public."TaskStatus" DEFAULT 'scheduled'::public."TaskStatus" NOT NULL,
    "executorType" public."TaskExecutorType" DEFAULT 'human'::public."TaskExecutorType" NOT NULL,
    "billingType" public."TaskBillingType" DEFAULT 'none'::public."TaskBillingType" NOT NULL,
    billable boolean DEFAULT false NOT NULL,
    amount numeric(12,2),
    "billedAt" timestamp(3) without time zone,
    "startDate" timestamp(3) without time zone,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "createdById" text NOT NULL,
    "assignedToId" text NOT NULL,
    "clientId" text,
    "projectId" text,
    "milestoneId" text,
    "requesterEmployeeId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "cronEnabled" boolean DEFAULT false NOT NULL,
    "cronExpression" text,
    "cronLastRunAt" timestamp(3) without time zone,
    "cronNextRunAt" timestamp(3) without time zone,
    "cronTimezone" text
);


ALTER TABLE public."Task" OWNER TO mission_control;

--
-- Name: User; Type: TABLE; Schema: public; Owner: mission_control
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    role text DEFAULT 'user'::text NOT NULL,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    password text,
    mobile text,
    phone text,
    status text DEFAULT 'active'::text NOT NULL,
    whatsapp text
);


ALTER TABLE public."User" OWNER TO mission_control;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: mission_control
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO mission_control;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: mission_control
--

COPY public."Account" ("userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Client; Type: TABLE DATA; Schema: public; Owner: mission_control
--

COPY public."Client" (id, "companyName", "logoPath", "addressLine1", "addressLine2", city, state, "zipCode", country, phone, mobile, whatsapp, "primaryContactName", "primaryContactTitle", "primaryContactEmail", "primaryContactPhone", status, "createdAt", "updatedAt") FROM stdin;
cmo03hqlb0002n9sdvykyx640	Northstar Logistics Group	NL	4850 Industrial Loop	\N	Dallas	TX	75247	USA	(214) 555-0143	(214) 555-0198	+1 214 555 0198	Melissa Grant	Director of Operations	melissa.grant@northstarlg.com	(214) 555-0143	active	2026-04-15 13:37:32.639	2026-04-15 13:37:32.639
cmo03hqle0006n9sd3tqr7j97	BlueHarbor Medical Supply	BM	112 Harbor View Ave	Suite 400	Tampa	FL	33602	USA	(813) 555-0117	(813) 555-0171	+1 813 555 0171	Dr. Elaine Foster	Procurement Director	elaine.foster@blueharbormed.com	(813) 555-0117	active	2026-04-15 13:37:32.643	2026-04-15 13:37:32.643
cmo03hqlg000bn9sdul3i7rj5	Summit Peak Construction	SP	780 Summit Ridge Rd	\N	Denver	CO	80216	USA	(303) 555-0162	(303) 555-0179	+1 303 555 0179	Jonathan Reeves	VP, Project Delivery	jonathan.reeves@summitpeakco.com	(303) 555-0162	active	2026-04-15 13:37:32.645	2026-04-15 13:37:32.645
cmo03hqli000en9sdezgxg7u2	Crescent Hospitality Partners	CH	930 Royal Crescent Blvd	Floor 8	New Orleans	LA	70130	USA	(504) 555-0120	(504) 555-0183	+1 504 555 0183	Alicia Monroe	Corporate IT Manager	alicia.monroe@crescenthp.com	(504) 555-0120	onboarding	2026-04-15 13:37:32.647	2026-04-15 13:37:32.647
cmo03hqlk000in9sdv8d11a3h	Redwood Financial Advisors	RF	225 Market Plaza	Suite 900	Charlotte	NC	28202	USA	(704) 555-0102	(704) 555-0187	+1 704 555 0187	Lauren Bishop	Chief Compliance Officer	lauren.bishop@redwoodfa.com	(704) 555-0102	active	2026-04-15 13:37:32.648	2026-04-15 13:37:32.648
cmo03hqll000ln9sdubdsixlh	Orbit Retail Labs	OR	61 Innovation Way	\N	Austin	TX	78701	USA	(512) 555-0146	(512) 555-0181	+1 512 555 0181	Devon Miles	Head of Store Technology	devon.miles@orbitretail.com	(512) 555-0146	inactive	2026-04-15 13:37:32.65	2026-04-15 13:37:32.65
\.


--
-- Data for Name: ClientEmployee; Type: TABLE DATA; Schema: public; Owner: mission_control
--

COPY public."ClientEmployee" (id, "clientId", name, title, email, phone, mobile, whatsapp, "profileImagePath", status, "createdAt", "updatedAt", "primaryLocationId") FROM stdin;
cmo03hqlb0003n9sduusehyd7	cmo03hqlb0002n9sdvykyx640	Melissa Grant	Director of Operations	melissa.grant@northstarlg.com	(214) 555-0143	(214) 555-0198	+1 214 555 0198	MG	active	2026-04-15 13:37:32.639	2026-04-15 13:37:32.639	\N
cmo03hqlb0004n9sd0s9zq33f	cmo03hqlb0002n9sdvykyx640	Andre Wallace	Warehouse Systems Lead	andre.wallace@northstarlg.com	(214) 555-0148	(214) 555-0126	+1 214 555 0126	AW	active	2026-04-15 13:37:32.639	2026-04-15 13:37:32.639	\N
cmo03hqlb0005n9sd8vzh4akf	cmo03hqlb0002n9sdvykyx640	Priya Patel	Regional Account Manager	priya.patel@northstarlg.com	(214) 555-0154	(214) 555-0131	+1 214 555 0131	PP	active	2026-04-15 13:37:32.639	2026-04-15 13:37:32.639	\N
cmo03hqle0007n9sdapkd5cl4	cmo03hqle0006n9sd3tqr7j97	Dr. Elaine Foster	Procurement Director	elaine.foster@blueharbormed.com	(813) 555-0117	(813) 555-0171	+1 813 555 0171	EF	active	2026-04-15 13:37:32.643	2026-04-15 13:37:32.643	\N
cmo03hqle0008n9sdssq0gyea	cmo03hqle0006n9sd3tqr7j97	Marco Ruiz	Clinical Systems Coordinator	marco.ruiz@blueharbormed.com	(813) 555-0118	(813) 555-0164	+1 813 555 0164	MR	active	2026-04-15 13:37:32.643	2026-04-15 13:37:32.643	\N
cmo03hqle0009n9sdme0y2nmv	cmo03hqle0006n9sd3tqr7j97	Tanya Owens	Facilities Buyer	tanya.owens@blueharbormed.com	(813) 555-0130	(813) 555-0104	+1 813 555 0104	TO	active	2026-04-15 13:37:32.643	2026-04-15 13:37:32.643	\N
cmo03hqle000an9sdox8hc045	cmo03hqle0006n9sd3tqr7j97	Chris Lam	Biomedical Support Specialist	chris.lam@blueharbormed.com	(813) 555-0188	(813) 555-0182	+1 813 555 0182	CL	active	2026-04-15 13:37:32.643	2026-04-15 13:37:32.643	\N
cmo03hqlg000cn9sdexpo3a1k	cmo03hqlg000bn9sdul3i7rj5	Jonathan Reeves	VP, Project Delivery	jonathan.reeves@summitpeakco.com	(303) 555-0162	(303) 555-0179	+1 303 555 0179	JR	active	2026-04-15 13:37:32.645	2026-04-15 13:37:32.645	\N
cmo03hqlg000dn9sd2wrprdn4	cmo03hqlg000bn9sdul3i7rj5	Sofia Kim	Field Operations Manager	sofia.kim@summitpeakco.com	(303) 555-0141	(303) 555-0170	+1 303 555 0170	SK	active	2026-04-15 13:37:32.645	2026-04-15 13:37:32.645	\N
cmo03hqli000fn9sd0nm16t7h	cmo03hqli000en9sdezgxg7u2	Alicia Monroe	Corporate IT Manager	alicia.monroe@crescenthp.com	(504) 555-0120	(504) 555-0183	+1 504 555 0183	AM	active	2026-04-15 13:37:32.647	2026-04-15 13:37:32.647	\N
cmo03hqli000gn9sd2islvt9l	cmo03hqli000en9sdezgxg7u2	Peter Voss	Property Systems Analyst	peter.voss@crescenthp.com	(504) 555-0129	(504) 555-0174	+1 504 555 0174	PV	active	2026-04-15 13:37:32.647	2026-04-15 13:37:32.647	\N
cmo03hqli000hn9sdpq43udbd	cmo03hqli000en9sdezgxg7u2	Nina Brooks	Guest Experience Technology Lead	nina.brooks@crescenthp.com	(504) 555-0152	(504) 555-0185	+1 504 555 0185	NB	active	2026-04-15 13:37:32.647	2026-04-15 13:37:32.647	\N
cmo03hqlk000jn9sdfhc768gg	cmo03hqlk000in9sdv8d11a3h	Lauren Bishop	Chief Compliance Officer	lauren.bishop@redwoodfa.com	(704) 555-0102	(704) 555-0187	+1 704 555 0187	LB	active	2026-04-15 13:37:32.648	2026-04-15 13:37:32.648	\N
cmo03hqlk000kn9sdhe93rgc2	cmo03hqlk000in9sdv8d11a3h	Evan Price	Security Program Manager	evan.price@redwoodfa.com	(704) 555-0159	(704) 555-0180	+1 704 555 0180	EP	active	2026-04-15 13:37:32.648	2026-04-15 13:37:32.648	\N
cmo03hqll000mn9sdi4mu1mei	cmo03hqll000ln9sdubdsixlh	Devon Miles	Head of Store Technology	devon.miles@orbitretail.com	(512) 555-0146	(512) 555-0181	+1 512 555 0181	DM	inactive	2026-04-15 13:37:32.65	2026-04-15 13:37:32.65	\N
cmo03hqll000nn9sd6njgmgc4	cmo03hqll000ln9sdubdsixlh	Heidi Lawson	Retail Systems Architect	heidi.lawson@orbitretail.com	(512) 555-0111	(512) 555-0101	+1 512 555 0101	HL	inactive	2026-04-15 13:37:32.65	2026-04-15 13:37:32.65	\N
cmo03hqlm000on9sdyjyd82bi	cmo03hqll000ln9sdubdsixlh	Marcus Green	Deployment Coordinator	marcus.green@orbitretail.com	(512) 555-0177	(512) 555-0162	+1 512 555 0162	MG	inactive	2026-04-15 13:37:32.65	2026-04-15 13:37:32.65	\N
\.


--
-- Data for Name: ClientEmployeeLocation; Type: TABLE DATA; Schema: public; Owner: mission_control
--

COPY public."ClientEmployeeLocation" ("employeeId", "locationId") FROM stdin;
\.


--
-- Data for Name: ClientLocation; Type: TABLE DATA; Schema: public; Owner: mission_control
--

COPY public."ClientLocation" (id, "clientId", name, "addressLine1", "addressLine2", city, state, "zipCode", country, phone, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: mission_control
--

COPY public."Project" (id, name, "clientId", "requesterId", status, priority, description, "estimatedPrice", "finalPrice", "startDate", "dueDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProjectMilestone; Type: TABLE DATA; Schema: public; Owner: mission_control
--

COPY public."ProjectMilestone" (id, "projectId", title, description, status, "sortOrder", "dueDate", "estimatedPrice", "finalPrice", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: mission_control
--

COPY public."Session" ("sessionToken", "userId", expires, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Suggestion; Type: TABLE DATA; Schema: public; Owner: mission_control
--

COPY public."Suggestion" (id, title, body, category, area, impact, effort, "whyItMatters", "expectedOutcome", "linkedProject", "decisionNotes", status, "suggestedById", "clientId", "createdAt", "updatedAt", "suggestedAt") FROM stdin;
cmnz8t3k40001n9f2p9kexdha	Make milestones durable instead of delete-and-recreate on every project edit	Project edits currently wipe all milestones and recreate them. That breaks milestone continuity, invalidates references, and makes future milestone-linked history or task rollups fragile. Replace the destructive reset with true create, update, reorder, and archive behavior per milestone record.	Product improvement	Projects / Milestones	high	medium	Milestones should be stable delivery objects. If IDs change every edit, we cannot trust milestone history, task linkage, reporting, or audit trails.	Milestones keep persistent IDs, edits become safe, linked tasks stay attached, and future reporting features have a reliable base.	Mission Control core operations	Implementation should diff incoming milestones against existing ones instead of deleting all. Add soft-delete or archive behavior for removed milestones.	new	cmnx0p6zk0000n9ps39seabc0	\N	2026-04-14 23:18:34.564	2026-04-14 23:18:34.564	2026-04-14 23:18:34.564
cmnz8t3k60003n9f2mib7vb8h	Add milestone progress and rollup metrics to the project workspace	The current milestone view lists title, status, due date, and pricing, but it does not tell JR what is moving or stuck. Add per-milestone progress driven by linked tasks, plus a project-level rollup showing completed milestones, blocked milestones, overdue milestones, and percent complete.	Product improvement	Projects / Milestones	high	medium	Milestones should help run projects, not just describe them. Without progress rollups, JR still has to mentally reconstruct project health.	Project pages become operational dashboards with visible progress, overdue risk, and milestone health at a glance.	Mission Control core operations	Best version derives progress from linked task statuses and shows counts like 6 of 10 tasks complete, 1 blocked, 2 overdue.	new	cmnx0p6zk0000n9ps39seabc0	\N	2026-04-14 23:18:34.567	2026-04-14 23:18:34.567	2026-04-14 23:18:34.567
cmnz8t3k80005n9f2v3vctzvt	Give milestones owners, dependencies, and risk flags	Milestones only capture title, notes, dates, and pricing today. Add fields for owner, dependency on another milestone, blockers, and a risk flag so the module can represent actual delivery sequencing instead of a flat checklist.	Product improvement	Projects / Milestones	high	medium	Most project trouble comes from unclear ownership and hidden sequencing. Milestones need enough metadata to expose who owns what and what is holding the next phase up.	JR can spot stalled handoffs faster, sequence work more accurately, and see risk before dates slip.	Mission Control core operations	Start with owner, dependsOnMilestoneId, blockerSummary, and riskLevel fields. Surface these directly in the project overview.	new	cmnx0p6zk0000n9ps39seabc0	\N	2026-04-14 23:18:34.568	2026-04-14 23:18:34.568	2026-04-14 23:18:34.568
employees-improvement-suggestion	Employees module improvements for operational use	Top recommendations:\n\n1. Role + escalation metadata\nAdd fields like decision-maker, billing contact, technical contact, onsite contact, emergency contact, and escalation tier. This makes dispatch and client communication faster immediately.\n\n2. Location and site assignment\nLet each employee be tied to one or more client sites, offices, or properties. AllStar will need to know who belongs to which location before sending techs or coordinating work.\n\n3. Communication preferences\nTrack preferred channel, best contact hours, after-hours availability, and do-not-contact flags. This is high practical value for support, outages, and follow-up.\n\n4. Service/system ownership\nAdd structured ownership tags like network, printers, cameras, Microsoft 365, ISP, line-of-business app, approvals. This turns employees into accountable contacts for real workstreams.\n\n5. Notes + relationship history\nAdd internal notes, last contacted date, last touched by, and interaction log. Without this, team knowledge stays in people’s heads instead of Mission Control.\n\n6. Document and credential-adjacent records\nNot passwords, but things like NDA on file, onboarding docs, badge/access status, vendor portal access, MFA required, approval authority. Very useful operationally.\n\n7. Quick actions from the employee record\nOne-click call, email, SMS/WhatsApp, copy contact info, and “create ticket/project for this contact.” That would make the module feel connected to the work instead of isolated.\n\n8. Statuses beyond active/inactive\nAdd statuses like primary, backup, onboarding, former employee, no longer authorized, unreachable. AllStar needs operational clarity, not just alive/dead records.	Internal improvement	Employees module	High	Medium	The Employees area needs to support dispatch, support, approvals, and account coordination, not just store names and phone numbers. These additions make the record operationally useful during real work.	Mission Control should show who owns what, where they belong, how to reach them, and what actions the team can take immediately from the employee record.	Employees operational improvements	Keep this suggestion attributed to Hulk AllStar and use it as the actionable reference for the Employees module improvement pass.	under_review	cmnx0p6zk0000n9ps39seabc0	\N	2026-04-14 13:08:43.091	2026-04-15 13:46:40.949	2026-04-14 13:08:43.091
cmnz8t3k90007n9f2zalvqtx7	Upgrade Suggestions into an actionable planning queue, not just an idea log	The suggestion module already captures good metadata, but it stops short of execution. Add next action, target owner, priority score, and a convert-to-task or convert-to-project action so accepted suggestions move directly into delivery instead of getting stranded as writeups.	Workflow improvement	Suggestions	high	medium	Useful ideas die when there is no handoff into execution. Suggestions should become the top of the planning funnel, not a dead-end archive.	Accepted suggestions can be triaged, assigned, and converted into real work with less copy-paste and less follow-up loss.	Mission Control core operations	Recommended additions: nextAction, ownerId, priorityScore, dueReviewAt, and conversion buttons for task/project/sprint planning.	new	cmnx0p6zk0000n9ps39seabc0	\N	2026-04-14 23:18:34.569	2026-04-14 23:18:34.569	2026-04-14 23:18:34.569
cmnz8t3ka0009n9f2cwxiarmf	Add milestone-to-suggestion feedback loop for reusable project lessons	When a milestone slips, gets blocked, or finishes with a better pattern, JR should be able to create a suggestion directly from that milestone context. Pre-fill project, milestone, client, and decision notes so delivery lessons become reusable system improvements.	Workflow improvement	Projects / Milestones + Suggestions	medium	small	The best operational improvements often come from project friction. Capturing them in context turns delivery pain into process improvement.	Mission Control becomes self-improving, with project learnings feeding the suggestion pipeline in a structured way.	Mission Control core operations	Add a Create suggestion from milestone action that prepopulates title, area, linked project, linked client, and decision notes.	new	cmnx0p6zk0000n9ps39seabc0	\N	2026-04-14 23:18:34.57	2026-04-14 23:18:34.57	2026-04-14 23:18:34.57
cmnz9sam60001n92ittm1qk8l	Add milestone templates and reusable milestone packs by project type	Milestones are currently entered from scratch every time. Add reusable milestone templates so common project types can preload a structured milestone pack with titles, default sequencing, due offsets, and budget placeholders.	Product improvement	Projects / Milestones	high	medium	JR should not rebuild the same delivery structure repeatedly. Templates would speed project setup and make milestone quality more consistent across clients and teams.	Faster project creation, less manual entry, and better standardization for recurring service offerings.	Mission Control core operations	Start with manual template save/apply. Support relative due-date offsets like plus 3 days from project start or plus 1 week from prior milestone.	new	cmnx0p6zk0000n9ps39seabc0	\N	2026-04-14 23:45:56.671	2026-04-14 23:45:56.671	2026-04-14 23:45:56.671
cmnz9samc0003n92iu46yyury	Add milestone health signals with overdue, blocked, and at-risk states	Milestones currently show a simple status label, but there is no health layer that reflects schedule risk. Add computed health indicators based on due date proximity, blocked tasks, incomplete predecessors, and missing owners.	Product improvement	Projects / Milestones	high	medium	Status alone is too blunt. A milestone can still be marked active while already slipping. Health signals would help JR triage before the whole project drifts.	Projects become easier to manage proactively, with risk surfacing before a milestone fully misses its target.	Mission Control core operations	Recommended health states: healthy, watch, at risk, blocked, overdue. Derive them automatically where possible.	new	cmnx0p6zk0000n9ps39seabc0	\N	2026-04-14 23:45:56.676	2026-04-14 23:45:56.676	2026-04-14 23:45:56.676
cmnz9same0005n92iznbcg6kg	Add milestone activity history and change log	There is no milestone-level history showing when dates changed, statuses moved, or notes were updated. Add an activity feed and audit trail per milestone so delivery changes are visible and explainable.	Product improvement	Projects / Milestones	medium	medium	When a milestone slips or changes scope, JR needs to know what changed, when, and why. Without history, project review becomes guesswork.	Clearer accountability, easier project retrospectives, and less confusion around moving deadlines or scope changes.	Mission Control core operations	Track field diffs for status, due date, owner, budget, blockers, and description. Show them in reverse chronological order on the milestone detail or project page.	new	cmnx0p6zk0000n9ps39seabc0	\N	2026-04-14 23:45:56.678	2026-04-14 23:45:56.678	2026-04-14 23:45:56.678
cmnz9samg0007n92iqozhob29	Support milestone notes for next action, blocker, and completion proof	Milestone descriptions are too generic for real execution. Add structured operational notes fields for next action, current blocker, and completion proof so each milestone can carry the exact context needed to move it forward or verify it is truly done.	Workflow improvement	Projects / Milestones	medium	small	Teams lose momentum when the next move is not explicit. Structured notes would make milestone handoffs and status reviews much cleaner.	Less ambiguity during execution, easier follow-up, and stronger evidence when a milestone is marked complete.	Mission Control core operations	Keep these as short structured fields rather than burying them in one long description blob.	new	cmnx0p6zk0000n9ps39seabc0	\N	2026-04-14 23:45:56.68	2026-04-14 23:45:56.68	2026-04-14 23:45:56.68
\.


--
-- Data for Name: SuggestionAttachment; Type: TABLE DATA; Schema: public; Owner: mission_control
--

COPY public."SuggestionAttachment" (id, "suggestionId", "filePath", "fileName", "fileSize", "mimeType", "createdAt", "storedName") FROM stdin;
\.


--
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: mission_control
--

COPY public."Task" (id, title, description, status, "executorType", "billingType", billable, amount, "billedAt", "startDate", "dueDate", "createdById", "assignedToId", "clientId", "projectId", "milestoneId", "requesterEmployeeId", "createdAt", "updatedAt", "cronEnabled", "cronExpression", "cronLastRunAt", "cronNextRunAt", "cronTimezone") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: mission_control
--

COPY public."User" (id, name, email, "emailVerified", role, image, "createdAt", "updatedAt", password, mobile, phone, status, whatsapp) FROM stdin;
cmnx0p6zk0000n9ps39seabc0	JR	admin@allstartechsolutions.com	\N	admin	\N	2026-04-13 09:56:03.105	2026-04-15 00:05:49.793	$2b$12$GS7bZmFfqN0aKvwf/2Xr9O/FCV.8CofrE15g09VSzbFUsNYjrDwYy	2402819828	2402819828	active	2402819828
cmnynhup00000n9f95sxioxo3	Hulk AllStar	hulk@allstartechsolutions.com	\N	user	\N	2026-04-14 13:21:57.924	2026-04-15 00:06:04.126	$2b$12$GS7bZmFfqN0aKvwf/2Xr9O/FCV.8CofrE15g09VSzbFUsNYjrDwYy	\N	\N	active	\N
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: mission_control
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (provider, "providerAccountId");


--
-- Name: ClientEmployeeLocation ClientEmployeeLocation_pkey; Type: CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."ClientEmployeeLocation"
    ADD CONSTRAINT "ClientEmployeeLocation_pkey" PRIMARY KEY ("employeeId", "locationId");


--
-- Name: ClientEmployee ClientEmployee_pkey; Type: CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."ClientEmployee"
    ADD CONSTRAINT "ClientEmployee_pkey" PRIMARY KEY (id);


--
-- Name: ClientLocation ClientLocation_pkey; Type: CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."ClientLocation"
    ADD CONSTRAINT "ClientLocation_pkey" PRIMARY KEY (id);


--
-- Name: Client Client_pkey; Type: CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."Client"
    ADD CONSTRAINT "Client_pkey" PRIMARY KEY (id);


--
-- Name: ProjectMilestone ProjectMilestone_pkey; Type: CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."ProjectMilestone"
    ADD CONSTRAINT "ProjectMilestone_pkey" PRIMARY KEY (id);


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- Name: SuggestionAttachment SuggestionAttachment_pkey; Type: CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."SuggestionAttachment"
    ADD CONSTRAINT "SuggestionAttachment_pkey" PRIMARY KEY (id);


--
-- Name: Suggestion Suggestion_pkey; Type: CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."Suggestion"
    ADD CONSTRAINT "Suggestion_pkey" PRIMARY KEY (id);


--
-- Name: Task Task_pkey; Type: CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: VerificationToken VerificationToken_pkey; Type: CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."VerificationToken"
    ADD CONSTRAINT "VerificationToken_pkey" PRIMARY KEY (identifier, token);


--
-- Name: ClientEmployeeLocation_locationId_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "ClientEmployeeLocation_locationId_idx" ON public."ClientEmployeeLocation" USING btree ("locationId");


--
-- Name: ClientEmployee_clientId_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "ClientEmployee_clientId_idx" ON public."ClientEmployee" USING btree ("clientId");


--
-- Name: ClientEmployee_primaryLocationId_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "ClientEmployee_primaryLocationId_idx" ON public."ClientEmployee" USING btree ("primaryLocationId");


--
-- Name: ClientEmployee_status_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "ClientEmployee_status_idx" ON public."ClientEmployee" USING btree (status);


--
-- Name: ClientLocation_clientId_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "ClientLocation_clientId_idx" ON public."ClientLocation" USING btree ("clientId");


--
-- Name: ClientLocation_status_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "ClientLocation_status_idx" ON public."ClientLocation" USING btree (status);


--
-- Name: Client_companyName_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Client_companyName_idx" ON public."Client" USING btree ("companyName");


--
-- Name: Client_status_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Client_status_idx" ON public."Client" USING btree (status);


--
-- Name: ProjectMilestone_projectId_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "ProjectMilestone_projectId_idx" ON public."ProjectMilestone" USING btree ("projectId");


--
-- Name: ProjectMilestone_sortOrder_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "ProjectMilestone_sortOrder_idx" ON public."ProjectMilestone" USING btree ("sortOrder");


--
-- Name: ProjectMilestone_status_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "ProjectMilestone_status_idx" ON public."ProjectMilestone" USING btree (status);


--
-- Name: Project_clientId_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Project_clientId_idx" ON public."Project" USING btree ("clientId");


--
-- Name: Project_dueDate_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Project_dueDate_idx" ON public."Project" USING btree ("dueDate");


--
-- Name: Project_priority_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Project_priority_idx" ON public."Project" USING btree (priority);


--
-- Name: Project_requesterId_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Project_requesterId_idx" ON public."Project" USING btree ("requesterId");


--
-- Name: Project_status_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Project_status_idx" ON public."Project" USING btree (status);


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: SuggestionAttachment_suggestionId_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "SuggestionAttachment_suggestionId_idx" ON public."SuggestionAttachment" USING btree ("suggestionId");


--
-- Name: Suggestion_clientId_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Suggestion_clientId_idx" ON public."Suggestion" USING btree ("clientId");


--
-- Name: Suggestion_status_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Suggestion_status_idx" ON public."Suggestion" USING btree (status);


--
-- Name: Suggestion_suggestedAt_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Suggestion_suggestedAt_idx" ON public."Suggestion" USING btree ("suggestedAt");


--
-- Name: Suggestion_suggestedById_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Suggestion_suggestedById_idx" ON public."Suggestion" USING btree ("suggestedById");


--
-- Name: Task_assignedToId_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Task_assignedToId_idx" ON public."Task" USING btree ("assignedToId");


--
-- Name: Task_clientId_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Task_clientId_idx" ON public."Task" USING btree ("clientId");


--
-- Name: Task_createdById_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Task_createdById_idx" ON public."Task" USING btree ("createdById");


--
-- Name: Task_dueDate_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Task_dueDate_idx" ON public."Task" USING btree ("dueDate");


--
-- Name: Task_milestoneId_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Task_milestoneId_idx" ON public."Task" USING btree ("milestoneId");


--
-- Name: Task_projectId_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Task_projectId_idx" ON public."Task" USING btree ("projectId");


--
-- Name: Task_requesterEmployeeId_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Task_requesterEmployeeId_idx" ON public."Task" USING btree ("requesterEmployeeId");


--
-- Name: Task_status_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "Task_status_idx" ON public."Task" USING btree (status);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_status_idx; Type: INDEX; Schema: public; Owner: mission_control
--

CREATE INDEX "User_status_idx" ON public."User" USING btree (status);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClientEmployeeLocation ClientEmployeeLocation_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."ClientEmployeeLocation"
    ADD CONSTRAINT "ClientEmployeeLocation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."ClientEmployee"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClientEmployeeLocation ClientEmployeeLocation_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."ClientEmployeeLocation"
    ADD CONSTRAINT "ClientEmployeeLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."ClientLocation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClientEmployee ClientEmployee_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."ClientEmployee"
    ADD CONSTRAINT "ClientEmployee_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClientEmployee ClientEmployee_primaryLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."ClientEmployee"
    ADD CONSTRAINT "ClientEmployee_primaryLocationId_fkey" FOREIGN KEY ("primaryLocationId") REFERENCES public."ClientLocation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ClientLocation ClientLocation_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."ClientLocation"
    ADD CONSTRAINT "ClientLocation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectMilestone ProjectMilestone_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."ProjectMilestone"
    ADD CONSTRAINT "ProjectMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Project Project_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Project Project_requesterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES public."ClientEmployee"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SuggestionAttachment SuggestionAttachment_suggestionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."SuggestionAttachment"
    ADD CONSTRAINT "SuggestionAttachment_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES public."Suggestion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Suggestion Suggestion_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."Suggestion"
    ADD CONSTRAINT "Suggestion_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Suggestion Suggestion_suggestedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."Suggestion"
    ADD CONSTRAINT "Suggestion_suggestedById_fkey" FOREIGN KEY ("suggestedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Task Task_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Task Task_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Task Task_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Task Task_milestoneId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES public."ProjectMilestone"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Task Task_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Task Task_requesterEmployeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mission_control
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_requesterEmployeeId_fkey" FOREIGN KEY ("requesterEmployeeId") REFERENCES public."ClientEmployee"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict kjhTXtF5CN58LFQagrpgHEd4V1GxTI3FBDYQ3Zu6G24l39ZvrGfgfvPbI8xYeQ4

