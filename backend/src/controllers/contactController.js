import asyncHandler from 'express-async-handler';
import Contact from '../models/Contact.js';
import { validationResult } from 'express-validator';

// @desc    Create new contact submission
// @route   POST /api/contacts
// @access  Public
export const createContact = asyncHandler(async (req, res) => {
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

  const { name, email, phone, subject, message, category, priority } = req.body;

  const contact = await Contact.create({
    name,
    email,
    phone,
    subject,
    message,
    category: category || 'General Inquiry',
    priority: priority || 'Medium',
  });

  res.status(201).json({
    success: true,
    message: 'Contact submission created successfully',
    data: contact,
  });
});

// @desc    Get all contacts (Admin only)
// @route   GET /api/contacts
// @access  Private/Admin
export const getAllContacts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    category,
    priority,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  // Build filter object
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    populate: {
      path: 'respondedBy',
      select: 'name email',
    },
  };

  const contacts = await Contact.find(filter)
    .populate(options.populate)
    .sort(options.sort)
    .limit(options.limit * 1)
    .skip((options.page - 1) * options.limit);

  const total = await Contact.countDocuments(filter);

  res.json({
    success: true,
    data: contacts,
    pagination: {
      current: options.page,
      total: Math.ceil(total / options.limit),
      count: contacts.length,
      totalRecords: total,
    },
  });
});

// @desc    Get single contact by ID
// @route   GET /api/contacts/:id
// @access  Private/Admin
export const getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id).populate(
    'respondedBy',
    'name email'
  );

  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }

  res.json({
    success: true,
    data: contact,
  });
});

// @desc    Update contact status
// @route   PUT /api/contacts/:id/status
// @access  Private/Admin
export const updateContactStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }

  // Update fields
  contact.status = status || contact.status;
  if (adminNotes) contact.adminNotes = adminNotes;

  // Set responded timestamp and user if status is changed to Replied
  if (status === 'Replied' && contact.status !== 'Replied') {
    contact.respondedAt = new Date();
    contact.respondedBy = req.user._id;
  }

  await contact.save();

  res.json({
    success: true,
    message: 'Contact status updated successfully',
    data: contact,
  });
});

// @desc    Update contact details
// @route   PUT /api/contacts/:id
// @access  Private/Admin
export const updateContact = asyncHandler(async (req, res) => {
  const { status, priority, category, adminNotes } = req.body;

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }

  // Update fields
  if (status) contact.status = status;
  if (priority) contact.priority = priority;
  if (category) contact.category = category;
  if (adminNotes) contact.adminNotes = adminNotes;

  // Set responded timestamp and user if status is changed to Replied
  if (status === 'Replied' && contact.status !== 'Replied') {
    contact.respondedAt = new Date();
    contact.respondedBy = req.user._id;
  }

  await contact.save();

  res.json({
    success: true,
    message: 'Contact updated successfully',
    data: contact,
  });
});

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }

  await Contact.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Contact deleted successfully',
  });
});

// @desc    Get contact statistics
// @route   GET /api/contacts/stats
// @access  Private/Admin
export const getContactStats = asyncHandler(async (req, res) => {
  const stats = await Contact.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const categoryStats = await Contact.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
  ]);

  const recentContacts = await Contact.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name email subject status createdAt');

  res.json({
    success: true,
    data: {
      statusStats: stats,
      categoryStats,
      recentContacts,
      totalContacts: await Contact.countDocuments(),
    },
  });
});
