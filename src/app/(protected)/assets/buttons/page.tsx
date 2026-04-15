import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Loader2,
  Mail,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";

const baseButtonClassName =
  "inline-flex items-center justify-center rounded-full font-semibold tracking-[0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

const sizeClasses = {
  sm: "min-h-10 gap-2 px-4 text-sm",
  md: "min-h-12 gap-3 px-5 text-sm",
  lg: "min-h-14 gap-3.5 px-6 text-[15px]",
};

const buttonRecipes = {
  primary:
    "bg-[#405189] text-white shadow-[0_16px_34px_-18px_rgba(64,81,137,0.9)] hover:bg-[#364579] focus-visible:ring-[#405189]",
  success:
    "bg-[#0ab39c] text-white shadow-[0_16px_34px_-18px_rgba(10,179,156,0.85)] hover:bg-[#099681] focus-visible:ring-[#0ab39c]",
  danger:
    "bg-[#f06548] text-white shadow-[0_16px_34px_-18px_rgba(240,101,72,0.85)] hover:bg-[#db573d] focus-visible:ring-[#f06548]",
  warning:
    "bg-[#f7b84b] text-white shadow-[0_16px_34px_-18px_rgba(247,184,75,0.85)] hover:bg-[#e3a63d] focus-visible:ring-[#f7b84b]",
  info: "bg-[#299cdb] text-white shadow-[0_16px_34px_-18px_rgba(41,156,219,0.85)] hover:bg-[#2388bf] focus-visible:ring-[#299cdb]",
  light:
    "border border-slate-200 bg-white text-slate-700 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.55)] hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-300",
  subtle:
    "border border-slate-200 bg-slate-50 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] hover:bg-white focus-visible:ring-slate-300",
  tinted:
    "bg-[#e8f1ff] text-[#405189] ring-1 ring-inset ring-[#bfd1ff] hover:bg-[#dce9ff] focus-visible:ring-[#bfd1ff]",
  gradient:
    "bg-gradient-to-r from-[#f06548] to-[#f7b84b] text-white shadow-[0_18px_36px_-18px_rgba(240,101,72,0.85)] hover:opacity-95 focus-visible:ring-[#f7b84b]",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-slate-300",
};

type ButtonToken = {
  label: string;
  recipe: keyof typeof buttonRecipes;
  icon?: LucideIcon;
  trailingIcon?: LucideIcon;
  size?: keyof typeof sizeClasses;
  disabled?: boolean;
  fullWidth?: boolean;
};

type ButtonSection = {
  title: string;
  description: string;
  buttons: ButtonToken[];
};

const heroExamples: ButtonToken[] = [
  { label: "Launch workflow", recipe: "primary", icon: Play, size: "lg" },
  { label: "Approve request", recipe: "success", icon: Check, size: "lg" },
  { label: "Featured action", recipe: "gradient", icon: Sparkles, size: "lg" },
  { label: "Export report", recipe: "light", icon: Download, size: "lg" },
];

const semanticSections: ButtonSection[] = [
  {
    title: "Semantic solid buttons",
    description:
      "Core reusable actions with colored fills and white text, matching the product rule used across the dashboard.",
    buttons: [
      { label: "Primary", recipe: "primary" },
      { label: "Success", recipe: "success", icon: Check },
      { label: "Danger", recipe: "danger", icon: Trash2 },
      { label: "Warning", recipe: "warning", icon: Bell },
      { label: "Info", recipe: "info", icon: ShieldCheck },
      { label: "Send invite", recipe: "primary", icon: Send, trailingIcon: ArrowRight },
    ],
  },
  {
    title: "Light and neutral buttons",
    description:
      "White and soft-surface actions taken from the reference direction, always using dark text for contrast.",
    buttons: [
      { label: "Secondary", recipe: "light" },
      { label: "Create new", recipe: "subtle", icon: Plus },
      { label: "Preview", recipe: "light", icon: Eye },
      { label: "Filter", recipe: "subtle", icon: Filter },
      { label: "Search records", recipe: "light", icon: Search },
      { label: "Continue", recipe: "tinted", trailingIcon: ChevronRight },
    ],
  },
  {
    title: "High-emphasis CTAs",
    description:
      "Promotional and featured styles with extra shine, stronger shadow, and more visual lift like the references.",
    buttons: [
      { label: "Upgrade plan", recipe: "gradient", icon: Sparkles },
      { label: "Review changes", recipe: "primary", trailingIcon: ArrowRight },
      { label: "Upload assets", recipe: "info", icon: Upload },
      { label: "Notify team", recipe: "success", icon: Mail },
      { label: "Edit details", recipe: "light", icon: Pencil },
      { label: "Dismiss", recipe: "ghost", icon: X },
    ],
  },
];

