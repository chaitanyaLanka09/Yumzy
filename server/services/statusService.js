const crypto = require('crypto');
const Donation = require('../models/Donation');
const DonationRequest = require('../models/DonationRequest');
const Notification = require('../models/Notification');
const { logAction } = require('../middleware/auth');

/**
 * Generate human-readable unique pickup code (e.g. YZ-PK-7B2F4)
 */
const generatePickupCode = () => {
  const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `YZ-PK-${hex}`;
};

/**
 * State Transition Matrix
 */
const VALID_TRANSITIONS = {
  PENDING: ['ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED'],
  ACCEPTED: ['READY_FOR_PICKUP', 'CANCELLED', 'EXPIRED'],
  READY_FOR_PICKUP: ['COMPLETED', 'CANCELLED'],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
  EXPIRED: []
};

/**
 * Validate whether a transition is permitted
 */
const canTransition = (currentStatus, targetStatus) => {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
};

/**
 * Create a new request and validate inventory
 */
const createRequest = async ({ donationId, ngoUser, requestedQuantity, pickupTime, message }) => {
  const donation = await Donation.findById(donationId);
  if (!donation) {
    throw new Error('Donation listing not found');
  }

  if (donation.status === 'EXPIRED' || new Date(donation.pickupDeadline) < new Date()) {
    throw new Error('This donation has expired and can no longer be requested');
  }

  if (donation.status === 'CANCELLED' || donation.status === 'COMPLETED') {
    throw new Error('This donation is no longer active');
  }

  if (requestedQuantity <= 0) {
    throw new Error('Requested quantity must be greater than zero');
  }

  if (requestedQuantity > donation.availableQuantity) {
    throw new Error(`Requested quantity (${requestedQuantity} ${donation.unit}) exceeds available quantity (${donation.availableQuantity} ${donation.unit})`);
  }

  // Create request with initial status PENDING
  const request = await DonationRequest.create({
    donationId: donation._id,
    donorId: donation.donorId,
    ngoId: ngoUser._id,
    requestedQuantity,
    unit: donation.unit,
    pickupTime: new Date(pickupTime),
    message: message || '',
    status: 'PENDING',
    history: [
      {
        status: 'PENDING',
        changedBy: ngoUser._id,
        note: `Request submitted for ${requestedQuantity} ${donation.unit}`,
        timestamp: new Date()
      }
    ]
  });

  // Notify donor
  await Notification.create({
    recipientId: donation.donorId,
    title: 'New Food Donation Request',
    message: `${ngoUser.name} requested ${requestedQuantity} ${donation.unit} of "${donation.foodName}"`,
    type: 'request_created',
    relatedDonationId: donation._id,
    relatedRequestId: request._id
  });

  await logAction(ngoUser._id, 'SUBMIT_REQUEST', 'DonationRequest', request._id, {
    donationId: donation._id,
    requestedQuantity
  });

  return request;
};

/**
 * Donor accepts a pending request
 * Atomically reserves inventory
 */
const acceptRequest = async (requestId, donorUser) => {
  const request = await DonationRequest.findById(requestId);
  if (!request) {
    throw new Error('Request not found');
  }

  if (request.donorId.toString() !== donorUser._id.toString() && donorUser.role !== 'admin') {
    throw new Error('Not authorized to accept this request');
  }

  if (request.status !== 'PENDING') {
    throw new Error(`Cannot accept request in '${request.status}' state`);
  }

  // Atomically check and reserve inventory on the Donation model
  // Only decrement if availableQuantity >= requestedQuantity
  const updatedDonation = await Donation.findOneAndUpdate(
    {
      _id: request.donationId,
      availableQuantity: { $gte: request.requestedQuantity },
      status: { $nin: ['EXPIRED', 'CANCELLED', 'COMPLETED'] }
    },
    {
      $inc: {
        availableQuantity: -request.requestedQuantity,
        reservedQuantity: request.requestedQuantity
      }
    },
    { new: true }
  );

  if (!updatedDonation) {
    throw new Error('Insufficient available inventory or donation is no longer active');
  }

  // Update donation status based on remaining available quantity
  if (updatedDonation.availableQuantity === 0) {
    updatedDonation.status = 'RESERVED';
  } else {
    updatedDonation.status = 'PARTIALLY_RESERVED';
  }
  await updatedDonation.save();

  // Generate pickup code
  const pickupCode = generatePickupCode();

  request.status = 'ACCEPTED';
  request.pickupCode = pickupCode;
  request.history.push({
    status: 'ACCEPTED',
    changedBy: donorUser._id,
    note: `Request accepted by donor. Pickup Code: ${pickupCode}`,
    timestamp: new Date()
  });
  await request.save();

  // Notify NGO
  await Notification.create({
    recipientId: request.ngoId,
    title: 'Donation Request Accepted!',
    message: `Your request for "${updatedDonation.foodName}" was accepted. Pickup Code: ${pickupCode}`,
    type: 'request_accepted',
    relatedDonationId: updatedDonation._id,
    relatedRequestId: request._id
  });

  await logAction(donorUser._id, 'ACCEPT_REQUEST', 'DonationRequest', request._id, {
    pickupCode,
    reservedQuantity: request.requestedQuantity
  });

  return { request, donation: updatedDonation };
};

