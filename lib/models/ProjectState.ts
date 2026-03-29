/**
 * lib/models/ProjectState.ts — Mongoose schema mirroring the ProjectState type
 *
 * This is the most complex model: it faithfully represents every nested
 * interface from lib/types/project.ts as Mongoose sub-schemas so that
 * Mongoose can validate, index, and partially-update the document efficiently.
 *
 * The `version` field is used for optimistic concurrency: before writing,
 * callers pass the version they read; the update is rejected if it has changed.
 *
 * Architecture:
 *   ProjectState 1──1 Project (projectId is a unique index)
 */

import { Schema, model, models, type Document, type Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import type {
  ModelRole,
  TaskType,
  Severity,
  Priority,
  HttpMethod,
  RelationCardinality,
} from '@/lib/types'

// ─── FileTreeNode (recursive) ─────────────────────────────────────────────────
// Mongoose doesn't support recursive schemas natively, so we use Mixed
// for the `children` array and validate depth in application code.

const FileTreeNodeSchema = new Schema(
  {
    path:        { type: String, required: true },
    type:        { type: String, enum: ['file', 'directory'], required: true },
    language:    { type: String },
    description: { type: String },
    children:    { type: Schema.Types.Mixed, default: [] }, // recursive — typed as Mixed
  },
  { _id: false },
)

// ─── DataModel sub-schemas ────────────────────────────────────────────────────

const DataModelFieldSchema = new Schema(
  {
    name:        { type: String, required: true },
    type:        { type: String, required: true },
    required:    { type: Boolean, default: false },
    unique:      { type: Boolean, default: false },
    default:     { type: String },
    description: { type: String },
  },
  { _id: false },
)

const DataModelRelationSchema = new Schema(
  {
    field:       { type: String, required: true },
    references:  { type: String, required: true },
    cardinality: {
      type: String,
      enum: ['one-to-one', 'one-to-many', 'many-to-many'] satisfies RelationCardinality[],
      required: true,
    },
    onDelete: {
      type: String,
      enum: ['cascade', 'restrict', 'set-null', 'no-action'],
    },
  },
  { _id: false },
)

const DataModelSchema = new Schema(
  {
    name:           { type: String, required: true },
    collectionName: { type: String, required: true },
    fields:         { type: [DataModelFieldSchema], default: [] },
    relations:      { type: [DataModelRelationSchema], default: [] },
    indexes:        { type: [[String]], default: [] },
    description:    { type: String },
    updatedAt:      { type: String, default: () => new Date().toISOString() },
    updatedBy:      {
      type: String,
      enum: ['claude', 'gpt5.4o', 'codestral', 'gemini', 'perplexity'] satisfies ModelRole[],
    },
  },
  { _id: false },
)

// ─── ApiRoute sub-schema ──────────────────────────────────────────────────────

const RateLimitConfigSchema = new Schema(
  {
    windowMs:    { type: Number, required: true },
    maxRequests: { type: Number, required: true },
    keyBy:       { type: String, enum: ['ip', 'user', 'team'], required: true },
  },
  { _id: false },
)

const ApiRouteSchema = new Schema(
  {
    method:         {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] satisfies HttpMethod[],
      required: true,
    },
    path:           { type: String, required: true },
    description:    { type: String, required: true },
    auth:           { type: Boolean, default: true },
    requestSchema:  { type: String },
    responseSchema: { type: String },
    statusCodes:    { type: [Number], default: [] },
    rateLimit:      { type: RateLimitConfigSchema },
  },
  { _id: false },
)

// ─── Architecture sub-schemas ─────────────────────────────────────────────────

const TechStackEntrySchema = new Schema(
  {
    name:    { type: String, required: true },
    version: { type: String },
    purpose: { type: String, required: true },
    layer:   {
      type: String,
      enum: ['frontend', 'backend', 'database', 'infra', 'tooling'],
      required: true,
    },
  },
  { _id: false },
)

const DesignPatternSchema = new Schema(
  {
    name:        { type: String, required: true },
    description: { type: String, required: true },
    appliesTo:   { type: [String], default: [] },
    decidedBy:   { type: String, required: true },
    decidedAt:   { type: String, required: true },
  },
  { _id: false },
)

const ArchitectureDecisionRecordSchema = new Schema(
  {
    id:            { type: String, default: uuidv4, required: true },
    title:         { type: String, required: true },
    status:        {
      type: String,
      enum: ['proposed', 'accepted', 'superseded', 'deprecated'],
      required: true,
    },
    context:       { type: String, required: true },
    decision:      { type: String, required: true },
    consequences:  { type: String, required: true },
    decidedBy:     { type: String, required: true },
    decidedAt:     { type: String, required: true },
    supersededBy:  { type: String },
  },
  { _id: false },
)