const sizeExamples: ButtonToken[] = [
  { label: "Small action", recipe: "primary", size: "sm" },
  { label: "Medium action", recipe: "primary", size: "md" },
  { label: "Large action", recipe: "primary", size: "lg" },
  { label: "Small neutral", recipe: "light", size: "sm", icon: Download },
  { label: "Medium neutral", recipe: "light", size: "md", icon: Filter },
  { label: "Large neutral", recipe: "light", size: "lg", icon: ChevronDown },
];

const stateExamples: ButtonToken[] = [
  { label: "Default", recipe: "primary", icon: Play },
  { label: "Loading", recipe: "primary", icon: Loader2 },
  { label: "Disabled", recipe: "primary", icon: X, disabled: true },
  { label: "Default", recipe: "light", icon: Download },
  { label: "Loading", recipe: "light", icon: Loader2 },
  { label: "Disabled", recipe: "light", icon: MoreHorizontal, disabled: true },
];

const iconPatterns: { title: string; buttons: ButtonToken[] }[] = [
  {
    title: "Leading icons",
    buttons: [
      { label: "Download", recipe: "light", icon: Download },
      { label: "Create record", recipe: "success", icon: Plus },
      { label: "Edit workflow", recipe: "primary", icon: Pencil },
      { label: "Open inbox", recipe: "tinted", icon: Mail },
    ],
  },
  {
    title: "Trailing icons",
    buttons: [
      { label: "View details", recipe: "primary", trailingIcon: ArrowRight },
      { label: "Continue", recipe: "success", trailingIcon: ChevronRight },
      { label: "Review queue", recipe: "light", trailingIcon: ChevronRight },
      { label: "More options", recipe: "tinted", trailingIcon: ChevronDown },
    ],
  },
  {
    title: "Icon-only controls",
    buttons: [
      { label: "Search", recipe: "light", icon: Search },
      { label: "Filters", recipe: "subtle", icon: Filter },
      { label: "Settings", recipe: "primary", icon: Settings2 },
      { label: "Alerts", recipe: "danger", icon: Bell },
    ],
  },
];

const useCaseSections: { title: string; description: string; buttons: ButtonToken[] }[] = [
  {
    title: "Toolbar set",
    description: "Compact controls for table headers, top bars, and filter rows.",
    buttons: [
      { label: "Filter", recipe: "light", size: "sm", icon: Filter },
      { label: "Export", recipe: "light", size: "sm", icon: Download },
      { label: "Bulk edit", recipe: "subtle", size: "sm", icon: Pencil },
      { label: "Create", recipe: "primary", size: "sm", icon: Plus },
    ],
  },
  {
    title: "Card footer actions",
    description: "Mid-size buttons for widgets, cards, and modal footers.",
    buttons: [
      { label: "Cancel", recipe: "light", size: "md" },
      { label: "Save draft", recipe: "subtle", size: "md" },
      { label: "Publish", recipe: "success", size: "md", trailingIcon: ArrowRight },
      { label: "Delete", recipe: "danger", size: "md", icon: Trash2 },
    ],
  },
  {
    title: "Full-width mobile actions",
    description: "Stack-friendly patterns for drawers, narrow cards, and mobile layouts.",
    buttons: [
      { label: "Start deployment", recipe: "primary", size: "lg", icon: Play, fullWidth: true },
      { label: "Request approval", recipe: "success", size: "lg", icon: ShieldCheck, fullWidth: true },
      { label: "Download summary", recipe: "light", size: "lg", icon: Download, fullWidth: true },
    ],
  },
];

const buildNotes = [
  "The reference set leans heavily on pill geometry, soft depth, and roomy horizontal spacing, so this page keeps every reusable button fully rounded and comfortably padded.",
  "Colored actions use white labels and white icons. White and light-surface buttons keep dark slate text for consistent readability.",
  "Most reference patterns pair a single icon with sentence-case text, usually leading the label, with directional arrows used for forward movement.",
  "The library is organized by semantics, size, state, icon treatment, and real product use cases so teams can copy patterns instead of improvising them.",
];

function AssetButton({
  label,
  recipe,
  icon: LeadingIcon,
  trailingIcon: TrailingIcon,
  size = "md",
  disabled,
  fullWidth,
}: ButtonToken) {
  const iconClassName = LeadingIcon === Loader2 ? "animate-spin" : "";
  const iconOnly = !TrailingIcon && !!LeadingIcon && ["Search", "Filters", "Settings", "Alerts"].includes(label);

  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        baseButtonClassName,
        sizeClasses[size],
        buttonRecipes[recipe],
        fullWidth ? "w-full" : "",
        iconOnly ? "aspect-square px-0" : "",
      ].join(" ")}
    >
      {LeadingIcon ? <LeadingIcon size={16} className={iconClassName} /> : null}
      {!iconOnly ? <span>{label}</span> : null}
      {TrailingIcon ? <TrailingIcon size={16} /> : null}
    </button>
  );
}