/**
 * Donor rejects a pending request
 */
const rejectRequest = async (requestId, donorUser, reason = '') => {
  const request = await DonationRequest.findById(requestId);
  if (!request) {
    throw new Error('Request not found');
  }

  if (request.donorId.toString() !== donorUser._id.toString() && donorUser.role !== 'admin') {
    throw new Error('Not authorized to reject this request');
  }

  if (request.status !== 'PENDING') {
    throw new Error(`Cannot reject request in '${request.status}' state`);
  }

  request.status = 'REJECTED';
  request.history.push({
    status: 'REJECTED',
    changedBy: donorUser._id,
    note: reason ? `Rejected by donor: ${reason}` : 'Rejected by donor',
    timestamp: new Date()
  });
  await request.save();

  const donation = await Donation.findById(request.donationId);

  // Notify NGO
  await Notification.create({
    recipientId: request.ngoId,
    title: 'Donation Request Rejected',
    message: `Your request for "${donation ? donation.foodName : 'food item'}" was declined. ${reason ? `Reason: ${reason}` : ''}`,
    type: 'request_rejected',
    relatedDonationId: request.donationId,
    relatedRequestId: request._id
  });

  await logAction(donorUser._id, 'REJECT_REQUEST', 'DonationRequest', request._id, { reason });
  return request;
};

/**
 * Cancel request (by NGO if pending/accepted, or by Donor if accepted)
 * Releases reserved inventory if previously accepted
 */
const cancelRequest = async (requestId, user, reason = '') => {
  const request = await DonationRequest.findById(requestId);
  if (!request) {
    throw new Error('Request not found');
  }

  const isNgo = request.ngoId.toString() === user._id.toString();
  const isDonor = request.donorId.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isNgo && !isDonor && !isAdmin) {
    throw new Error('Not authorized to cancel this request');
  }

  if (request.status === 'COMPLETED' || request.status === 'REJECTED' || request.status === 'CANCELLED') {
    throw new Error(`Cannot cancel request in '${request.status}' state`);
  }

  const previousStatus = request.status;

  // If request was ACCEPTED or READY_FOR_PICKUP, restore reserved inventory to availableQuantity
  if (previousStatus === 'ACCEPTED' || previousStatus === 'READY_FOR_PICKUP') {
    await Donation.findByIdAndUpdate(request.donationId, {
      $inc: {
        availableQuantity: request.requestedQuantity,
        reservedQuantity: -request.requestedQuantity
      },
      $set: {
        status: 'AVAILABLE'
      }
    });
  }

  request.status = 'CANCELLED';
  request.history.push({
    status: 'CANCELLED',
    changedBy: user._id,
    note: reason ? `Cancelled by ${user.role}: ${reason}` : `Cancelled by ${user.role}`,
    timestamp: new Date()
  });
  await request.save();

  const recipientToNotify = isNgo ? request.donorId : request.ngoId;
  const donation = await Donation.findById(request.donationId);

  await Notification.create({
    recipientId: recipientToNotify,
    title: 'Donation Request Cancelled',
    message: `Request for "${donation ? donation.foodName : 'food donation'}" was cancelled by ${user.name}.`,
    type: 'request_cancelled',
    relatedDonationId: request.donationId,
    relatedRequestId: request._id
  });

  await logAction(user._id, 'CANCEL_REQUEST', 'DonationRequest', request._id, { reason, previousStatus });
  return request;
};

/**
 * Donor marks donation READY_FOR_PICKUP
 */
