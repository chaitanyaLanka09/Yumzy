const Report = require('../models/Report');
const Donation = require('../models/Donation');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { logAction } = require('../middleware/auth');

// @desc    Submit a report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    if (!targetType || !targetId || !reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide targetType, targetId, reason, and description'
      });
    }

    const report = await Report.create({
      reportedBy: req.user._id,
      targetType,
      targetId,
      reason,
      description,
      status: 'pending'
    });

    // If target is donation, mark isReported flag
    if (targetType === 'donation') {
      await Donation.findByIdAndUpdate(targetId, { isReported: true });
    }

    // Notify all admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        recipientId: admin._id,
        title: 'New Safety / Content Report Submitted',
        message: `A user reported a ${targetType} for "${reason}". Please review in admin panel.`,
        type: 'report_alert'
      });
    }

    await logAction(req.user._id, 'SUBMIT_REPORT', 'Report', report._id, { targetType, reason });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our team will review the issue promptly.',
      report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports (Admin)
// @route   GET /api/reports
// @access  Private/Admin
const getReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('reportedBy', 'name email role')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Attach target details if possible
    const enrichedReports = await Promise.all(
      reports.map(async (rep) => {
        let targetDetails = null;
        if (rep.targetType === 'donation') {
          targetDetails = await Donation.findById(rep.targetId).select('foodName status donorId');
        } else if (rep.targetType === 'user') {
          targetDetails = await User.findById(rep.targetId).select('name email role isActive');
        }
        return {
          ...rep.toObject(),
          targetDetails
        };
      })
    );

    res.json({
      success: true,
      count: enrichedReports.length,
      total,
      reports: enrichedReports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve or dismiss a report (Admin)
// @route   PATCH /api/reports/:id/resolve
// @access  Private/Admin
const resolveReport = async (req, res, next) => {
  try {
    const { status, resolution, takeAction } = req.body;

    if (!['resolved', 'dismissed', 'investigating'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = status;
    report.resolution = resolution || 'Reviewed by admin';
    report.reviewedBy = req.user._id;
    await report.save();

    // If takeAction is requested, e.g. close listing or deactivate user
    if (takeAction === 'close_listing' && report.targetType === 'donation') {
      await Donation.findByIdAndUpdate(report.targetId, { status: 'CANCELLED' });
    } else if (takeAction === 'suspend_user' && report.targetType === 'user') {
      await User.findByIdAndUpdate(report.targetId, { isActive: false });
    }

    await logAction(req.user._id, 'RESOLVE_REPORT', 'Report', report._id, { status, resolution, takeAction });

    res.json({
      success: true,
      message: `Report marked as ${status}`,
      report
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getReports,
  resolveReport
};