function ButtonGrid({ buttons }: { buttons: ButtonToken[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {buttons.map((button) => (
        <AssetButton key={`${button.label}-${button.recipe}-${button.size ?? "md"}`} {...button} />
      ))}
    </div>
  );
}

export default function ButtonsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#405189]">Assets</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-800">Buttons</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Reusable button asset library derived from the supplied reference set, expanded into practical patterns teams can reuse throughout Mission Control.
          </p>
        </div>
        <nav className="text-sm text-slate-400">
          <span className="text-[#405189]">Mission Control</span>
          <span className="mx-2">&rsaquo;</span>
          <span>Assets</span>
          <span className="mx-2">&rsaquo;</span>
          <span>Buttons</span>
        </nav>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#405189]">Reference-driven system</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-800">High-coverage button gallery</h2>
            <p className="mt-2 text-sm text-slate-500">
              Includes semantic fills, light surfaces, icon placements, state handling, and real layout groupings so product teams can lift patterns directly into features.
            </p>
          </div>
          <div className="grid gap-2 text-sm text-slate-500 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="block text-lg font-semibold text-slate-800">30+</span> button examples</div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="block text-lg font-semibold text-slate-800">5</span> semantic colors</div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="block text-lg font-semibold text-slate-800">6</span> pattern sections</div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-slate-50 p-5">
          <ButtonGrid buttons={heroExamples} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          {semanticSections.map((section) => (
            <div key={section.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800">{section.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{section.description}</p>
              <div className="mt-5">
                <ButtonGrid buttons={section.buttons} />
              </div>
            </div>
          ))}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800">Size scale</h3>
            <p className="mt-1 text-sm text-slate-500">
              Small for toolbars, medium for standard actions, and large for prominent task completion moments.
            </p>
            <div className="mt-5 space-y-4">
              <ButtonGrid buttons={sizeExamples} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800">States</h3>
            <p className="mt-1 text-sm text-slate-500">
              Default, loading, and disabled references for both dark and light button families.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Colored states</p>
                <div className="mt-4 flex flex-wrap gap-4">
                  {stateExamples.slice(0, 3).map((button) => (
                    <AssetButton key={`${button.label}-solid`} {...button} />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Light states</p>
                <div className="mt-4 flex flex-wrap gap-4">
                  {stateExamples.slice(3).map((button) => (
                    <AssetButton key={`${button.label}-light`} {...button} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800">Icon treatments</h3>
            <p className="mt-1 text-sm text-slate-500">
              Common icon placements pulled into repeatable patterns instead of one-off compositions.
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {iconPatterns.map((pattern) => (
                <div key={pattern.title} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-sm font-semibold text-slate-800">{pattern.title}</p>
                  <div className="mt-4 flex flex-wrap gap-4">
                    {pattern.buttons.map((button) => (
                      <AssetButton key={`${pattern.title}-${button.label}`} {...button} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800">Reusable layout sets</h3>
            <p className="mt-1 text-sm text-slate-500">
              Bundled examples that feel like a real internal asset library for dashboards, cards, and mobile surfaces.
            </p>
            <div className="mt-5 space-y-4">
              {useCaseSections.map((section) => (
                <div key={section.title} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                  <h4 className="text-sm font-semibold text-slate-800">{section.title}</h4>
                  <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                  <div className="mt-4 flex flex-wrap gap-4">
                    {section.buttons.map((button) => (
                      <div key={`${section.title}-${button.label}`} className={button.fullWidth ? "w-full max-w-sm" : ""}>
                        <AssetButton {...button} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800">Build notes</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {buildNotes.map((note) => (
                <li key={note} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#0ab39c]" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-[#405189] p-6 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Recipe</p>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950/20 p-4 text-xs leading-6 text-white/90">{`rounded-full px-5 py-3
font-semibold tracking-[0.01em]
inline-flex items-center gap-3
colored buttons => text-white
white buttons => text-slate-700
shadow + border for tactile depth`}</pre>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800">Recommended reuse</h3>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-800">Use semantic solids</p>
                <p className="mt-1">For major actions in forms, modals, approval flows, and primary dashboard tasks.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-800">Use light surfaces</p>
                <p className="mt-1">For table actions, secondary pathways, toolbar controls, and less destructive choices.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-800">Use gradients sparingly</p>
                <p className="mt-1">For featured promotions, upgrades, or moments where extra emphasis is intentional.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