const ArchitectureDecisionsSchema = new Schema(
  {
    fileTree:   { type: [FileTreeNodeSchema], default: [] },
    dataModels: { type: [DataModelSchema],    default: [] },
    apiRoutes:  { type: [ApiRouteSchema],     default: [] },
    techStack:  { type: [TechStackEntrySchema], default: [] },
    patterns:   { type: [DesignPatternSchema],  default: [] },
    adrs:       { type: Map, of: ArchitectureDecisionRecordSchema, default: {} },
  },
  { _id: false },
)

// ─── Conventions sub-schemas ──────────────────────────────────────────────────

const NamingConventionsSchema = new Schema(
  {
    components:  { type: String, default: 'PascalCase' },
    hooks:       { type: String, default: 'useCamelCase' },
    utilities:   { type: String, default: 'camelCase' },
    constants:   { type: String, default: 'SCREAMING_SNAKE_CASE' },
    types:       { type: String, default: 'PascalCase interfaces' },
    apiHandlers: { type: String, default: 'camelCase' },
    files:       { type: String, default: 'kebab-case' },
    directories: { type: String, default: 'kebab-case' },
  },
  { _id: false },
)

const FolderStructureSchema = new Schema(
  {
    root:       { type: [String], default: [] },
    components: { type: [String], default: [] },
    pages:      { type: [String], default: [] },
    api:        { type: [String], default: [] },
    lib:        { type: [String], default: [] },
  },
  { _id: false },
)

const ComponentPatternsSchema = new Schema(
  {
    stateManagement: { type: String, default: 'Zustand slices' },
    dataFetching:    { type: String, default: 'SWR with custom hooks' },
    errorHandling:   { type: String, default: 'Error boundaries + sonner toasts' },
    styling:         { type: String, default: 'Tailwind + shadcn/ui' },
    composition:     { type: String, default: 'Compound component pattern' },
    validation:      { type: String, default: 'Zod at API boundaries' },
  },
  { _id: false },
)

const ConventionsStateSchema = new Schema(
  {
    naming:           { type: NamingConventionsSchema,  default: {} },
    folderStructure:  { type: FolderStructureSchema,    default: {} },
    componentPatterns:{ type: ComponentPatternsSchema,  default: {} },
    lastUpdatedAt:    { type: String, default: () => new Date().toISOString() },
    lastUpdatedBy:    {
      type: String,
      enum: ['claude', 'gpt5.4o', 'codestral', 'gemini', 'perplexity'] satisfies ModelRole[],
    },
  },
  { _id: false },
)

// ─── Dependencies sub-schemas ─────────────────────────────────────────────────

const PackageDependencySchema = new Schema(
  {
    name:          { type: String, required: true },
    version:       { type: String, required: true },
    purpose:       { type: String, required: true },
    devDependency: { type: Boolean, default: false },
    addedBy:       {
      type: String,
      enum: ['claude', 'gpt5.4o', 'codestral', 'gemini', 'perplexity'] satisfies ModelRole[],
      required: true,
    },
    addedAt:       { type: String, default: () => new Date().toISOString() },
  },
  { _id: false },
)

const KnownGotchaSchema = new Schema(
  {
    id:           { type: String, default: uuidv4, required: true },
    package:      { type: String, required: true },
    issue:        { type: String, required: true },
    workaround:   { type: String, required: true },
    severity:     {
      type: String,
      enum: ['info', 'warning', 'error', 'critical'] satisfies Severity[],
      required: true,
    },
    discoveredBy: {
      type: String,
      enum: ['claude', 'gpt5.4o', 'codestral', 'gemini', 'perplexity'] satisfies ModelRole[],
      required: true,
    },
    discoveredAt: { type: String, default: () => new Date().toISOString() },
    resolved:     { type: Boolean, default: false },
    resolvedAt:   { type: String },
  },
  { _id: false },
)

const DependenciesStateSchema = new Schema(
  {
    packages:    { type: [PackageDependencySchema], default: [] },
    versionMap:  { type: Map, of: String, default: {} },
    knownGotchas:{ type: [KnownGotchaSchema], default: [] },
  },
  { _id: false },
)

// ─── Open questions ───────────────────────────────────────────────────────────

const OpenQuestionSchema = new Schema(
  {
    id:                { type: String, default: uuidv4, required: true },
    text:              { type: String, required: true },
    flaggedBy:         {
      type: String,
      enum: ['claude', 'gpt5.4o', 'codestral', 'gemini', 'perplexity'] satisfies ModelRole[],
      required: true,
    },
    taskType:          {
      type: String,
      enum: ['architecture', 'implementation', 'research', 'refactor', 'review', 'arbitration'] satisfies TaskType[],
      required: true,
    },
    resolved:          { type: Boolean, default: false },
    resolution:        { type: String },
    resolvedBy:        {
      type: String,
      enum: ['claude', 'gpt5.4o', 'codestral', 'gemini', 'perplexity'] satisfies ModelRole[],
    },
    resolvedAt:        { type: String },
    createdAt:         { type: String, default: () => new Date().toISOString() },
    relatedLogEntries: { type: [String], default: [] },
  },
  { _id: false },
)

