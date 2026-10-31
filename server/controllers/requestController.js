const DonationRequest = require('../models/DonationRequest');
const Donation = require('../models/Donation');
const User = require('../models/User');
const Organization = require('../models/Organization');
const statusService = require('../services/statusService');

// @desc    Submit a new donation request
// @route   POST /api/requests
// @access  Private/NGO
const createRequest = async (req, res, next) => {
  try {
    const { donationId, requestedQuantity, pickupTime, message } = req.body;

    if (!donationId || !requestedQuantity || !pickupTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide donation ID, requested quantity, and estimated pickup time'
      });
    }

    const request = await statusService.createRequest({
      donationId,
      ngoUser: req.user,
      requestedQuantity: Number(requestedQuantity),
      pickupTime,
      message
    });

    res.status(201).json({
      success: true,
      request
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get NGO's requested donations
// @route   GET /api/requests/my
// @access  Private/NGO
const getMyRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { ngoId: req.user._id };
    if (status) query.status = status;

    const requests = await DonationRequest.find(query)
      .populate({
        path: 'donationId',
        populate: { path: 'organizationId' }
      })
      .populate('donorId', 'name phone email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donor's incoming requests
// @route   GET /api/requests/incoming
// @access  Private/Donor
const getIncomingRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { donorId: req.user._id };
    if (status) query.status = status;

    const requests = await DonationRequest.find(query)
      .populate('donationId')
      .populate('ngoId', 'name email phone')
      .sort({ createdAt: -1 });

    // Attach NGO organization info
    const requestsWithOrg = await Promise.all(
      requests.map(async (r) => {
        const ngoOrg = await Organization.findOne({ userId: r.ngoId?._id });
        return {
          ...r.toObject(),
          ngoOrganization: ngoOrg
        };
      })
    );

    res.json({
      success: true,
      count: requestsWithOrg.length,
      requests: requestsWithOrg
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single request by ID
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = async (req, res, next) => {
  try {
    const request = await DonationRequest.findById(req.params.id)
      .populate({
        path: 'donationId',
        populate: { path: 'organizationId' }
      })
      .populate('donorId', 'name phone email')
      .populate('ngoId', 'name phone email')
      .populate('history.changedBy', 'name role');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Access authorization: donor, ngo, or admin
    const isOwner =
      request.donorId._id.toString() === req.user._id.toString() ||
      request.ngoId._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this request' });
    }

    const ngoOrg = await Organization.findOne({ userId: request.ngoId._id });
    const donorOrg = await Organization.findOne({ userId: request.donorId._id });

    res.json({
      success: true,
      request: {
        ...request.toObject(),
        ngoOrganization: ngoOrg,
        donorOrganization: donorOrg
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Donor accepts request
// @route   PATCH /api/requests/:id/accept
// @access  Private/Donor
const acceptRequest = async (req, res, next) => {
  try {
    const result = await statusService.acceptRequest(req.params.id, req.user);
    res.json({
      success: true,
      message: 'Request accepted successfully. Quantity reserved.',
      request: result.request,
      pickupCode: result.request.pickupCode
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Donor rejects request
// @route   PATCH /api/requests/:id/reject
// @access  Private/Donor
const rejectRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const request = await statusService.rejectRequest(req.params.id, req.user, reason);
    res.json({
      success: true,
      message: 'Request rejected.',
      request
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel request
// @route   PATCH /api/requests/:id/cancel
// @access  Private
const cancelRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const request = await statusService.cancelRequest(req.params.id, req.user, reason);
    res.json({
      success: true,
      message: 'Request cancelled. Reserved inventory restored if applicable.',
      request
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Donor marks food ready for pickup
// @route   PATCH /api/requests/:id/ready
// @access  Private/Donor
const markReady = async (req, res, next) => {
  try {
    const { instructions } = req.body;
    const request = await statusService.markReadyForPickup(req.params.id, req.user, instructions);
    res.json({
      success: true,
      message: 'Donation marked ready for pickup. Recipient notified.',
      request
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Confirm pickup (Dual confirmation)
// @route   PATCH /api/requests/:id/confirm-pickup
// @access  Private
const confirmPickup = async (req, res, next) => {
  try {
    const { confirmationCode } = req.body;
    const result = await statusService.confirmPickup(req.params.id, req.user, confirmationCode);
    res.json({
      success: true,
      message: result.becameCompleted
        ? 'Pickup fully confirmed by both parties! Donation successfully completed.'
        : 'Your pickup confirmation has been recorded. Waiting for the other party to confirm.',
      request: result.request,
      isCompleted: result.becameCompleted
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getIncomingRequests,
  getRequestById,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  markReady,
  confirmPickup
};