const markReadyForPickup = async (requestId, donorUser, instructions = '') => {
  const request = await DonationRequest.findById(requestId);
  if (!request) {
    throw new Error('Request not found');
  }

  if (request.donorId.toString() !== donorUser._id.toString() && donorUser.role !== 'admin') {
    throw new Error('Not authorized to update pickup status');
  }

  if (request.status !== 'ACCEPTED') {
    throw new Error(`Can only mark ready for pickup when request is in ACCEPTED status (current: ${request.status})`);
  }

  request.status = 'READY_FOR_PICKUP';
  request.history.push({
    status: 'READY_FOR_PICKUP',
    changedBy: donorUser._id,
    note: instructions ? `Food packed and ready. Instructions: ${instructions}` : 'Food packed and ready for collection',
    timestamp: new Date()
  });
  await request.save();

  const donation = await Donation.findById(request.donationId);

  await Notification.create({
    recipientId: request.ngoId,
    title: 'Food Donation Ready for Pickup!',
    message: `"${donation ? donation.foodName : 'Your requested food'}" is prepared and ready. Use Pickup Code: ${request.pickupCode}`,
    type: 'ready_for_pickup',
    relatedDonationId: request.donationId,
    relatedRequestId: request._id
  });

  await logAction(donorUser._id, 'MARK_READY_FOR_PICKUP', 'DonationRequest', request._id, { instructions });
  return request;
};

/**
 * Dual Confirmation for Pickup
 * Donor confirms handover (donorPickupConfirmed = true)
 * NGO confirms collection (ngoPickupConfirmed = true)
 * When both are true, request transitions to COMPLETED.
 */
const confirmPickup = async (requestId, user, confirmationCode = '') => {
  const request = await DonationRequest.findById(requestId);
  if (!request) {
    throw new Error('Request not found');
  }

  if (request.status !== 'READY_FOR_PICKUP' && request.status !== 'ACCEPTED') {
    throw new Error(`Cannot confirm pickup for request in '${request.status}' status`);
  }

  const isNgo = request.ngoId.toString() === user._id.toString();
  const isDonor = request.donorId.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isNgo && !isDonor && !isAdmin) {
    throw new Error('Not authorized to confirm this pickup');
  }

  // If NGO confirms, validate pickup code if provided
  if (isNgo && confirmationCode && confirmationCode.trim().toUpperCase() !== request.pickupCode.toUpperCase()) {
    throw new Error('Invalid pickup code. Please check code provided by donor.');
  }

  if (isDonor || isAdmin) {
    request.donorPickupConfirmed = true;
    request.history.push({
      status: request.status,
      changedBy: user._id,
      note: 'Donor confirmed food handover to recipient NGO',
      timestamp: new Date()
    });
  }

  if (isNgo || isAdmin) {
    request.ngoPickupConfirmed = true;
    request.history.push({
      status: request.status,
      changedBy: user._id,
      note: 'NGO confirmed receipt and collection of food',
      timestamp: new Date()
    });
  }

  let becameCompleted = false;

  // If both parties confirmed, complete the request!
  if (request.donorPickupConfirmed && request.ngoPickupConfirmed) {
    request.status = 'COMPLETED';
    becameCompleted = true;
    request.history.push({
      status: 'COMPLETED',
      changedBy: user._id,
      note: 'Both parties confirmed. Donation successfully completed and redistributed!',
      timestamp: new Date()
    });

    // Check donation model status
    const donation = await Donation.findById(request.donationId);
    if (donation) {
      if (donation.availableQuantity === 0 && donation.reservedQuantity <= request.requestedQuantity) {
        donation.status = 'COMPLETED';
        await donation.save();
      }
    }

    // Send notifications to both parties
    await Notification.create({
      recipientId: request.donorId,
      title: 'Donation Completed & Confirmed!',
      message: `Pickup confirmed for request #${request.pickupCode}. Thank you for preventing food waste!`,
      type: 'completed',
      relatedDonationId: request.donationId,
      relatedRequestId: request._id
    });

    await Notification.create({
      recipientId: request.ngoId,
      title: 'Donation Successfully Received!',
      message: `Pickup confirmed for request #${request.pickupCode}. Impact logged to your organization.`,
      type: 'completed',
      relatedDonationId: request.donationId,
      relatedRequestId: request._id
    });
  } else {
    // Notify the other party that one confirmation has been recorded
    const otherPartyId = isDonor ? request.ngoId : request.donorId;
    await Notification.create({
      recipientId: otherPartyId,
      title: 'Pickup Confirmation Pending Your Approval',
      message: `${user.name} has confirmed their side of the pickup. Please confirm to finalize this donation.`,
      type: 'pickup_confirmed',
      relatedDonationId: request.donationId,
      relatedRequestId: request._id
    });
  }

  await request.save();

  await logAction(user._id, becameCompleted ? 'COMPLETE_PICKUP' : 'PARTIAL_PICKUP_CONFIRM', 'DonationRequest', request._id, {
    donorPickupConfirmed: request.donorPickupConfirmed,
    ngoPickupConfirmed: request.ngoPickupConfirmed,
    becameCompleted
  });

  return { request, becameCompleted };
};

module.exports = {
  createRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  markReadyForPickup,
  confirmPickup,
  canTransition,
  generatePickupCode
};
