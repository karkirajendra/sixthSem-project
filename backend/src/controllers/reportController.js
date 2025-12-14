import asyncHandler from 'express-async-handler';
import Report from '../models/Report.js';
import Property from '../models/Property.js';
import { validationResult } from 'express-validator';

// @desc    Create new report
// @route   POST /api/reports
// @access  Private (Authenticated users)
export const createReport = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(
      'Validation failed: ' +
        errors
          .array()
          .map((err) => err.msg)
          .join(', ')
    );
  }

  const { property, reason, description, evidence } = req.body;

  // Check if property exists
  const propertyExists = await Property.findById(property);
  if (!propertyExists) {
    res.status(404);
    throw new Error('Property not found');
  }

  // Check if user has already reported this property
  const existingReport = await Report.findOne({
    property,
    reportedBy: req.user._id,
    status: { $in: ['Pending', 'Under Review'] },
  });

  if (existingReport) {
    res.status(400);
    throw new Error('You have already reported this property');
  }

  const report = await Report.create({
    property,
    reportedBy: req.user._id,
    reason,
    description,
    evidence: evidence || [],
  });

  // Populate the created report
  await report.populate([
    {
      path: 'property',
      select: 'title type location price owner',
    },
    {
      path: 'reportedBy',
      select: 'name email',
    },
  ]);

  res.status(201).json({
    success: true,
    message: 'Report submitted successfully',
    data: report,
  });
});

// @desc    Get all reports (Admin only)
// @route   GET /api/reports
// @access  Private/Admin
export const getAllReports = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    reason,
    priority,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  // Build filter object
  const filter = {};
  if (status) filter.status = status;
  if (reason) filter.reason = reason;
  if (priority) filter.priority = priority;
  if (search) {
    filter.$or = [
      { reason: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
  };

  const reports = await Report.find(filter)
    .sort(options.sort)
    .limit(options.limit * 1)
    .skip((options.page - 1) * options.limit);

  const total = await Report.countDocuments(filter);

  res.json({
    success: true,
    data: reports,
    pagination: {
      current: options.page,
      total: Math.ceil(total / options.limit),
      count: reports.length,
      totalRecords: total,
    },
  });
});

// @desc    Get single report by ID
// @route   GET /api/reports/:id
// @access  Private/Admin
export const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  res.json({
    success: true,
    data: report,
  });
});

// @desc    Update report status
// @route   PUT /api/reports/:id/status
// @access  Private/Admin
export const updateReportStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes, actionTaken, priority } = req.body;

  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  // Update fields
  if (status) report.status = status;
  if (adminNotes) report.adminNotes = adminNotes;
  if (actionTaken) report.actionTaken = actionTaken;
  if (priority) report.priority = priority;

  // Set resolved timestamp and user if status is changed to Resolved
  if (status === 'Resolved' && report.status !== 'Resolved') {
    report.resolvedAt = new Date();
    report.resolvedBy = req.user._id;
  }

  await report.save();

  res.json({
    success: true,
    message: 'Report status updated successfully',
    data: report,
  });
});

// @desc    Update report details
// @route   PUT /api/reports/:id
// @access  Private/Admin
export const updateReport = asyncHandler(async (req, res) => {
  const { status, priority, adminNotes, actionTaken } = req.body;

  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  // Update fields
  if (status) report.status = status;
  if (priority) report.priority = priority;
  if (adminNotes) report.adminNotes = adminNotes;
  if (actionTaken) report.actionTaken = actionTaken;

  // Set resolved timestamp and user if status is changed to Resolved
  if (status === 'Resolved' && report.status !== 'Resolved') {
    report.resolvedAt = new Date();
    report.resolvedBy = req.user._id;
  }

  await report.save();

  res.json({
    success: true,
    message: 'Report updated successfully',
    data: report,
  });
});

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private/Admin
export const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  await Report.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Report deleted successfully',
  });
});

// @desc    Get my reports (User's own reports)
// @route   GET /api/reports/my-reports
// @access  Private
export const getMyReports = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  // Build filter object
  const filter = { reportedBy: req.user._id };
  if (status) filter.status = status;

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const reports = await Report.find(filter)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Report.countDocuments(filter);

  res.json({
    success: true,
    data: reports,
    pagination: {
      current: parseInt(page),
      total: Math.ceil(total / limit),
      count: reports.length,
      totalRecords: total,
    },
  });
});

// @desc    Get report statistics
// @route   GET /api/reports/stats
// @access  Private/Admin
export const getReportStats = asyncHandler(async (req, res) => {
  const statusStats = await Report.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const reasonStats = await Report.aggregate([
    {
      $group: {
        _id: '$reason',
        count: { $sum: 1 },
      },
    },
  ]);

  const recentReports = await Report.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('property reason status createdAt reportedBy')
    .populate('property', 'title')
    .populate('reportedBy', 'name');

  const totalReports = await Report.countDocuments();
  const pendingReports = await Report.countDocuments({ status: 'Pending' });
  const resolvedReports = await Report.countDocuments({ status: 'Resolved' });

  res.json({
    success: true,
    data: {
      statusStats,
      reasonStats,
      recentReports,
      totalReports,
      pendingReports,
      resolvedReports,
    },
  });
});
