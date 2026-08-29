/**
 * MONGOOSE SCHEMAS - APIX-PAP v2 Multi-Project Architecture
 * Modèles MongoDB pour support TER + projets futurs
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ============================================================================
// 1. PROJECT SCHEMA
// ============================================================================

const ProjectSchema = new Schema({
  projectCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 20
  },
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  startDate: Date,
  endDate: Date,
  config: {
    categories: [String],
    hierarchyLevels: { type: Number, default: 1 },
    defaultCurrency: { type: String, default: 'FCFA' },
    defaultRegion: String
  },
  owner: Schema.Types.ObjectId,
  team: [Schema.Types.ObjectId],
  isActive: { type: Boolean, default: true },
  beneficiaryCount: { type: Number, default: 0 },
  importCount: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { collection: 'projects' });

ProjectSchema.index({ projectCode: 1 });
ProjectSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// ============================================================================
// 2. CATEGORY SCHEMA
// ============================================================================

const FieldDefinitionSchema = new Schema({
  field: String,
  type: { type: String, enum: ['String', 'Number', 'Boolean', 'Date', 'Object'] },
  required: { type: Boolean, default: false },
  enum: [String],
  description: String,
  _id: false
});

const RepeatableSectionSchema = new Schema({
  sectionName: String,
  count: Number,
  fields: [FieldDefinitionSchema],
  _id: false
});

const CategorySchemaSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, required: true, ref: 'Project' },
  categoryName: { type: String, required: true, trim: true },
  schema: {
    common: [FieldDefinitionSchema],
    specific: [FieldDefinitionSchema],
    repeatable: [RepeatableSectionSchema]
  },
  columnMapping: { type: Map, of: String, default: new Map() },
  isActive: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
}, { collection: 'categorySchemas' });

CategorySchemaSchema.index({ projectId: 1, categoryName: 1 }, { unique: true });

// ============================================================================
// 3. BENEFICIARY SCHEMA (Main Document)
// ============================================================================

const LocationSchema = new Schema({
  region: String,
  department: String,
  district: String,
  commune: String,
  locality: String,
  gps: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: null }
  },
  _id: false
}, { _id: false });

const WorkflowStatusSchema = new Schema({
  status: String,
  date: Date,
  changedBy: Schema.Types.ObjectId,
  reason: String,
  _id: false
}, { _id: false });

const ImportMetadataSchema = new Schema({
  importBatchId: String,
  importDate: Date,
  importedBy: Schema.Types.ObjectId,
  sourceFile: String,
  rowNumber: Number,
  _id: false
}, { _id: false });

const BeneficiarySchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, required: true, ref: 'Project', index: true },
  categoryId: { type: Schema.Types.ObjectId, required: true, ref: 'CategorySchema', index: true },
  categoryName: String,

  code: { type: String, required: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },

  gender: { type: String, enum: ['M', 'F', 'Autre', null], default: null },
  dateOfBirth: Date,
  nationality: String,
  placeOfBirth: String,
  email: String,
  phone: [String],

  location: LocationSchema,

  categoryData: mongoose.Schema.Types.Mixed,

  levels: [{
    levelNumber: Number,
    levelName: String,
    data: mongoose.Schema.Types.Mixed,
    _id: false
  }],

  workflow: {
    status: {
      type: String,
      enum: ['Enregistré', 'En cours', 'Payé', 'Clôturé', 'Rejeté'],
      default: 'Enregistré',
      index: true
    },
    phase: {
      type: String,
      enum: ['Registration', 'Evaluation', 'Compensation', 'Payment', 'Complaints', 'Closure'],
      default: 'Registration',
      index: true
    },
    lastStatusChange: Date,
    statusHistory: [WorkflowStatusSchema]
  },

  notes: {
    general: String,
    specific: String,
    _id: false
  },

  import: ImportMetadataSchema,
  additionalData: mongoose.Schema.Types.Mixed,

  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null, index: true },
  deletedBy: Schema.Types.ObjectId
}, {
  collection: 'beneficiaries',
  timestamps: false
});

BeneficiarySchema.index({ projectId: 1, code: 1 }, { unique: true, sparse: true });
BeneficiarySchema.index({ projectId: 1, categoryId: 1 });
BeneficiarySchema.index({ 'location.gps': '2dsphere' });
BeneficiarySchema.index({ 'import.importBatchId': 1 });
BeneficiarySchema.index({ 'workflow.status': 1 });
BeneficiarySchema.index({ 'workflow.phase': 1 });

BeneficiarySchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

BeneficiarySchema.query.notDeleted = function() {
  return this.where({ deleted_at: null });
};

BeneficiarySchema.methods.softDelete = async function(deletedBy) {
  this.deleted_at = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

// ============================================================================
// 4. IMPORT BATCH SCHEMA
// ============================================================================

const ImportBatchSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, required: true, ref: 'Project', index: true },
  importBatchId: { type: String, required: true, unique: true, index: true },

  sourceFile: {
    filename: String,
    mimetype: String,
    size: Number,
    hash: String
  },

  stats: {
    totalRows: Number,
    totalCreated: Number,
    totalFailed: Number,
    successRate: Number,
    byCategory: { type: Map, of: Number }
  },

  results: [{
    rowNumber: Number,
    code: String,
    category: String,
    status: { type: String, enum: ['CREATED', 'UPDATED', 'SKIPPED', 'FAILED'] },
    beneficiaryId: Schema.Types.ObjectId,
    error: String,
    _id: false
  }],

  validationErrors: [String],
  validationWarnings: [String],

  importedBy: { type: Schema.Types.ObjectId, required: true },
  startTime: Date,
  endTime: Date,
  duration: Number,

  status: { type: String, enum: ['PROCESSING', 'COMPLETED', 'FAILED', 'PARTIAL'], default: 'PROCESSING' },

  created_at: { type: Date, default: Date.now, index: true }
}, { collection: 'importBatches' });

ImportBatchSchema.index({ projectId: 1, created_at: -1 });

// ============================================================================
// 5. EXPORT MODELS
// ============================================================================

module.exports = {
  Project: mongoose.model('Project', ProjectSchema),
  CategorySchema: mongoose.model('CategorySchema', CategorySchemaSchema),
  Beneficiary: mongoose.model('Beneficiary', BeneficiarySchema),
  ImportBatch: mongoose.model('ImportBatch', ImportBatchSchema)
};