// ─── Review log entry (embedded in ProjectState) ──────────────────────────────

const EmbeddedReviewLogEntrySchema = new Schema(
  {
    id:           { type: String, default: uuidv4, required: true },
    model:        {
      type: String,
      enum: ['claude', 'gpt5.4o', 'codestral', 'gemini', 'perplexity'] satisfies ModelRole[],
      required: true,
    },
    decision:     { type: String, required: true },
    rationale:    { type: String, required: true },
    timestamp:    { type: String, default: () => new Date().toISOString() },
    taskType:     {
      type: String,
      enum: ['architecture', 'implementation', 'research', 'refactor', 'review', 'arbitration'] satisfies TaskType[],
      required: true,
    },
    severity:     {
      type: String,
      enum: ['info', 'warning', 'error', 'critical'] satisfies Severity[],
      default: 'info',
    },
    relatedFiles: { type: [String], default: [] },
    taskId:       { type: String, required: true },
    confidence:   { type: Number, min: 0, max: 1, default: 0.8 },
  },
  { _id: false },
)

// ─── Active task ──────────────────────────────────────────────────────────────

const ActiveTaskSchema = new Schema(
  {
    id:            { type: String, default: uuidv4, required: true },
    scope:         { type: String, required: true },
    constraints:   { type: [String], default: [] },
    relatedFiles:  { type: [String], default: [] },
    taskType:      {
      type: String,
      enum: ['architecture', 'implementation', 'research', 'refactor', 'review', 'arbitration'] satisfies TaskType[],
      required: true,
    },
    assignedModel: {
      type: String,
      enum: ['claude', 'gpt5.4o', 'codestral', 'gemini', 'perplexity'] satisfies ModelRole[],
      required: true,
    },
    startedAt:     { type: String, default: () => new Date().toISOString() },
    timeoutMs:     { type: Number, default: 120_000 },
    priority:      {
      type: String,
      enum: ['low', 'normal', 'high', 'critical'] satisfies Priority[],
      default: 'normal',
    },
    parentTaskId:  { type: String },
  },
  { _id: false },
)

// ─── Document interface ───────────────────────────────────────────────────────

export interface IProjectState extends Document {
  readonly id:   string
  projectId:     string          // unique — 1:1 with Project.id
  version:       number          // optimistic concurrency counter
  createdAt:     Date
  updatedAt:     Date

  architecture:  Record<string, unknown>
  conventions:   Record<string, unknown>
  dependencies:  Record<string, unknown>
  openQuestions: Record<string, unknown>[]
  reviewLog:     Record<string, unknown>[]
  activeTask:    Record<string, unknown> | null

  // Helpers
  bumpVersion(): Promise<IProjectState>
}

export interface IProjectStateModel extends Model<IProjectState> {
  findByProject(projectId: string): Promise<IProjectState | null>
}

// ─── Root schema ──────────────────────────────────────────────────────────────

const ProjectStateSchema = new Schema<IProjectState, IProjectStateModel>(
  {
    id: {
      type:      String,
      default:   uuidv4,
      unique:    true,
      index:     true,
      immutable: true,
    },

    projectId: {
      type:     String,
      required: [true, 'projectId is required'],
      unique:   true,             // 1:1 with Project
      index:    true,
      immutable: true,
    },

    /**
     * Optimistic concurrency version counter.
     * Increment with every write; compare before updating to detect conflicts.
     */
    version: {
      type:    Number,
      default: 1,
      min:     1,
    },

    architecture:  { type: ArchitectureDecisionsSchema, default: {} },
    conventions:   { type: ConventionsStateSchema,      default: {} },
    dependencies:  { type: DependenciesStateSchema,     default: {} },
    openQuestions: { type: [OpenQuestionSchema],        default: [] },
    reviewLog:     { type: [EmbeddedReviewLogEntrySchema], default: [] },
    activeTask:    { type: ActiveTaskSchema, default: null },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  },
)

// ─── Instance methods ─────────────────────────────────────────────────────────

ProjectStateSchema.methods.bumpVersion = async function (
  this: IProjectState,
): Promise<IProjectState> {
  this.version += 1
  return this.save()
}

// ─── Static methods ───────────────────────────────────────────────────────────

ProjectStateSchema.statics.findByProject = function (
  projectId: string,
): Promise<IProjectState | null> {
  return this.findOne({ projectId })
}

// ─── Model export ─────────────────────────────────────────────────────────────

export const ProjectState: IProjectStateModel =
  (models.ProjectState as IProjectStateModel) ??
  model<IProjectState, IProjectStateModel>('ProjectState', ProjectStateSchema)
